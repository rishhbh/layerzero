import gemmaClient from "../config/gemmaClient.js";
import geminiClient from "../config/geminiClient.js";
import parsePdf from "../config/pdfparse.js";

const summarisePdf = async (req, res, next) => {
    const { client } = req.body;
    const models = {
        gemma: gemmaClient,
        gemini: geminiClient
    };

    const model = models[client];

    try {
        if (!req.file) {
            return res.status(401).json({
                "message": "No file uploaded!"
            });
        }

        if (!model) {
            return res.status(400).json({
                "message": "Invalid model!"
            });
        }

        const text = await parsePdf(req.file.buffer);
        const summary = await model(text);

        res.json({
            summary
        });

    } catch (err) {
        next(err);
    }
};

export default summarisePdf;