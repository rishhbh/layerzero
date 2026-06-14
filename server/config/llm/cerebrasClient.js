import systemPrompt from './systemPrompt.js';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });

const cerebrasClient = async (text) => {
    try {
        const response = await cerebras.chat.completions.create({
            model: "gpt-oss-120b",
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
        });
    } catch (err) {
        throw err;
    }


    return response.choices[0].message.content;
};

export default cerebrasClient;