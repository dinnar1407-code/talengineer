require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

async function callGemini(prompt, temperature = 0.7, maxTokens = 800) {
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    // Node 18+ 已内置全局 fetch，无需 node-fetch 依赖（审计 P3：冗余依赖移除）
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens }
    };

    // Use JSON schema for tools/structured output
    if (prompt.includes('Output EXACTLY this JSON structure')) {
        payload.generationConfig.responseMimeType = "application/json";
        // 放大 token 上限防 JSON 被截断（截断→解析失败）。原来硬编码 2000 会把调用方
        // 传入的更大值（如课文/长考卷的 4000）反而压小，导致长内容截断 500。改为取下限
        // 2000 与调用方值的较大者：短 JSON 仍保底 2000，长内容尊重调用方要求的上限。
        payload.generationConfig.maxOutputTokens = Math.max(maxTokens, 2000);
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function parseDemand(rawDemand) {
    const prompt = `You are an expert AI Project Manager for an industrial automation service platform.
A client (typically a Chinese equipment manufacturer) has submitted a raw, unstructured description of their needs.
Your task is to analyze this raw text and convert it into a standardized, professional Statement of Work (SoW) in English.
You also need to suggest 3-4 logical project milestones with appropriate payment percentages that total 100%.

Raw Demand:
"""
${rawDemand}
"""

Output a JSON object EXACTLY in the following format (no markdown blocks, just raw JSON):
{
  "title": "A concise, professional title for the project in English",
  "role_required": "Specific technical roles and skills required (e.g., Senior PLC Programmer, Siemens S7-1500, KUKA Robotics)",
  "standardized_description": "A clear, professional description of the project scope, objectives, and requirements in English.",
  "milestones": [
    { "phase_name": "Name of Phase 1 (e.g., Site Survey & Setup)", "percentage": 0.20 },
    { "phase_name": "Name of Phase 2 (e.g., PLC Logic Implementation)", "percentage": 0.40 },
    { "phase_name": "Name of Phase 3 (e.g., Testing & Commissioning)", "percentage": 0.40 }
  ]
}`;

    const resultText = await callGemini(prompt, 0.2, 2000);
    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanedText);
    } catch(err) {
        console.error("JSON parsing error on string: ", cleanedText);
        throw err;
    }
}

async function generateTechQuestion(skills, level, lang) {
    let langInstruction = '';
    if (lang === 'zh') langInstruction = 'You must output the question entirely in Chinese.';
    else if (lang === 'es') langInstruction = 'You must output the question entirely in Spanish.';
    else langInstruction = 'You must output the question entirely in English.';

    const prompt = `You are a strict technical interviewer for Industrial Automation.
The candidate claims the following skills: ${skills}
Their claimed level is: ${level}

Generate exactly ONE practical, highly-technical scenario question to test their knowledge.
Do NOT output any greeting or introductory text. Just the question.
${langInstruction}`;

    const text = await callGemini(prompt, 0.7, 200);
    return text.trim() || "Describe a complex automation project you successfully delivered.";
}

async function gradeTechAnswer(question, answer, lang) {
    let langInstruction = '';
    if (lang === 'zh') langInstruction = 'Provide your feedback in Chinese.';
    else if (lang === 'es') langInstruction = 'Provide your feedback in Spanish.';
    else langInstruction = 'Provide your feedback in English.';

    const prompt = `You are grading a technical interview for an Industrial Automation Engineer.
Question asked: ${question}
Candidate's Answer: ${answer}

Evaluate the answer. Does it show genuine field experience and technical competence?
${langInstruction}
Output a JSON response exactly in this format (no markdown blocks, just raw JSON):
{"passed": true/false, "score": <0-100>, "feedback": "<one short sentence of feedback>"}
`;

    const text = await callGemini(prompt, 0.2, 150);
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        // fail-closed（2026-07-16 修复）：此前解析失败默认 {passed:true, score:85}——
        // 分数现在会换成服务端签名的 score_token 落库进撮合排名，Gemini 输出异常时
        // 白送 85 分等于开后门。改为判 0 分不通过 + 明确提示重试，宁可让用户再答一次。
        console.error('[AI] gradeTechAnswer 返回无法解析，fail-closed 判 0:', cleanedText.slice(0, 200));
        return { passed: false, score: 0, feedback: 'Grading service returned an invalid result. Please try again.' };
    }
}

// ── 培训认证：按方向×等级生成整卷考题（三题型混合）───────────────────────────
// mix = {choice, scenario, analysis}：选择题（4 选 1 带答案键与解析，服务端判分）、
// 场景短答题、深度分析题（后两类 AI 评分）。发证考核，出题失败必须 throw
// （fail-closed：考不成就不开考，绝不能用兜底题目发证书）。
async function generateExamQuestions(trackName, level, mix, lang) {
    const langInstruction = lang === 'zh' ? 'Output all questions, options and explanations entirely in Chinese.'
        : lang === 'es' ? 'Output all questions, options and explanations entirely in Spanish.'
        : 'Output all questions, options and explanations entirely in English.';
    const levelDesc = level === 1 ? 'entry level (fundamentals, safety basics, common tooling)'
        : level === 2 ? 'intermediate level (independent commissioning, troubleshooting, integration)'
        : 'advanced level (architecture decisions, complex fault diagnosis, leading on-site delivery)';
    const total = mix.choice + mix.scenario + mix.analysis;

    const prompt = `You are the certification examiner for an industrial automation engineering platform.
Track: ${trackName}
Certification level: L${level} — ${levelDesc}

Generate exactly ${total} exam questions to certify a field engineer at this level, composed of:
1. Exactly ${mix.choice} multiple-choice questions ("type":"choice"): 4 options each, exactly one correct; include "answer_index" (0-3) and a one-sentence "explanation" of the correct answer. Distractors must be plausible field mistakes.
2. Exactly ${mix.scenario} short-answer scenario questions ("type":"scenario"): real field situations answerable in a few sentences.
3. Exactly ${mix.analysis} deep analysis questions ("type":"analysis"): complex multi-part problems (root-cause analysis, design trade-offs, or commissioning plans) requiring a structured written answer.

Requirements:
- Every question must test real field competence (not textbook trivia), specific to the track.
- Difficulty must match the certification level described above.
${langInstruction}

Output EXACTLY this JSON structure (no markdown blocks, just raw JSON), choice questions first, then scenario, then analysis:
{"questions": [{"type": "choice", "q": "...", "options": ["...","...","...","..."], "answer_index": 0, "explanation": "..."}, {"type": "scenario", "q": "..."}, {"type": "analysis", "q": "..."}]}`;

    const text = await callGemini(prompt, 0.7, 4000);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned); // 解析失败直接抛给调用方（不开考）
    const questions = (parsed.questions || []).filter((it) => it && typeof it.q === 'string' && it.q.trim());

    // 逐类校验数量与选择题结构（任何缺陷都不开考）
    const byType = { choice: 0, scenario: 0, analysis: 0 };
    for (const it of questions) {
        if (!['choice', 'scenario', 'analysis'].includes(it.type)) throw new Error(`Unknown question type: ${it.type}`);
        if (it.type === 'choice') {
            const ok = Array.isArray(it.options) && it.options.length === 4
                && Number.isInteger(it.answer_index) && it.answer_index >= 0 && it.answer_index <= 3;
            if (!ok) throw new Error('Malformed choice question (need 4 options + valid answer_index)');
        }
        byType[it.type] += 1;
    }
    if (byType.choice !== mix.choice || byType.scenario !== mix.scenario || byType.analysis !== mix.analysis) {
        throw new Error(`Exam mix mismatch: got ${JSON.stringify(byType)}, expected ${JSON.stringify(mix)}`);
    }
    return questions;
}

// ── 培训认证：生成学习路径（培训内容 MVP：AI 大纲，结果由调用方落库缓存）──────
// 失败 throw（学习路径不涉发证，调用方可直接把错误转成"稍后再试"）。
async function generateLearningPath(trackName, level, lang) {
    const langInstruction = lang === 'zh' ? 'Output everything in Chinese.'
        : lang === 'es' ? 'Output everything in Spanish.'
        : 'Output everything in English.';

    const prompt = `You are the training director of an industrial automation engineering platform.
Design a self-study learning path for a field engineer preparing for the L${level} certification exam in: ${trackName}.
Level guide: L1 = fundamentals & safety; L2 = independent commissioning & troubleshooting; L3 = architecture & leading on-site delivery.

${langInstruction}
Output EXACTLY this JSON structure (no markdown blocks, just raw JSON):
{"title": "<path title>", "estimated_hours": <number>, "modules": [{"name": "<module name>", "topics": ["<topic>", ...], "practice": "<one hands-on practice task>"}, ...4-6 modules...], "exam_tips": "<two sentences on what the exam focuses on>"}`;

    const text = await callGemini(prompt, 0.5, 2000);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.modules) || parsed.modules.length === 0) {
        throw new Error('Learning path generation returned no modules');
    }
    return parsed;
}

// ── 培训认证：知识点详细课程（点击大纲里的知识点 → 生成完整课文，调用方落库缓存）──
async function generateLessonContent(trackName, level, moduleName, topic, lang) {
    const langInstruction = lang === 'zh' ? 'Write the entire lesson in Chinese.'
        : lang === 'es' ? 'Write the entire lesson in Spanish.'
        : 'Write the entire lesson in English.';

    const prompt = `You are writing a self-study lesson for an industrial automation field engineer platform.
Track: ${trackName} (certification level L${level})
Module: ${moduleName}
Topic: ${topic}

Write a practical, field-oriented lesson on this topic. Focus on what an engineer actually does on site — procedures, gotchas, safety, real equipment. No fluff.
${langInstruction}

Output EXACTLY this JSON structure (no markdown blocks, just raw JSON):
{"title": "<lesson title>", "sections": [{"heading": "<section heading>", "body": "<2-4 paragraphs of lesson text>"}, ...3-4 sections...], "key_points": ["<takeaway>", ...3-5 items...], "field_example": "<one concrete on-site example or war story, a short paragraph>"}`;

    const text = await callGemini(prompt, 0.5, 4000);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new Error('Lesson generation returned no sections');
    }
    return parsed;
}

// ── 培训认证：模块随堂 quiz（练习性质；choice 结构与考核选择题一致，服务端判分）──
async function generateModuleQuiz(trackName, level, moduleName, topics, count, lang) {
    const langInstruction = lang === 'zh' ? 'Output all questions, options and explanations entirely in Chinese.'
        : lang === 'es' ? 'Output all questions, options and explanations entirely in Spanish.'
        : 'Output all questions, options and explanations entirely in English.';

    const prompt = `You are writing a practice quiz for an industrial automation training module.
Track: ${trackName} (certification level L${level})
Module: ${moduleName}
Topics covered: ${(topics || []).join('; ')}

Generate exactly ${count} multiple-choice questions testing practical understanding of this module.
Each question: 4 options, exactly one correct; include "answer_index" (0-3) and a one-sentence "explanation". Distractors must be plausible field mistakes.
${langInstruction}

Output EXACTLY this JSON structure (no markdown blocks, just raw JSON):
{"questions": [{"q": "...", "options": ["...","...","...","..."], "answer_index": 0, "explanation": "..."}]}`;

    const text = await callGemini(prompt, 0.6, 2500);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const questions = parsed.questions || [];
    for (const it of questions) {
        const ok = it && typeof it.q === 'string' && Array.isArray(it.options) && it.options.length === 4
            && Number.isInteger(it.answer_index) && it.answer_index >= 0 && it.answer_index <= 3;
        if (!ok) throw new Error('Malformed quiz question');
    }
    if (questions.length !== count) throw new Error(`Quiz generation returned ${questions.length}, expected ${count}`);
    return questions;
}

// ── 培训认证：整卷评分 ────────────────────────────────────────────────────────
// 逐题给 0-100 分 + 一句反馈。任何解析/数量异常都 throw——由调用方把考卷转入
// "待人工复核"状态（fail-closed：AI 评不了就人评，绝不默认通过）。
async function gradeExamAnswers(questions, answers, lang) {
    const langInstruction = lang === 'zh' ? 'Write all feedback in Chinese.'
        : lang === 'es' ? 'Write all feedback in Spanish.'
        : 'Write all feedback in English.';
    const qaText = questions.map((it, i) =>
        `Question ${i + 1}: ${it.q}\nAnswer ${i + 1}: ${(answers[i] && answers[i].a) || '(no answer)'}`
    ).join('\n\n');

    const prompt = `You are grading a certification exam for an industrial automation field engineer.
Grade strictly: certification authorizes real on-site work, so reward only answers showing genuine field competence. Empty or off-topic answers score 0.

${qaText}

${langInstruction}
Output EXACTLY this JSON structure (no markdown blocks, just raw JSON):
{"per_question": [{"score": <0-100>, "feedback": "<one short sentence>"}, ...], "overall_feedback": "<two sentences summarizing strengths and gaps>"}`;

    const text = await callGemini(prompt, 0.1, 2000);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned); // 解析失败抛给调用方转人工复核
    if (!Array.isArray(parsed.per_question) || parsed.per_question.length !== questions.length) {
        throw new Error(`Exam grading returned ${parsed.per_question?.length ?? 0} scores, expected ${questions.length}`);
    }
    return parsed;
}

async function generateMatchEmail(demandTitle, demandDesc, demandBudget, engName, engSkills, engRegion) {
    let langInstruction = engRegion.includes('MX') || engRegion.toLowerCase().includes('mexico') 
        ? "Write the email entirely in Spanish." 
        : "Write the email entirely in English.";

    const prompt = `You are the AI Matchmaker for an exclusive industrial automation platform called 'Talengineer'.
You need to write a highly persuasive and professional cold-outreach email to an engineer.

Engineer Details:
- Name: ${engName}
- Skills: ${engSkills}

Project Details:
- Title: ${demandTitle}
- Budget: ${demandBudget}
- Description snippet: ${demandDesc.substring(0, 200)}...

Instructions:
1. Address them by name.
2. Tell them why they were selected (match their skills to the project).
3. Mention the project title and budget to catch their attention.
4. Keep it concise (under 150 words).
5. End with a strong call-to-action to click a link to view the full project and accept it.
${langInstruction}`;

    const text = await callGemini(prompt, 0.7, 300);
    return text.trim();
}

async function translateTechnicalMessage(msgText, sourceLang, targetLang) {
    const prompt = `You are a professional technical translator for Industrial Automation and Engineering.
Translate the following message from ${sourceLang} to ${targetLang}.
Preserve technical accuracy for PLCs, robotics, electrical components, and software terms.
Do not add any conversational filler or markdown wrapping; return ONLY the translated text.

Original message:
"${msgText}"`;

    const text = await callGemini(prompt, 0.3, 300);
    return text.trim();
}

async function generateDailyReport(chatHistoryText) {
    const prompt = `You are Nexus-PM, an elite AI Project Manager for an industrial automation project.
Below is the recent chat history between the Chinese Supplier (Employer) and the Local Engineer (in Mexico/NA).
Based ONLY on this conversation, write a highly concise, professional Daily Progress Report IN CHINESE (简体中文) for the Chinese Employer.
Format your response using Markdown:
### 📊 今日现场进度简报 (Nexus-PM 自动生成)
- **当前状态**: [Brief status]
- **核心讨论点**: [1-2 bullet points]
- **潜在风险/阻塞点**: [Any issues mentioned? If none, say "无明显异常"]
- **下一步行动**: [What is happening next based on chat?]

Do not invent facts. If the chat is too short, just summarize what was said.

Chat History:
"""
${chatHistoryText}
"""`;

    const text = await callGemini(prompt, 0.2, 500);
    return text.trim();
}

async function generateNudgeMessage() {
    const prompt = `You are Nexus-PM, an AI Project Manager supervising a local automation engineer in Mexico.
Write a polite, professional, but firm message IN SPANISH to the local engineer.
Ask them for a brief daily status update on their current milestone tasks and if they are facing any blockers on-site today.
Keep it under 40 words. Do not wrap in markdown or quotes.`;

    const text = await callGemini(prompt, 0.7, 150);
    return text.trim();
}

async function analyzeQualityImage(base64Data, mimeType, projectContext) {
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `You are Nexus-QC, a strict AI Quality Control Inspector for industrial automation.
An engineer has uploaded a photo as proof of their on-site work completion for the milestone.
Context: ${projectContext || 'General electrical/PLC automation panel'}

Task: 
1. Carefully inspect the image for technical correctness.
2. Are there any visible red fault lights (like SF, BF on a Siemens PLC)?
3. Is the wiring messy or dangerous? Are cables labeled?
4. Output a strict PASS or REJECT verdict.

Output EXACTLY this JSON structure:
{"verdict": "PASS" or "REJECT", "feedback_es": "Technical explanation in Spanish for the engineer", "feedback_zh": "Technical explanation in Chinese for the employer"}
`;

    const payload = {
        contents: [
            { 
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: mimeType, data: base64Data } }
                ] 
            }
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300, responseMimeType: "application/json" }
    };

    // CRITICAL FIX: Upgraded to gemini-2.5-pro for advanced multimodal vision tasks
    // （Node 18+ 内置全局 fetch，node-fetch 依赖已移除）
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"verdict": "REJECT", "feedback_es": "Error analyzing image", "feedback_zh": "解析图片出错"}';
    try {
        return JSON.parse(resultText);
    } catch (e) {
        return { verdict: "REJECT", feedback_es: "Error in QC", feedback_zh: "质检返回格式错误" };
    }
}

async function parseGhostProfile(rawResumeText) {
    const prompt = `You are Nexus-HR, an AI talent scouter for an industrial automation platform.
Extract and standardize the following raw resume/forum post into a structured JSON profile for our database.

Raw Text:
"""
${rawResumeText}
"""

Output EXACTLY this JSON structure:
{
  "name": "Full Name",
  "skills": "Comma-separated core technical skills (e.g., Siemens S7, KUKA, SCADA)",
  "region": "Estimated region (e.g., Mexico (MX), United States (US), Canada (CA))",
  "level": "Junior (1-3 yrs), Mid-Level (3-7 yrs), or Senior (7+ yrs)",
  "rate": "Estimated hourly rate in USD based on experience (e.g., $65/hr)",
  "bio": "A professional 2-sentence summary of their background",
  "email": "Extracted or inferred email address"
}`;

    const text = await callGemini(prompt, 0.1, 800);
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Parse Error on text:", cleanedText);
        throw new Error("Failed to parse ghost profile JSON");
    }
}

async function generateGhostOutreachEmail(profile) {
    const isLatam = profile.region.includes('MX') || profile.region.includes('Mexico');
    const langInstruction = isLatam ? "Write the email entirely in Spanish." : "Write the email entirely in English.";

    const prompt = `You are a recruiter for Talengineer, an exclusive AI-driven cross-border marketplace connecting Chinese equipment suppliers with elite local engineers.
Write a highly persuasive cold-outreach email to an engineer whose public profile we just scraped.

Engineer Profile:
- Name: ${profile.name}
- Skills: ${profile.skills}

Instructions:
1. Address them by name.
2. Flatter them. Tell them our AI analyzed their background in ${profile.skills} and ranked them in the top 5% of their region.
3. Inform them we already created a pre-filled, VIP verified "Nexus Profile" for them.
4. Mention we have high-paying clients (Chinese manufacturers) looking for their exact skills right now.
5. Call to action: "Click here to claim your profile and view pending project invites."
6. Keep it professional, urgent, and concise (under 150 words).
${langInstruction}`;

    const text = await callGemini(prompt, 0.7, 300);
    return text.trim();
}

module.exports = { parseDemand, generateTechQuestion, gradeTechAnswer, generateExamQuestions, gradeExamAnswers, generateLearningPath, generateLessonContent, generateModuleQuiz, generateMatchEmail, translateTechnicalMessage, generateDailyReport, generateNudgeMessage, analyzeQualityImage, parseGhostProfile, generateGhostOutreachEmail };
