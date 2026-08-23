import systemPrompt from "../systemPrompt.js";
import sarvamSystemPrompt from "../sarvamSystemPrompt.js";

import { GoogleGenAI } from "@google/genai";
import { Groq } from "groq-sdk";
import { SarvamAIClient } from "sarvamai";

import sarvamClient from "./sarvamClient.js";

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function* streamGemini(prompt) {
  const responseStream = await geminiAI.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  for await (const chunk of responseStream) {
    const text = chunk.text || "";
    if (text) yield text;
  }
}

export async function* streamGroq(prompt) {
  const stream = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    reasoning_effort: "medium",
    stop: null,
  });

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content || "";
    if (text) yield text;
  }
}

export async function* streamGemma(prompt) {
  const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to stream response from Ollama");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      const json = JSON.parse(line);
      const text = json.message?.content || "";

      if (text) yield text;
      if (json.done) return;
    }
  }
}

export async function* streamSarvam(prompt) {
  const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY,
  });

  try {
    const stream = await client.chat.completions({
      model: "sarvam-30b",
      stream: true,
      messages: [
        { role: "system", content: sarvamSystemPrompt },
        {
          role: "user",
          content: `${prompt}\n\n(Reply in Hinglish, same energy as always)`,
        },
      ],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 2000,
      reasoning_effort: null,
    });

    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content || "";
      if (text) yield text;
    }
  } catch {
    // Safe fallback if the installed Sarvam JS SDK version does not support streaming.
    const fullResponse = await sarvamClient(prompt);
    yield fullResponse;
  }
}

export const streamingModels = {
  gemini: streamGemini,
  groq: streamGroq,
  gemma: streamGemma,
  sarvam: streamSarvam,
};