/**
 * organizerDashboard.test.jsx
 * 
 * Tests for the OrganizerDashboard component and incidentService.
 * Covers:
 * - Component rendering (incident table, stats, generate button)
 * - AI summary generation trigger (mock successful response)
 * - Error handling on API failure
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../context/AppContext.jsx";
import OrganizerDashboard from "../components/OrganizerDashboard.jsx";

// Mock the gemini client so we don't make real API calls
vi.mock("../services/geminiClient.js", () => ({
  generateText: vi.fn(),
  isAIConfigured: vi.fn(() => true),
}));

import { generateText, isAIConfigured } from "../services/geminiClient.js";

/**
 * Helper to render OrganizerDashboard wrapped in AppProvider.
 */
function renderOrganizerDashboard() {
  return render(
    <AppProvider>
      <OrganizerDashboard />
    </AppProvider>
  );
}

describe("OrganizerDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAIConfigured.mockReturnValue(true);
  });

  // --- Rendering tests ---

  it("renders the dashboard header", () => {
    renderOrganizerDashboard();
    expect(screen.getByText("📋 Operations Dashboard")).toBeInTheDocument();
  });

  it("renders the generate summary button", () => {
    renderOrganizerDashboard();
    expect(screen.getByText("🤖 Generate AI Operations Brief")).toBeInTheDocument();
  });

  it("renders the incident table", () => {
    renderOrganizerDashboard();
    // Check for known incident IDs from mockIncidents
    expect(screen.getByText("INC-001")).toBeInTheDocument();
    expect(screen.getByText("INC-002")).toBeInTheDocument();
  });

  // --- AI interaction tests ---

  it("generates an AI summary when button is clicked", async () => {
    // Incident service expects a JSON formatted string from Gemini
    const mockJsonResponse = JSON.stringify({
      summary: "Medical emergency in Lower Bowl and crowding at Gate A.",
      staffing_recommendation: { "Gate A (North)": 5 },
      urgent_flag: "Dispatch medic to section 114"
    });
    
    // We mock the AI returning the JSON block
    generateText.mockResolvedValue(`\`\`\`json\n${mockJsonResponse}\n\`\`\``);

    renderOrganizerDashboard();
    await userEvent.click(screen.getByText("🤖 Generate AI Operations Brief"));

    // AI response should appear
    await waitFor(() => {
      expect(screen.getByText("Medical emergency in Lower Bowl and crowding at Gate A.")).toBeInTheDocument();
      expect(screen.getByText("Dispatch medic to section 114")).toBeInTheDocument();
      expect(screen.getByText("Gate A (North): 5 volunteers")).toBeInTheDocument();
    });

    // AI header badge should appear
    expect(screen.getByText("🤖 AI Operations Brief")).toBeInTheDocument();
  });

  it("shows loading state while generating summary", async () => {
    // Make the mock hang for a bit
    generateText.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("{}"), 100))
    );

    renderOrganizerDashboard();
    await userEvent.click(screen.getByText("🤖 Generate AI Operations Brief"));

    // Loading state should show
    expect(screen.getByText("Analyzing incidents...")).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText("🤖 AI Operations Brief")).toBeInTheDocument();
    });
  });

  it("handles AI error gracefully", async () => {
    // Mock the catch block getting triggered by an unexpected error
    generateText.mockRejectedValue(new Error("Network timeout"));

    renderOrganizerDashboard();
    await userEvent.click(screen.getByText("🤖 Generate AI Operations Brief"));

    await waitFor(() => {
      expect(screen.getByText(/Failed to generate incident summary/)).toBeInTheDocument();
    });
  });

  it("shows API key warning when AI is not configured", () => {
    isAIConfigured.mockReturnValue(false);
    renderOrganizerDashboard();
    expect(screen.getByText(/No Gemini API key detected/)).toBeInTheDocument();
  });

  it("displays last generated timestamp after summary generation", async () => {
    generateText.mockResolvedValue("{}");

    renderOrganizerDashboard();
    await userEvent.click(screen.getByText("🤖 Generate AI Operations Brief"));

    await waitFor(() => {
      expect(screen.getByText(/Last generated:/)).toBeInTheDocument();
    });
  });
});
