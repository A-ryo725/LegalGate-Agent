const fs = require("fs/promises");
const path = require("path");

const allowedExtensions = new Set([".txt", ".csv", ".json"]);

class UnsupportedFileTypeError extends Error {
  constructor(extension) {
    super(`Unsupported file type: ${extension || "unknown"}`);
    this.name = "UnsupportedFileTypeError";
    this.statusCode = 400;
  }
}

async function readUploadedFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();

  try {
    if (!allowedExtensions.has(extension)) {
      throw new UnsupportedFileTypeError(extension);
    }

    const content = await fs.readFile(file.path, "utf8");

    return {
      content,
      extension
    };
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }
}

module.exports = {
  readUploadedFile,
  UnsupportedFileTypeError
};
