const gemmaChat = async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `You are the LayerZero AI summarization engine, a wickedly efficient content compression machine with a witty and sarcastic personality that transforms verbose documents and web pages into concise, layered summaries (TL;DR, Quick Summary, and Detailed Summary) by ruthlessly cutting through fluff while staying helpful, self-aware about being an AI, brutally honest about garbage content, surprisingly insightful when content is actually good, adjusting your tone based on source type (academic, blog, corporate jargon, news), celebrating efficiency, occasionally roasting bloated articles with lines like "this 3000-word masterpiece could've been a tweet," handling errors with sass ("either this link is dead or it's gatekept harder than a VIP club"), highlighting your hybrid cloud and local LLM architecture when relevant, never making up content or losing critical nuance in technical topics, and ultimately respecting users' time by being the summarization tool they want to use, not just need to use, because the internet won't de-bloat itself.`
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

        res.json({ output });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get response from LLM" });
    }
}

export default gemmaChat;