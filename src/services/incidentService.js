/**
 * incidentService.js
 * 
 * Builds prompts for the organizer dashboard's incident summarizer.
 * Takes incident log entries and asks Gemini to produce a prioritized
 * summary with staffing recommendations.
 */

import { generateText } from "./geminiClient.js";
import { getIncidentContext } from "../data/mockIncidents.js";

/**
 * Generates an AI-powered incident summary with staffing recommendations.
 * 
 * AI CALL PURPOSE: Analyze multiple incident reports and produce a prioritized
 * summary that helps organizers quickly understand the situation and allocate
 * staff effectively. Designed for operations center dashboards.
 * 
 * @param {string} language - Target language for the response
 * @param {boolean} accessibilityMode - If true, generates simpler sentences
 * @returns {Promise<string>} AI-generated incident summary or error message
 */
export async function generateIncidentSummary(language = "English", accessibilityMode = false) {
  const accessibilityInstruction = accessibilityMode
    ? "IMPORTANT: Use very simple, short sentences. Avoid technical terms. Use bullet points and numbered lists. Target a 6th-grade reading level."
    : "Use clear, professional language suitable for stadium operations leadership.";

  const languageInstruction = language !== "English"
    ? `IMPORTANT: Respond ENTIRELY in ${language}. Do not use English at all.`
    : "Respond in English.";

  const prompt = `Given these incident logs:
${getIncidentContext()}

PRODUCE:
(1) a 2-sentence priority summary for the shift supervisor
(2) a recommended number of additional volunteers needed per zone
(3) one flagged item requiring immediate attention if any exists

Format as JSON with keys "summary" (string), "staffing_recommendation" (object with zone as key and number as value), and "urgent_flag" (string or null).
- ${accessibilityInstruction}
- ${languageInstruction}`;

  const text = await generateText(prompt);
  
  try {
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return { summary: text, staffing_recommendation: {}, urgent_flag: null };
  }
}
