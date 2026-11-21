import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import geminiClient from "../config/llm/geminiClient.js";
import gemmaClient from "../config/llm/gemmaClient.js";
import groqClient from "../config/llm/groqClient.js";
import sarvamClient from "../config/llm/sarvamClient.js";
import redis from "../config/redis.js";
import { webSummarySchema } from "../validators/summary.validator.js";
import Summary from "../models/Summary.js";
import hashContent from "../utils/hashContent.js";

const scrapePage = async (req, res, next) => {
  const clientFields = webSummarySchema.safeParse(req.body);

  if (!clientFields.success) {
    return res.status(400).json({
      errors: clientFields.error.flatten().fieldErrors,
    });
  }

  const { url, client } = clientFields.data;
  const sourceHash = hashContent(url);

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

  const cacheKey = `${client}:${url}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    await Summary.create({
      userId: req.user._id,
      title: cachedData.title,
      finalSummary: cachedData.summary,
      sourceType: "url",
      sourceHash,
      client,
    });

    return res.json({
      output: cachedData.summary,
      title: cachedData.title,
      cached: true
    });
  }

  const models = {
    gemma: gemmaClient,
    gemini: geminiClient,
    groq: groqClient,
    sarvam: sarvamClient,
  };

  try {
    const model = models[client];

    if (!model) {
      return res.status(400).json({
        message: "Invalid model",
      });
    }

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
      },
    });

    const dom = new JSDOM(data, { url });
    const article = new Readability(dom.window.document).parse();

    if (!article) {
      return res.status(400).json({
        message: "Could not extract article content",
      });
    }

    const rawResponse = await model(article.textContent);
    const cleanedResponse = rawResponse
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "");

    const response = JSON.parse(cleanedResponse);

    await redis.set(cacheKey, rawResponse, {
      ex: 1 * 24 * 60 * 60,
    });

    await Summary.create({
      userId: req.user._id,
      title: response.title,
      finalSummary: response.summary,
      sourceType: "url",
      sourceHash,
      client,
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

export default scrapePage;
