import systemPrompt from '../systemPrompt.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const geminiClient = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7
            }
        });

        const output = response.text;
        return output;
        
    } catch (err) {
        throw err;
    }
};

export default geminiClient;