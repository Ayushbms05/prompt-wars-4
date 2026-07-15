/**
 * AppContext.jsx
 * 
 * Global application state via React Context.
 * Provides language and accessibility settings to all components
 * so every AI call can include the correct language/accessibility flags.
 */
/* eslint-disable react/only-export-components */

import { createContext, useContext, useState, useCallback } from "react";



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
