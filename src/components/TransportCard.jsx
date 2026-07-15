import { useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { getTransportTips } from "../services/transportService.js";
import { isAIConfigured } from "../services/geminiClient.js";
import "./TransportCard.css";

const GATES = ["Gate A (North)", "Gate B (East)", "Gate C (South)", "Gate D (West)"];

export default function TransportCard() {
  const { language, accessibilityMode } = useAppContext();
  const [selectedGate, setSelectedGate] = useState(GATES[0]);
  const [tips, setTips] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetTips = async () => {
    if (isLoading || !isAIConfigured()) return;
    setIsLoading(true);
    try {
      const response = await getTransportTips(selectedGate, language, accessibilityMode);
      setTips(response);
    } catch (error) {
      console.error("[TransportCard] Error:", error);
      setTips("⚠️ Failed to load tips.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transport-card">
      <div className="transport-card-header">
        <h3>🚌 Transport & Eco Tips</h3>
      </div>
      <div className="transport-card-controls">
        <select 
          value={selectedGate} 
          onChange={(e) => setSelectedGate(e.target.value)}
          className="transport-gate-select"
          disabled={isLoading}
          aria-label="Select entry gate"
        >
          {GATES.map(gate => <option key={gate} value={gate}>{gate}</option>)}
        </select>
        <button 
          onClick={handleGetTips} 
          className="btn btn-primary transport-btn"
          disabled={isLoading || !isAIConfigured()}
        >
          {isLoading ? "⏳" : "Get Tips"}
        </button>
      </div>
      {tips && (
        <div className="transport-tips-result" aria-live="polite">
          {tips}
        </div>
      )}
    </div>
  );
}
