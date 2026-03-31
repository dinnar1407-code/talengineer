require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

async function callGemini(prompt, temperature = 0.7, maxTokens = 800) {
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    
    const fetch = (await import('node-fetch')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens }
    };

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
         return { passed: true, score: 85, feedback: "Acceptable answer." };
    }
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

    const fetch = (await import('node-fetch')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

module.exports = { parseDemand, generateTechQuestion, gradeTechAnswer, generateMatchEmail, translateTechnicalMessage, generateDailyReport, generateNudgeMessage, analyzeQualityImage };
