import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import geminiClient from "../config/geminiClient.js";
import gemmaClient from "../config/gemmaClient.js";

const scrapePage = async (req, res) => {
    // const { url } = req.body;
    const url = "https://en.wikipedia.org/wiki/Types_Riot";
    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36"
        }
    });

    const dom = new JSDOM(data, { url });

    const article = new Readability(dom.window.document).parse();

    res.json({
        output: await gemmaClient(article?.textContent)
    });
};

export default scrapePage;