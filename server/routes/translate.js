import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.json({
      translated: "",
      detectedLanguage: null,
    });
  }

  try {
    const result = await translateToJapanese(text);

    return res.json({
      translated: result.translated,
      detectedLanguage: result.detectedLanguage,
    });
  } catch (error) {
    console.error("Translation error:", error);

    return res.status(502).json({
      error: "Translation failed",
      details: error.message,
    });
  }
});

async function translateToJapanese(text) {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    "?client=gtx" +
    "&sl=auto" +
    "&tl=ja" +
    "&dt=t" +
    `&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Translate HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data || !data[0]) {
    throw new Error("No translation returned");
  }
  const translated = data[0]
    .map((item) => item[0])
    .filter(Boolean)
    .join("");

  if (!translated) {
    throw new Error("Empty translation returned");
  }

  return {
    translated,
    detectedLanguage: data[2] || "unknown",
  };
}

export default router;
