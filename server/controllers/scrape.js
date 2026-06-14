import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import geminiClient from "../config/llm/geminiClient.js";
import gemmaClient from "../config/llm/gemmaClient.js";
import cerebrasClient from "../config/llm/cerebrasClient.js";
import sarvamClient from "../config/llm/sarvamClient.js";

const scrapePage = async (req, res, next) => {
    const { url } = req.body;
    const { client } = req.body;
    const models = {
        gemma: gemmaClient,
        gemini: geminiClient,
        cerebras: cerebrasClient,
        sarvam: sarvamClient
    };
    try {
        const model = models[client];

        if (!model) {
            return res.status(400).json({
                "message": "Invalid model"
            });
        }

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36"
            }
        });

        const dom = new JSDOM(data, { url });
        const article = new Readability(dom.window.document).parse();

        if(!article) {
            return res.status(400).json({
                "message": "Could not extract article content"
            });
        }
        const summary = await model(article.textContent);

        res.json({
            output: summary
        });
    } catch (err) {
        next(err);
    }

};

export default scrapePage;