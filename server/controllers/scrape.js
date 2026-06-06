const axios = require("axios");
const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");

const scrapePage = async (req, res) => {
    const { url } = req.body;
    const { data } = await axios.get(url);

    const dom = new JSDOM(data, { url });

    const article = new Readability(dom.window.document).parse();

    res.json({
        "content": article?.textContent || ""
    });
}

export default scrapePage;