type StreamOptions = {
  onDelta: (delta: string) => void;
};

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const readSSEStream = async (
  response: Response,
  onDelta: (delta: string) => void
) => {
  if (!response.ok || !response.body) {
    let message = "Failed to stream response";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let finalText = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const eventBlock of events) {
      const eventLine = eventBlock
        .split("\n")
        .find((line) => line.startsWith("event:"));

      const dataLine = eventBlock
        .split("\n")
        .find((line) => line.startsWith("data:"));

      if (!eventLine || !dataLine) continue;

      const event = eventLine.replace("event:", "").trim();
      const payload = JSON.parse(dataLine.replace("data:", "").trim());

      if (event === "chunk") {
        finalText += payload.delta || "";
        onDelta(payload.delta || "");
      }

      if (event === "error") {
        throw new Error(payload.message || "Streaming failed");
      }
    }
  }

  return finalText;
};

export const postJsonStream = async (
  endpoint: string,
  body: Record<string, unknown>,
  options: StreamOptions
) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
  });

  return readSSEStream(response, options.onDelta);
};

export const postFormStream = async (
  endpoint: string,
  formData: FormData,
  options: StreamOptions
) => {
  formData.append("stream", "true");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return readSSEStream(response, options.onDelta);
};