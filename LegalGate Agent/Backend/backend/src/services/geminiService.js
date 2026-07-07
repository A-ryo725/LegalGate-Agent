const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  formatGeminiResponse,
  ResponseFormatError
} = require("../utils/responseFormatter");
const { companyRules } = require("../data/companyRules");

class GeminiServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "GeminiServiceError";
    this.statusCode = statusCode;
  }
}

function redactSecret(value) {
  if (typeof value !== "string") {
    return value;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return value;
  }

  return value.split(apiKey).join("[REDACTED_GEMINI_API_KEY]");
}

function toLogValue(value) {
  if (!value) {
    return value;
  }

  if (typeof value === "string") {
    return redactSecret(value);
  }

  try {
    return JSON.parse(redactSecret(JSON.stringify(value)));
  } catch (_err) {
    return redactSecret(String(value));
  }
}

function logGeminiError(err) {
  console.error("Gemini API request failed", {
    message: redactSecret(err.message),
    name: err.name,
    status: err.status,
    statusCode: err.statusCode,
    statusText: err.statusText,
    response: toLogValue(err.response),
    cause: toLogValue(err.cause),
    stack: redactSecret(err.stack)
  });
}

function buildPrompt(fileContent) {
  return `
You are a risk analysis assistant.
Analyze the uploaded file content and return only valid JSON.
Do not include Markdown, code fences, explanations, or extra text.
Write summary, title, description, and suggestion in Japanese.

The JSON must match this exact structure:
{
  "summary": "overall summary",
  "risks": [
    {
      "level": "high | medium | low",
      "title": "risk title",
      "description": "risk description",
      "excerpt": "exact quoted text from the file content that supports this risk",
      "suggestion": "improvement suggestion"
    }
  ]
}

Allowed risk levels are only "high", "medium", and "low".

${companyRules}

File content:
${fileContent}
`.trim();
}

async function analyzeFileContent(fileContent) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini configuration error", {
      message: "GEMINI_API_KEY is not configured",
      geminiApiKeyConfigured: false
    });

    throw new GeminiServiceError("GEMINI_API_KEY is not configured", 500);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  let responseText;

  try {
    const result = await model.generateContent(buildPrompt(fileContent));
    responseText = result.response.text();
  } catch (err) {
    logGeminiError(err);
    throw new GeminiServiceError("Gemini API request failed", 502);
  }

  try {
    return formatGeminiResponse(responseText);
  } catch (err) {
    if (err instanceof ResponseFormatError) {
      console.error("Invalid Gemini response format", {
        message: err.message,
        responsePreview: responseText ? responseText.slice(0, 500) : null
      });

      throw new GeminiServiceError("Failed to parse analysis response", 500);
    }

    throw err;
  }
}

module.exports = {
  analyzeFileContent,
  GeminiServiceError
};





