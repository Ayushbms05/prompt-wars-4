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
import { HTTP_STATUS, ERROR_MESSAGES, RETRY_CONFIG } from "../constants/index.js";

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

// --- Cache ---
const responseCache = new Map();

/**
 * Sends a prompt to the Gemini API and returns the generated text.
 * 
 * This function is the ONLY place in the app that talks to the AI API.
 * It validates input, enforces a timeout, and catches all errors so
 * the calling component never has to worry about crashes.
 * 
 * @param {string} prompt - The full prompt to send to Gemini
 * @param {AbortSignal} [signal] - Optional external abort signal
 * @returns {Promise<string>} The generated text, or an error message string
 */
export async function generateText(prompt, signal) {
  // --- Input validation ---
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return ERROR_MESSAGES.EMPTY_PROMPT;
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return ERROR_MESSAGES.PROMPT_TOO_LONG;
  }

  // --- Check Cache ---
  const cacheKey = prompt.trim();
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  // --- Check API key availability ---
  if (!aiClient) {
    return ERROR_MESSAGES.NO_API_KEY;
  }

  let attempt = 0;
  let unavailableRetries = 0;

  try {
    while (true) {
      console.log(`[FanMate] Gemini API called. Attempt (429: ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES + 1}, 503: ${unavailableRetries + 1}/${RETRY_CONFIG.MAX_UNAVAILABLE_RETRIES + 1})`);
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      // Link external signal if provided
      const abortHandler = () => controller.abort();
      if (signal) {
        if (signal.aborted) {
           clearTimeout(timeoutId);
           throw new DOMException("Aborted", "AbortError");
        }
        signal.addEventListener("abort", abortHandler);
      }

      try {
        /**
         * AI CALL: Send the prompt to Gemini 3 Flash.
         * We wrap the SDK call in a Promise.race to enforce our timeout and abort signal.
         */
        const apiCall = aiClient.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

        const abortPromise = new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        const response = await Promise.race([apiCall, abortPromise]);

        clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", abortHandler);
        }

        // Extract text from the response
        const text = response?.text;

        if (!text || text.trim().length === 0) {
          return ERROR_MESSAGES.EMPTY_RESPONSE;
        }
        
        // Cache and return
        if (responseCache.size >= 50) {
          const firstKey = responseCache.keys().next().value;
          responseCache.delete(firstKey);
        }
        responseCache.set(cacheKey, text);
        return text;
      } catch (error) {
        clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", abortHandler);
        }

        // --- Error handling with explicit logging ---
        console.error(`[FanMate] Gemini API error (Model: ${MODEL_NAME}, Status: ${error.status || 'unknown'}, Attempt: ${attempt + unavailableRetries + 1}):`, error);

        if (error.name === "AbortError") {
          // If aborted by the user/component unmount
          if (signal && signal.aborted) {
            throw error; // Let the component handle it (or ignore it)
          }
          return ERROR_MESSAGES.TIMEOUT;
        }

        // Retry on 503 UNAVAILABLE
        if (error.status === HTTP_STATUS.UNAVAILABLE) {
          if (unavailableRetries < RETRY_CONFIG.MAX_UNAVAILABLE_RETRIES) {
            unavailableRetries++;
            showRetryToast("Model is busy, retrying...");
            await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.UNAVAILABLE_DELAY_MS));
            continue; // Retry loop
          }
          return ERROR_MESSAGES.UNAVAILABLE;
        }

        if (error.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
          if (attempt < RETRY_CONFIG.MAX_RETRIES) {
            attempt++;
            const delay = 1000 * Math.pow(2, attempt - 1);
            console.warn(`[FanMate] Rate limited (429). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry loop
          }
          return ERROR_MESSAGES.RATE_LIMITED;
        }

        if (error.status === HTTP_STATUS.UNAUTHORIZED || error.status === HTTP_STATUS.FORBIDDEN) {
          return ERROR_MESSAGES.INVALID_KEY;
        }

        return ERROR_MESSAGES.GENERIC_ERROR;
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
