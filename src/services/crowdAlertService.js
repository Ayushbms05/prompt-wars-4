/**
 * crowdAlertService.js
 *
 * @module crowdAlertService
 *
 * Builds prompts for the crowd congestion alert generator and delegates
 * execution to {@link module:geminiClient.generateText}.
 *
 * Prompt pattern: data-to-narrative generation.
 * Live zone-occupancy numbers (zone name, current count, capacity, trend)
 * are formatted as a structured list and injected alongside the stadium map.
 * Gemini is asked to identify critical zones (>80 % capacity), propose
 * alternate routes, and produce a concise plain-language alert suitable for
 * PA announcements or volunteer radio calls.
 */

import { generateText } from "./geminiClient.js";
import { getOccupancyContext } from "../data/mockOccupancy.js";
import { getStadiumMapContext } from "../data/stadiumMap.js";

/**
 * Generates an AI-powered crowd congestion alert.
 * 
 * AI CALL PURPOSE: Analyze zone-occupancy numbers and produce a human-readable
 * congestion warning that identifies overcrowded areas and suggests alternate
 * routes or less-crowded alternatives. Designed for stadium PA announcements
 * or volunteer radio calls.
 * 
 * @param {string} language - Target language for the response
 * @param {boolean} accessibilityMode - If true, generates simpler sentences
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<string>} AI-generated crowd alert or error message
 */
export async function generateCrowdAlert(language = "English", accessibilityMode = false, signal = undefined) {
  const accessibilityInstruction = accessibilityMode
    ? "IMPORTANT: Use very simple, short sentences. Avoid technical terms. Use bullet points. Target a 6th-grade reading level."
    : "Use clear, professional language suitable for stadium staff and volunteers.";

  const languageInstruction = language !== "English"
    ? `IMPORTANT: Respond ENTIRELY in ${language}. Do not use English at all.`
    : "Respond in English.";

  /**
   * CROWD ALERT PROMPT STRUCTURE:
   * 1. System role: Stadium crowd management analyst
   * 2. Occupancy data: Current numbers for every zone
   * 3. Stadium map: For suggesting alternate routes
   * 4. Output format: Structured warning with actionable recommendations
   */
  const prompt = `Given this zone occupancy data:
${getOccupancyContext()}

And this stadium map data (for alternate route suggestions):
${getStadiumMapContext()}

INSTRUCTIONS:
- Write a one-sentence public-facing alert in plain language warning fans away from the most crowded zone and suggesting the least crowded nearby alternative.
- Do not use technical terms like "occupancy percentage" — describe it the way a helpful staff member would.
- ${accessibilityInstruction}
- ${languageInstruction}`;

  return await generateText(prompt, signal);
}
