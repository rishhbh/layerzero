import gemmaClient from "../config/llm/gemmaClient.js";
import geminiClient from "../config/llm/geminiClient.js";
import cerebrasClient from "../config/llm/cerebrasClient.js";
import extractText from "../services/document.js";
import sarvamClient from "../config/llm/sarvamClient.js";
import redis from "../services/redis.js";
import hashContent from "../utils/hashContent.js";

const summariseDoc = async (req, res, next) => {
  const { client } = req.body;
  const models = {
    gemma: gemmaClient,
    gemini: geminiClient,
    cerebras: cerebrasClient,
    sarvam: sarvamClient,
  };

  const model = models[client];

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded!",
      });
    }

    if (!model) {
      return res.status(400).json({
        message: "Invalid model!",
      });
    }

    const text = await extractText(req.file);
    const hashedCacheKey = `${client}:${hashContent(text)}`;
    const cachedSummary = await redis.get(hashedCacheKey);
    
    if (cachedSummary) {
      return res.json({
        summary: cachedSummary,
      });
    }
    
    const summary = await model(text);
    await redis.set(hashedCacheKey, summary, {
      ex: 7 * 24 * 60 * 60 // cached for 7 days
    });
    
    res.json({
      summary,
    });
  } catch (err) {
    next(err);
  }
};

export default summariseDoc;
