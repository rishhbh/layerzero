import systemPrompt from "../systemPrompt.js";

const gemmaClient = async (prompt) => {
    try {
        const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                stream: false
            })
        });
        const data = await response.json();
        const output = data?.message?.content || "";

        return output;

    } catch (err) {
        throw err;
    }
};

export default gemmaClient;