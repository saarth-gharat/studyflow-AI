const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const TRANSIENT_MESSAGE_PATTERNS = [
  "high demand",
  "temporarily unavailable",
  "service unavailable",
  "overloaded",
  "try again later",
  "resource exhausted",
];
const RETRY_DELAYS_MS = [1000, 2000, 4000];

export class GeminiRequestError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = "GeminiRequestError";
    this.status = status;
    this.retryable = retryable;
  }
}

function isTransientFailure(status: number, message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    TRANSIENT_STATUS_CODES.has(status) ||
    TRANSIENT_MESSAGE_PATTERNS.some((pattern) =>
      normalizedMessage.includes(pattern)
    )
  );
}

function getErrorMessage(responseText: string, status: number) {
  try {
    const parsed = JSON.parse(responseText);
    return parsed?.error?.message || `Gemini API request failed with status ${status}.`;
  } catch {
    return `Gemini API request failed with status ${status}.`;
  }
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

async function requestModel(
  model: string,
  apiKey: string,
  prompt: string,
  generationConfig: Record<string, unknown>
) {
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        try {
          return JSON.parse(responseText);
        } catch {
          throw new GeminiRequestError(
            "Gemini returned an invalid response.",
            502,
            false
          );
        }
      }

      const message = getErrorMessage(responseText, response.status);
      const retryable = isTransientFailure(response.status, message);

      if (!retryable) {
        throw new GeminiRequestError(message, response.status, false);
      }

      if (attempt < RETRY_DELAYS_MS.length - 1) {
        console.warn(`[Gemini] ${model} temporarily unavailable; retrying...`);
        const jitter = Math.floor(Math.random() * 250);
        await wait(RETRY_DELAYS_MS[attempt] + jitter);
      } else {
        throw new GeminiRequestError(message, response.status, true);
      }
    } catch (error) {
      if (error instanceof GeminiRequestError) {
        throw error;
      }

      if (attempt === RETRY_DELAYS_MS.length - 1) {
        throw new GeminiRequestError(
          "Gemini is temporarily unavailable.",
          503,
          true
        );
      }

      console.warn(`[Gemini] ${model} temporarily unavailable; retrying...`);
      const jitter = Math.floor(Math.random() * 250);
      await wait(RETRY_DELAYS_MS[attempt] + jitter);
    }
  }

  throw new GeminiRequestError("Gemini is temporarily unavailable.", 503, true);
}

export async function generateGeminiContent({
  apiKey,
  prompt,
  generationConfig = {},
}: {
  apiKey: string;
  prompt: string;
  generationConfig?: Record<string, unknown>;
}) {
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";

  try {
    return await requestModel(primaryModel, apiKey, prompt, generationConfig);
  } catch (error) {
    if (!(error instanceof GeminiRequestError) || !error.retryable) {
      throw error;
    }

    if (fallbackModel === primaryModel) {
      throw error;
    }

    console.warn("[Gemini] Primary model unavailable; using fallback model.");
    return requestModel(fallbackModel, apiKey, prompt, generationConfig);
  }
}