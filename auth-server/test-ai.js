require('dotenv').config();
const { callAIService } = require('./services/aiService');

async function testConnection() {
    console.log("--- Testing OpenRouter Connection (Strict Format) ---");
    
    // THE STRICT PROMPT
    const strictPrompt = `
        TASK: Create 1 multiple-choice question about JavaScript 'const'.
        
        OUTPUT RULES:
        1. Return ONLY a JSON object. 
        2. Format must be: {"questions": [{"questionText": "...", "options": ["...", "...", "...", "..."], "correctAnswerIndex": 0, "explanation": "..."}]}
        3. correctAnswerIndex MUST be a number (0-3).
        4. No markdown, no backticks, no preamble.

        EXAMPLE OF VALID OUTPUT:
        {"questions": [{"questionText": "Sample?", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 1, "explanation": "Expl."}]}
    `;
    
    try {
        const result = await callAIService(strictPrompt);
        console.log("--- AI Response ---");
        console.log(JSON.stringify(result, null, 2));

        // STRICTURE CHECK
        if (result.questions && Array.isArray(result.questions)) {
            console.log("\n✅ SUCCESS: AI followed the array format.");
            if (typeof result.questions[0].correctAnswerIndex === 'number') {
                console.log("✅ SUCCESS: correctAnswerIndex is a Number.");
            } else {
                console.log("❌ FAIL: Index is not a number.");
            }
        } else {
            console.log("\n❌ FAIL: AI did not return a 'questions' array.");
        }
    } catch (error) {
        console.error("--- Error ---");
        console.error(error.message);
    }
}

testConnection();