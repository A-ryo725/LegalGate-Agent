class ResponseFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = "ResponseFormatError";
    this.statusCode = 500;
  }
}

function extractJsonFromGeminiResponse(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new ResponseFormatError("Gemini response is empty");
  }

  const trimmed = text.trim();
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedJson) {
    return fencedJson[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new ResponseFormatError("Gemini response does not contain JSON");
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

function validateAnalysisResult(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ResponseFormatError("Parsed Gemini response is not a JSON object");
  }

  if (typeof value.summary !== "string" || !Array.isArray(value.risks)) {
    throw new ResponseFormatError("Parsed Gemini response does not match the expected format");
  }

  const allowedLevels = new Set(["high", "medium", "low"]);

  for (const risk of value.risks) {
    if (
      !risk ||
      typeof risk !== "object" ||
      Array.isArray(risk) ||
      !allowedLevels.has(risk.level) ||
      typeof risk.title !== "string" ||
      typeof risk.description !== "string" ||
      (risk.excerpt !== undefined && typeof risk.excerpt !== "string") ||
      typeof risk.suggestion !== "string"
    ) {
      throw new ResponseFormatError("Parsed Gemini response contains an invalid risk item");
    }
  }

  return value;
}

function formatGeminiResponse(text) {
  const jsonText = extractJsonFromGeminiResponse(text);

  try {
    return validateAnalysisResult(JSON.parse(jsonText));
  } catch (err) {
    if (err instanceof ResponseFormatError) {
      throw err;
    }

    console.error("Failed to parse Gemini JSON response", {
      message: err.message,
      responsePreview: jsonText.slice(0, 500)
    });

    throw new ResponseFormatError("Gemini response could not be parsed as JSON");
  }
}

module.exports = {
  formatGeminiResponse,
  extractJsonFromGeminiResponse,
  ResponseFormatError
};



