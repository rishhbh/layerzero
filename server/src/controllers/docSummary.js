import gemmaClient from "../config/llm/gemmaClient.js";
import geminiClient from "../config/llm/geminiClient.js";
import groqClient from "../config/llm/groqClient.js";
import extractText from "../services/document.js";
import sarvamClient from "../config/llm/sarvamClient.js";
import redis from "../config/redis.js";
import hashContent from "../utils/hashContent.js";
import Summary from "../models/Summary.js";

const summariseDoc = async (req, res, next) => {
  const { client } = req.body;

  const models = {
    gemma: gemmaClient,
    gemini: geminiClient,
    groq: groqClient,
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
    const sourceHash = hashContent(text.content);

    const summaryExists = await Summary.findOne({
      userId: req.user._id,
      sourceHash,
      client
    });

    if (summaryExists) {
      return res.status(200).json({
        output: summaryExists.finalSummary,
        title: summaryExists.title,
        cached: true
      });
    }

    const hashedCacheKey = `${client}:${hashContent(text.content)}`;
    const cachedSummary = await redis.get(hashedCacheKey);

    if (cachedSummary) {
      await Summary.create({
        userId: req.user._id,
        title: cachedSummary.title,
        finalSummary: cachedSummary.summary,
        sourceType: text.type,
        sourceHash,
        client
      });

      return res.json({
        output: cachedSummary.summary,
        title: cachedSummary.title,
        cached: true
      });
    }

    const rawResponse = await model(text.content);
    const response = JSON.parse(rawResponse);

    await redis.set(hashedCacheKey, rawResponse, {
      ex: 1 * 24 * 60 * 60,
    });

    await Summary.create({
      userId: req.user._id,
      title: response.title,
      finalSummary: response.summary,
      sourceType: text.type,
      sourceHash,
      client
    });

    res.json({
      output: response.summary,
      title: response.title,
      cached: false
    });

  } catch (err) {
    next(err);
  }
};

export default summariseDoc;
