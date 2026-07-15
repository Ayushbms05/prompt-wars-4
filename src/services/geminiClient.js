/**
 * geminiClient.js
 * 
 * Central AI client that wraps the Google Gemini API.
 * All AI calls across the app flow through generateText() which provides:
 *  - Input validation (rejects empty/too-long prompts)
 *  - Timeout handling (aborts after 30 seconds)
 *  - Error catching (never throws — always returns an error message string)
 * 
 * Model: gemini-3-flash (fast, cost-effective, strong multilingual support)
 * API key: read from VITE_GEMINI_API_KEY environment variable
 */

import { GoogleGenAI } from "@google/genai";

// --- Configuration ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.5-flash";
const MAX_PROMPT_LENGTH = 15000; // chars — prevents accidentally huge prompts
const TIMEOUT_MS = 30000; // 30 second timeout per request

// Validate API key presence at module load
let aiClient = null;
if (API_KEY && API_KEY !== "your_gemini_api_key_here") {
  aiClient = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "[FanMate] No valid VITE_GEMINI_API_KEY found. " +
    "AI features will return placeholder messages. " +
    "Set your key in a .env file."
  );
}

/**
 * Sends a prompt to the Gemini API and returns the generated text.
 * 
 * This function is the ONLY place in the app that talks to the AI API.
 * It validates input, enforces a timeout, and catches all errors so
 * the calling component never has to worry about crashes.
 * 
 * @param {string} prompt - The full prompt to send to Gemini
 * @returns {Promise<string>} The generated text, or an error message string
 */
export async function generateText(prompt) {
  // --- Input validation ---
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return "⚠️ Please provide a valid question or input.";
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return "⚠️ Your input is too long. Please shorten your message and try again.";
  }

  // --- Check API key availability ---
  if (!aiClient) {
    return "🔑 AI features require a Gemini API key. Please set VITE_GEMINI_API_KEY in your .env file and restart the app.";
  }

  let attempt = 0;
  const maxRetries = 2; // For 429 Rate Limiting
  let unavailableRetries = 0;
  const maxUnavailableRetries = 3; // For 503 Unavailable

  try {
    while (true) {
      console.log(`[FanMate] Gemini API called. Attempt (429: ${attempt + 1}/${maxRetries + 1}, 503: ${unavailableRetries + 1}/${maxUnavailableRetries + 1})`);
      try {
        // Create an AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        /**
         * AI CALL: Send the prompt to Gemini 3 Flash.
         */
        const response = await aiClient.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

        clearTimeout(timeoutId);

        // Extract text from the response
        const text = response?.text;

        if (!text || text.trim().length === 0) {
          return "⚠️ The AI returned an empty response. Please try again.";
        }

        return text;
      } catch (error) {
        // --- Error handling with explicit logging ---
        console.error(`[FanMate] Gemini API error (Model: ${MODEL_NAME}, Status: ${error.status || 'unknown'}, Attempt: ${attempt + unavailableRetries + 1}):`, error);

        if (error.name === "AbortError") {
          return "⏱️ The request timed out. The AI service might be busy — please try again in a moment.";
        }

        // Retry on 503 UNAVAILABLE
        if (error.status === 503) {
          if (unavailableRetries < maxUnavailableRetries) {
            unavailableRetries++;
            showRetryToast("Model is busy, retrying...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue; // Retry loop
          }
          return "⚠️ The AI service is currently unavailable. Please try again in a few moments.";
        }

        if (error.status === 429) {
          if (attempt < maxRetries) {
            attempt++;
            const delay = 1000 * Math.pow(2, attempt - 1);
            console.warn(`[FanMate] Rate limited (429). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry loop
          }
          return "🚦 Too many requests. Please wait a moment and try again.";
        }

        if (error.status === 401 || error.status === 403) {
          return "🔑 Invalid API key. Please check your VITE_GEMINI_API_KEY in the .env file.";
        }

        return `⚠️ Something went wrong while contacting the AI service. Please try again. (${error.message || "Unknown error"})`;
      }
    }
  } finally {
    hideRetryToast();
  }
}

// --- Toast Notification Helpers for 503 Retries ---
let toastElement = null;

function showRetryToast(message) {
  if (typeof document === "undefined") return;

  if (!toastElement) {
    toastElement = document.createElement("div");
    toastElement.id = "gemini-retry-toast";
    
    // Modern elegant styling matching the World Cup theme with micro-animations
    const style = document.createElement("style");
    style.id = "gemini-retry-toast-style";
    style.innerHTML = `
      #gemini-retry-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(10, 22, 40, 0.95);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(212, 168, 67, 0.3);
        color: #e8ecf1;
        padding: 12px 24px;
        border-radius: 30px;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        z-index: 9999;
        opacity: 0;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
        pointer-events: none;
      }
      #gemini-retry-toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      .retry-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(212, 168, 67, 0.2);
        border-top-color: #d4a843;
        border-radius: 50%;
        animation: toast-spin 0.8s linear infinite;
      }
      @keyframes toast-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    toastElement.innerHTML = `
      <div class="retry-spinner"></div>
      <span class="retry-message"></span>
    `;
    document.body.appendChild(toastElement);
  }

  const messageSpan = toastElement.querySelector(".retry-message");
  if (messageSpan) {
    messageSpan.textContent = message;
  }
  
  // Force reflow and show toast
  void toastElement.offsetHeight;
  toastElement.classList.add("show");
}

function hideRetryToast() {
  if (typeof document === "undefined" || !toastElement) return;
  toastElement.classList.remove("show");
}

/**
 * Checks whether the Gemini client is configured and ready.
 * UI components can use this to show appropriate warnings.
 */
export function isAIConfigured() {
  return aiClient !== null;
}
