/**
 * OrganizerDashboard.jsx
 * 
 * Operations dashboard for stadium organizers.
 * Displays incident logs and generates AI-powered prioritized
 * summaries with staffing recommendations.
 * 
 * Features:
 * - Incident log table with severity color-coding
 * - Generate Summary button that calls Gemini
 * - AI-generated prioritized summary + staffing recommendations
 * - Status badges for incident tracking
 */

import React, { useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { generateIncidentSummary } from "../services/incidentService.js";
import { mockIncidents, addMockIncident } from "../data/mockIncidents.js";
import { isAIConfigured } from "../services/geminiClient.js";
import "./OrganizerDashboard.css";

/**
 * Returns a CSS class for severity-based color coding.
 */
function getSeverityClass(severity) {
  switch (severity) {
    case "critical": return "severity-critical";
    case "high": return "severity-high";
    case "medium": return "severity-medium";
    case "low": return "severity-low";
    default: return "";
  }
}

/**
 * Returns a display-friendly status badge.
 */
function getStatusBadge(status) {
  switch (status) {
    case "open": return { label: "Open", className: "status-open" };
    case "in-progress": return { label: "In Progress", className: "status-progress" };
    case "monitoring": return { label: "Monitoring", className: "status-monitoring" };
    case "resolved": return { label: "Resolved", className: "status-resolved" };
    default: return { label: status, className: "" };
  }
}

export default function OrganizerDashboard() {
  const { language, accessibilityMode } = useAppContext();
  const [summaryText, setSummaryText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [incidents, setIncidents] = useState([...mockIncidents]);
  const abortController = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  /**
   * Triggers the AI incident summary generation.
   * Passes current language and accessibility settings to the service.
   */
  const handleGenerateSummary = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setSummaryText("");
    abortController.current = new AbortController();

    try {
      /**
       * AI CALL: Generate a prioritized incident summary with staffing recommendations.
       * The service builds a prompt with all incident data, asking Gemini to
       * rank by urgency, recommend staffing changes, and suggest immediate actions.
       */
      const result = await generateIncidentSummary(language, accessibilityMode, abortController.current.signal);
      setSummaryText(result);
      setLastGenerated(new Date());
    } catch (unexpectedError) {
      if (unexpectedError.name === 'AbortError') return;
      setSummaryText("[Error] Failed to generate incident summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshIncidents = () => {
    addMockIncident();
    setIncidents([...mockIncidents]); // Trigger re-render with new array
    handleGenerateSummary(); // Generate new brief based on updated data
  };

  // Stats for the header
  const openCount = incidents.filter(i => i.status === "open").length;
  const criticalCount = incidents.filter(i => i.severity === "critical" || i.severity === "high").length;

  return (
    <div className="organizer-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>📋 Operations Dashboard</h2>
          <p>Incident monitoring and AI-powered situational analysis.</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-pill stat-open">
            <span className="stat-number">{openCount}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-pill stat-critical">
            <span className="stat-number">{criticalCount}</span>
            <span className="stat-label">High/Critical</span>
          </div>
          <div className="stat-pill stat-total">
            <span className="stat-number">{incidents.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions-bar" style={{ display: "flex", justifyContent: "flex-end", padding: "0 2rem", marginBottom: "1rem" }}>
        <button 
          className="btn" 
          onClick={handleRefreshIncidents}
          disabled={isLoading}
          aria-busy={isLoading}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.5rem 1rem", borderRadius: "8px", color: "white", cursor: "pointer" }}
        >
          {isLoading ? <span className="btn-spinner"></span> : "🔄"} Refresh Incidents
          {isLoading && <span className="sr-only">Loading...</span>}
        </button>
      </div>

      {/* API key warning */}
      {!isAIConfigured() && (
        <div className="api-warning">
          🔑 No Gemini API key detected. Set <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> file to enable AI features.
        </div>
      )}

      {/* Incident log table */}
      <div className="incident-table-wrapper">
        <table className="incident-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Severity</th>
              <th>Type</th>
              <th>Zone</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => {
              const statusBadge = getStatusBadge(incident.status);
              return (
                <tr key={incident.id} className={getSeverityClass(incident.severity)}>
                  <td className="incident-id">{incident.id}</td>
                  <td className="incident-time">
                    {new Date(incident.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td>
                    <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="incident-type">{incident.type}</td>
                  <td className="incident-zone">{incident.zone}</td>
                  <td>
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="incident-desc">{incident.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Generate summary button */}
      <div className="summary-generate-section">
        <button
          className="btn btn-primary generate-summary-btn"
          onClick={handleGenerateSummary}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner"></span>
              Analyzing incidents...
            </>
          ) : (
            <>🤖 Generate AI Operations Brief</>
          )}
        </button>
        {lastGenerated && (
          <span className="last-generated">
            Last generated: {lastGenerated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* AI-generated summary */}
      {summaryText && (
        <div className="summary-result">
          <div className="summary-result-header">
            <span>🤖 AI Operations Brief</span>
          </div>
          <div className="summary-result-content">
            {typeof summaryText === 'string' ? (
              <p>{summaryText}</p>
            ) : summaryText.summary?.startsWith("[Error]") ? (
              <p style={{ color: "var(--accent-red)", background: "rgba(220, 53, 69, 0.1)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(220, 53, 69, 0.25)" }}>{summaryText.summary}</p>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Summary:</strong> {summaryText.summary}
                </div>
                {summaryText.urgent_flag && (
                  <div style={{ marginBottom: "1rem", color: "var(--accent-red)" }}>
                    <strong>Urgent Flag:</strong> {summaryText.urgent_flag}
                  </div>
                )}
                {summaryText.staffing_recommendation && Object.keys(summaryText.staffing_recommendation).length > 0 && (
                  <div>
                    <strong>Staffing Recommendations:</strong>
                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                      {Object.entries(summaryText.staffing_recommendation).map(([zone, count]) => (
                        <li key={zone}>{zone}: {count} volunteers</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
