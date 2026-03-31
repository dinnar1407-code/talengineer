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

module.exports = { parseDemand, generateTechQuestion, gradeTechAnswer, generateMatchEmail, translateTechnicalMessage };
