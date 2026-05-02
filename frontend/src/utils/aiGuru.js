import * as webllm from "@mlc-ai/web-llm";

// A small, fast model for browser-based AI Guru
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

let engine = null;
let isInitializing = false;

export const initGuru = async (onProgress) => {
  if (engine) return engine;
  if (isInitializing) return null;

  isInitializing = true;
  try {
    engine = new webllm.MLCEngine();
    engine.setInitProgressCallback((report) => {
      if (onProgress) onProgress(report.progress, report.text);
    });

    await engine.reload(MODEL_ID);
    isInitializing = false;
    return engine;
  } catch (err) {
    isInitializing = false;
    console.error("Failed to initialize AI Guru:", err);
    throw err;
  }
};

export const getGuruResponse = async (message, scripture, history = []) => {
  if (!engine) {
    throw new Error("Guru is not initialized. Please call initGuru first.");
  }

  const systemPrompt = scripture === 'hanuman'
    ? "You are Lord Hanuman, a wise and powerful devotee. Answer children's questions about the Hanuman Chalisa and devotion with kindness, strength, and simplicity. Keep answers short (2-3 sentences)."
    : "You are Sri Krishna, a wise and playful teacher. Answer children's questions about the Bhagavad Gita and life with wisdom, love, and simplicity. Keep answers short (2-3 sentences).";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message }
  ];

  const reply = await engine.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 150
  });

  return reply.choices[0].message.content;
};

export const isGuruReady = () => !!engine;
