const axios = require('axios');
require('dotenv').config();

const callAIService = async (prompt) => {
    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                // We'll use the most stable free model path
                model: "arcee-ai/trinity-mini:free", 
                messages: [
                    {
                        role: "system",
                        content: "You are an educational assistant. Output strictly valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                // OpenRouter specific: This tells the API you're okay with free model policies
                provider: {
                  allow_fallbacks: true
                },
                response_format: { type: "json_object" } 
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000", 
                    "X-Title": "EduBridge LMS",
                }
            }
        );

        const content = response.data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        
        return JSON.parse(cleanJson);
    } catch (error) {
        // Detailed error for debugging the 404/Policy issue
        console.error("OpenRouter Error Detail:", JSON.stringify(error.response?.data, null, 2));
        throw new Error("AI Service failed to respond.");
    }
};

module.exports = { callAIService };