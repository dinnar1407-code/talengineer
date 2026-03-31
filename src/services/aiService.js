require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

async function generateTechQuestion(skills, level, lang) {
    if (!apiKey) {
        return `You are a ${level} engineer with ${skills}. A Siemens S7-1500 PLC is showing a red SF error while communicating with a G120C drive. What are your first 3 troubleshooting steps?`;
    }
    // API logic to be implemented
    return "Mock Question";
}

async function gradeTechAnswer(question, answer, lang) {
    if (!apiKey) {
        return {
            passed: true,
            score: 92,
            feedback: "Excellent understanding of Profinet diagnostics and hardware configuration."
        };
    }
    // API logic to be implemented
    return { passed: true, score: 85, feedback: "Acceptable." };
}

module.exports = { generateTechQuestion, gradeTechAnswer };
