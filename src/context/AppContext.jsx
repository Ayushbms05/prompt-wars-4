/**
 * AppContext.jsx
 * 
 * Global application state via React Context.
 * Provides language and accessibility settings to all components
 * so every AI call can include the correct language/accessibility flags.
 */

import { createContext, useContext, useState, useCallback } from "react";

// Supported languages for the multilingual toggle
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

const AppContext = createContext(null);

/**
 * AppProvider wraps the entire app and provides:
 * - language: current language name (e.g., "English", "Spanish")
 * - setLanguage: function to change the language
 * - accessibilityMode: boolean for simplified text + larger fonts
 * - toggleAccessibility: function to toggle accessibility mode
 */
export function AppProvider({ children }) {
  const [language, setLanguage] = useState("English");
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const toggleAccessibility = useCallback(() => {
    setAccessibilityMode(prev => !prev);
  }, []);

  const value = {
    language,
    setLanguage,
    accessibilityMode,
    toggleAccessibility,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Custom hook for consuming the AppContext.
 * Throws if used outside of AppProvider.
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
