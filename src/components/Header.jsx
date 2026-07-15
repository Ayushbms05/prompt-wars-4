/**
 * Header.jsx
 * 
 * Top navigation bar with:
 * - App branding (logo + title)
 * - Language selector dropdown (multilingual toggle)
 * - Accessibility mode toggle switch
 * - Tab navigation
 */

import React from "react";
import PropTypes from "prop-types";
import { useAppContext } from "../context/AppContext.jsx";
import { SUPPORTED_LANGUAGES } from "../constants/index.js";
import "./Header.css";

const Header = React.memo(function Header({ activeTab, onTabChange }) {
  const { language, setLanguage, accessibilityMode, toggleAccessibility } = useAppContext();

  return (
    <header className="header">
      <div className="header-top">
        {/* App branding */}
        <div className="header-brand">
          <span className="header-logo">⚽</span>
          <div>
            <h1 className="header-title">FanMate 2026</h1>
            <span className="header-subtitle">AI Stadium Companion</span>
          </div>
        </div>

        {/* Settings controls */}
        <div className="header-controls">
          {/* Multilingual toggle */}
          <div className="language-selector">
            <label htmlFor="language-select" className="sr-only">Language</label>
            <span className="language-icon">🌐</span>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
              aria-label="Select language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.label}>
                  {lang.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Accessibility toggle */}
          <button
            className={`accessibility-toggle ${accessibilityMode ? "active" : ""}`}
            onClick={toggleAccessibility}
            aria-label={`Accessibility mode: ${accessibilityMode ? "on" : "off"}`}
            title="Toggle accessibility mode (larger text, simpler language)"
          >
            <span className="accessibility-icon">♿</span>
            <span className="accessibility-label">
              {accessibilityMode ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="header-tabs" role="tablist" aria-label="Main navigation">
        <button
          role="tab"
          aria-selected={activeTab === "navigate"}
          className={`tab ${activeTab === "navigate" ? "tab-active" : ""}`}
          onClick={() => onTabChange("navigate")}
        >
          <span className="tab-icon">🧭</span>
          Navigate
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "crowds"}
          className={`tab ${activeTab === "crowds" ? "tab-active" : ""}`}
          onClick={() => onTabChange("crowds")}
        >
          <span className="tab-icon">👥</span>
          Crowd Alerts
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "organizer"}
          className={`tab ${activeTab === "organizer" ? "tab-active" : ""}`}
          onClick={() => onTabChange("organizer")}
        >
          <span className="tab-icon">📋</span>
          Organizer
        </button>
      </nav>
    </header>
  );
});

Header.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Header;
