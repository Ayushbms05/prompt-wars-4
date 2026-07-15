/**
 * transportService.js
 *
 * @module transportService
 *
 * Builds prompts for the Transport & Sustainability card shown inside the
 * Navigation tab. Delegates execution to {@link module:geminiClient.generateText}.
 *
 * Prompt pattern: constrained short-form generation.
 * The model is given the fan's entry gate and asked to produce exactly two
 * bullet points: (1) a gate-specific shuttle/parking tip, and (2) an
 * eco-tip for a more sustainable stadium visit. The tightly constrained
 * output format keeps responses fast and UI-friendly.
 */
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
