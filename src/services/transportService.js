import { generateText } from "./geminiClient.js";

/**
 * Generates AI-powered transport and sustainability tips.
 */
export async function getTransportTips(gate, language = "English", accessibilityMode = false, signal = undefined) {
  const accessibilityInstruction = accessibilityMode
    ? "IMPORTANT: Use very simple, short sentences. Target a 6th-grade reading level."
    : "Use clear, professional language.";

  const languageInstruction = language !== "English"
    ? `IMPORTANT: Respond ENTIRELY in ${language}. Do not use English at all.`
    : "Respond in English.";

  const prompt = `You are a transport and sustainability assistant for the FIFA World Cup 2026.
The fan is entering through: ${gate}.

INSTRUCTIONS:
Generate exactly two short bullet points:
1. A shuttle or parking suggestion specific to this gate.
2. One relevant eco-tip (sustainability tip) for their visit.

Format the response as plain text with bullet points or emojis. Keep it extremely concise.
- ${accessibilityInstruction}
  - ${languageInstruction}`;

  return await generateText(prompt, signal);
}
