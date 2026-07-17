import gemmaClient from "../config/llm/gemmaClient.js";
import geminiClient from "../config/llm/geminiClient.js";
import cerebrasClient from "../config/llm/cerebrasClient.js";
import extractText from "../services/document.js";
import sarvamClient from "../config/llm/sarvamClient.js";
import redis from "../services/redis.js";
import hashContent from "../utils/hashContent.js";
import { streamingModels } from "../config/llm/streamingClients.js";
import { streamAndCache } from "../utils/streamResponse.js";

const summariseDoc = async (req, res, next) => {
  const { client } = req.body;
  const shouldStream = req.body.stream === "true" || req.body.stream === true;
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
  if (shouldStream) {
    return streamAndCache({
      res,
      stream: (async function* () {
        yield cachedSummary;
      })(),
      redis,
      cacheKey: null,
      doneKey: "summary",
    });
  }

  return res.json({
    summary: cachedSummary,
  });
}
if (shouldStream) {
  const streamingModel = streamingModels[client];

  return streamAndCache({
    res,
    stream: streamingModel(text),
    redis,
    cacheKey: hashedCacheKey,
    doneKey: "summary",
  });
}

const summary = await model(text);

await redis.set(hashedCacheKey, summary, {
  ex: 1 * 24 * 60 * 60,
});

res.json({
  summary,
});
  } catch (err) {
    next(err);
  }
};

export default summariseDoc;
