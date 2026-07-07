const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

export const startStream = (res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
};

export const sendStreamEvent = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const streamAndCache = async ({
  res,
  stream,
  redis,
  cacheKey,
  doneKey = "summary",
}) => {
  startStream(res);

  let finalText = "";

  try {
    for await (const chunk of stream) {
      if (!chunk) continue;

      finalText += chunk;
      sendStreamEvent(res, "chunk", { delta: chunk });
    }

    if (cacheKey && finalText) {
      await redis.set(cacheKey, finalText, { ex: CACHE_TTL_SECONDS });
    }

    sendStreamEvent(res, "done", { [doneKey]: finalText });
  } catch (error) {
    sendStreamEvent(res, "error", {
      message: error?.message || "Streaming failed",
    });
  } finally {
    res.end();
  }
};