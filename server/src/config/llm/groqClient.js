import systemPrompt from '../systemPrompt.js';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const groqClient = async (text) => {
    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            reasoning_effort: "medium",
            stop: null
        });
        
        return response.choices[0].message.content;
    } catch (err) {
        throw err;
    }
};

export default groqClient;
