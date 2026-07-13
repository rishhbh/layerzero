import sarvamSystemPrompt from "../sarvamSystemPrompt.js";
import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

const sarvamClient = async (prompt) => {
    try {
        const response = await client.chat.completions({
            model: "sarvam-30b",
            messages: [
                {
                    role: "system",
                    content: sarvamSystemPrompt
                },
                {
                    role: "user",
                    content: `${prompt}\n\n(Reply in Hinglish, same energy as always)`,
                },
            ],
            temperature: 0.5,
            top_p: 1,
            max_tokens: 2000,
            reasoning_effort: null,
        });

        return response.choices[0].message.content;

    } catch (err) {
        throw err;
    }
};

export default sarvamClient;