import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const scrapePage = async (req, res) => {
    // const { url } = req.body;
    const url = "https://github.com/render-TheVoid/render-TheVoid";
    const { data } = await axios.get(url);

    const dom = new JSDOM(data, { url });

    const article = new Readability(dom.window.document).parse();

    res.json({
        content: article?.textContent || ""
    });
}

export default scrapePage;