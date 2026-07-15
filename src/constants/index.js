export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOO_MANY_REQUESTS: 429,
  UNAVAILABLE: 503,
};

export const ERROR_MESSAGES = {
  EMPTY_PROMPT: "[Error] Please provide a valid question or input.",
  PROMPT_TOO_LONG: "[Error] Your input is too long. Please shorten your message and try again.",
  NO_API_KEY: "[Error] AI features require a Gemini API key. Please set VITE_GEMINI_API_KEY in your .env file and restart the app.",
  EMPTY_RESPONSE: "[Error] The AI returned an empty response. Please try again.",
  TIMEOUT: "[Error] The request timed out. The AI service might be busy — please try again in a moment.",
  UNAVAILABLE: "[Error] The AI service is currently unavailable. Please try again in a few moments.",
  RATE_LIMITED: "[Error] Too many requests. Please wait a moment and try again.",
  INVALID_KEY: "[Error] Invalid API key. Please check your VITE_GEMINI_API_KEY in the .env file.",
  GENERIC_ERROR: "[Error] Something went wrong while contacting the AI service. Please try again.",
  COMPONENT_ERROR: "[Error] Failed to load data. Please try again.",
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  MAX_UNAVAILABLE_RETRIES: 3,
  UNAVAILABLE_DELAY_MS: 2000,
};
