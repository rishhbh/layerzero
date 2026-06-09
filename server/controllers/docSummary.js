import gemmaClient from "../config/gemmaClient.js";
import geminiClient from "../config/geminiClient.js";
import extractText from "../services/document.js";

const summariseDoc = async (req, res, next) => {
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

        const text = await extractText(req.file.buffer);
        const summary = await model(text);

        res.json({
            summary
        });
        
    } catch (err) {
        next(err);
    }
};

export default summariseDoc;