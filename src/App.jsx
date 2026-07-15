/**
 * App.jsx
 * 
 * Root application component for FanMate 2026.
 * Provides tab-based navigation between the three main features:
 * 1. Navigate — Stadium navigation chatbot
 * 2. Crowd Alerts — Zone occupancy monitoring + AI alerts
 * 3. Organizer — Incident dashboard + AI operations brief
 * 
 * Wraps everything in AppProvider (global state) and ErrorBoundary (crash safety).
 * Applies accessibility-mode class to root when toggled.
 */

import React, { useState, useCallback, Suspense } from "react";
import { AppProvider, useAppContext } from "./context/AppContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Header from "./components/Header.jsx";
import "./App.css";

const NavigationChat = React.lazy(() => import("./components/NavigationChat.jsx"));
const CrowdAlert = React.lazy(() => import("./components/CrowdAlert.jsx"));
const OrganizerDashboard = React.lazy(() => import("./components/OrganizerDashboard.jsx"));

/**
 * Inner app component that has access to AppContext.
 * Separated from App so we can read accessibilityMode.
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState("navigate");
  const { accessibilityMode } = useAppContext();

  /**
   * Stable callback reference for tab changes.
   * Wrapped in useCallback with no dependencies because setActiveTab is already
   * a stable reference from useState — this ensures Header (React.memo) skips
   * re-renders when unrelated state like accessibilityMode changes.
   */
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  /**
   * Renders the currently active tab's content.
   * Each tab component independently manages its own AI interactions.
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case "navigate":
        return <NavigationChat />;
      case "crowds":
        return <CrowdAlert />;
      case "organizer":
        return <OrganizerDashboard />;
      default:
        return <NavigationChat />;
    }
  };

  return (
    <div className={`app ${accessibilityMode ? "accessibility-mode" : ""}`}>
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="app-main">
        <div className="main-content">
          <div className="tab-content" key={activeTab}>
            <Suspense fallback={<div className="loading-fallback">Loading feature...</div>}>
              {renderTabContent()}
            </Suspense>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        FanMate 2026 — AI-Powered Stadium Companion &nbsp;|&nbsp;
        Powered by <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Gemini AI</a>
        &nbsp;|&nbsp; FIFA World Cup 2026™
      </footer>
    </div>
  );
}

/**
 * Root App component.
 * Wraps everything in providers and error boundary.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
