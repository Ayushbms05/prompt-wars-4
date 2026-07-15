/**
 * CrowdAlert.jsx
 * 
 * Crowd congestion alert generator.
 * Displays zone-occupancy bars and generates AI-powered
 * congestion warnings with alternate route suggestions.
 * 
 * Features:
 * - Visual occupancy bars with color-coded severity
 * - Generate Alert button that calls Gemini
 * - AI-generated warning with actionable recommendations
 * - Auto-highlights critical zones (>80%)
 */

import { useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { generateCrowdAlert } from "../services/crowdAlertService.js";
import { mockOccupancy } from "../data/mockOccupancy.js";
import { isAIConfigured } from "../services/geminiClient.js";
import "./CrowdAlert.css";

/**
 * Returns a severity class based on occupancy percentage.
 */
function getOccupancySeverity(percent) {
  if (percent >= 85) return "critical";
  if (percent >= 70) return "warning";
  if (percent >= 50) return "moderate";
  return "normal";
}

/**
 * Returns a trend arrow icon.
 */
function getTrendIcon(trend) {
  switch (trend) {
    case "rising": return "📈";
    case "falling": return "📉";
    default: return "➡️";
  }
}

export default function CrowdAlert() {
  const { language, accessibilityMode } = useAppContext();
  const [alertText, setAlertText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  /**
   * Triggers the AI crowd alert generation.
   * Passes current language and accessibility settings to the service.
   */
  const handleGenerateAlert = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setAlertText("");

    try {
      /**
       * AI CALL: Generate a crowd congestion alert from zone-occupancy data.
       * The service builds a prompt with all zone data and stadium map,
       * asking Gemini to identify critical zones and suggest alternate routes.
       */
      const result = await generateCrowdAlert(language, accessibilityMode);
      setAlertText(result);
      setLastGenerated(new Date());
    } catch (unexpectedError) {
      console.error("[CrowdAlert] Unexpected error:", unexpectedError);
      setAlertText("⚠️ Failed to generate crowd alert. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Count critical zones for the summary badge
  const criticalCount = mockOccupancy.filter(z => z.occupancyPercent >= 85).length;

  return (
    <div className="crowd-alert">
      <div className="crowd-alert-header">
        <div>
          <h2>👥 Crowd Monitor</h2>
          <p>Real-time zone occupancy with AI-powered congestion analysis.</p>
        </div>
        {criticalCount > 0 && (
          <div className="critical-badge">
            {criticalCount} Critical Zone{criticalCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* API key warning */}
      {!isAIConfigured() && (
        <div className="api-warning">
          🔑 No Gemini API key detected. Set <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> file to enable AI features.
        </div>
      )}

      {/* Occupancy bars */}
      <div className="occupancy-grid">
        {mockOccupancy.map((zone) => {
          const severity = getOccupancySeverity(zone.occupancyPercent);
          return (
            <div key={zone.zoneId} className={`occupancy-card occupancy-${severity}`}>
              <div className="occupancy-card-header">
                <span className="occupancy-zone-name">{zone.zoneName}</span>
                <span className="occupancy-trend">{getTrendIcon(zone.trend)}</span>
              </div>
              <div className="occupancy-bar-container">
                <div
                  className={`occupancy-bar occupancy-bar-${severity}`}
                  style={{ width: `${zone.occupancyPercent}%` }}
                  role="progressbar"
                  aria-valuenow={zone.occupancyPercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${zone.zoneName}: ${zone.occupancyPercent}% occupied`}
                />
              </div>
              <div className="occupancy-stats">
                <span className="occupancy-percent">{zone.occupancyPercent}%</span>
                <span className="occupancy-count">{zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate alert button */}
      <div className="alert-generate-section">
        <button
          className="btn btn-primary generate-alert-btn"
          onClick={handleGenerateAlert}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner"></span>
              Analyzing zones...
            </>
          ) : (
            <>🚨 Generate AI Congestion Alert</>
          )}
        </button>
        {lastGenerated && (
          <span className="last-generated">
            Last generated: {lastGenerated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* AI-generated alert */}
      {alertText && (
        <div className="alert-result" role="alert">
          <div className="alert-result-header">
            <span>🤖 AI Congestion Analysis</span>
          </div>
          <div className="alert-result-content">
            {alertText}
          </div>
        </div>
      )}
    </div>
  );
}
