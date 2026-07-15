/**
 * crowdAlert.test.jsx
 * 
 * Tests for the CrowdAlert component and crowdAlertService.
 * Covers:
 * - Component rendering (occupancy bars, generate button)
 * - Occupancy data display
 * - AI alert generation trigger
 * - Error handling on API failure
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../context/AppContext.jsx";
import CrowdAlert from "../components/CrowdAlert.jsx";

// Mock the gemini client so we don't make real API calls
vi.mock("../services/geminiClient.js", () => ({
  generateText: vi.fn(),
  isAIConfigured: vi.fn(() => true),
}));

import { generateText, isAIConfigured } from "../services/geminiClient.js";

/**
 * Helper to render CrowdAlert wrapped in AppProvider.
 */
function renderCrowdAlert() {
  return render(
    <AppProvider>
      <CrowdAlert />
    </AppProvider>
  );
}

describe("CrowdAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAIConfigured.mockReturnValue(true);
  });

  // --- Rendering tests ---

  it("renders the crowd monitor header", () => {
    renderCrowdAlert();
    expect(screen.getByText("👥 Crowd Monitor")).toBeInTheDocument();
  });

  it("renders the generate alert button", () => {
    renderCrowdAlert();
    expect(screen.getByText("🚨 Generate AI Congestion Alert")).toBeInTheDocument();
  });

  it("renders occupancy bars for all zones", () => {
    renderCrowdAlert();
    // Check for a few known zone names from mockOccupancy
    expect(screen.getByText("Gate A (North)")).toBeInTheDocument();
    expect(screen.getByText("Gate B (East)")).toBeInTheDocument();
    expect(screen.getByText("North Concourse")).toBeInTheDocument();
    expect(screen.getByText("Lower Bowl Seating")).toBeInTheDocument();
  });

  it("displays occupancy percentages", () => {
    renderCrowdAlert();
    // Gate A is at 92%
    expect(screen.getByText("92%")).toBeInTheDocument();
    // Gate B is at 45%
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("shows critical zone count badge", () => {
    renderCrowdAlert();
    // Multiple zones are above 85%, so the badge should appear
    const badge = screen.getByText(/Critical Zone/);
    expect(badge).toBeInTheDocument();
  });

  it("renders progress bars with correct ARIA attributes", () => {
    renderCrowdAlert();
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThan(0);

    // Check a specific one
    const gateABar = screen.getByLabelText("Gate A (North): 92% occupied");
    expect(gateABar).toHaveAttribute("aria-valuenow", "92");
  });

  // --- AI interaction tests ---

  it("generates an AI alert when button is clicked", async () => {
    generateText.mockResolvedValue(
      "🚨 ALERT: Gate A (North) is at 92% capacity and rising. Redirect fans to Gate D (West) at 30%."
    );

    renderCrowdAlert();
    await userEvent.click(screen.getByText("🚨 Generate AI Congestion Alert"));

    // AI response should appear
    await waitFor(() => {
      expect(screen.getByText(/Gate A \(North\) is at 92%/)).toBeInTheDocument();
    });

    // AI header badge should appear
    expect(screen.getByText("🤖 AI Congestion Analysis")).toBeInTheDocument();
  });

  it("shows loading state while generating alert", async () => {
    // Make the mock hang for a bit
    generateText.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("Alert text"), 100))
    );

    renderCrowdAlert();
    await userEvent.click(screen.getByText("🚨 Generate AI Congestion Alert"));

    // Loading state should show
    expect(screen.getByText("Analyzing zones...")).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText("Alert text")).toBeInTheDocument();
    });
  });

  it("handles AI error gracefully", async () => {
    generateText.mockResolvedValue(
      "⚠️ Something went wrong while contacting the AI service. Please try again. (Timeout)"
    );

    renderCrowdAlert();
    await userEvent.click(screen.getByText("🚨 Generate AI Congestion Alert"));

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  it("shows API key warning when AI is not configured", () => {
    isAIConfigured.mockReturnValue(false);
    renderCrowdAlert();
    expect(screen.getByText(/No Gemini API key detected/)).toBeInTheDocument();
  });

  it("displays last generated timestamp after alert generation", async () => {
    generateText.mockResolvedValue("Alert generated successfully.");

    renderCrowdAlert();
    await userEvent.click(screen.getByText("🚨 Generate AI Congestion Alert"));

    await waitFor(() => {
      expect(screen.getByText(/Last generated:/)).toBeInTheDocument();
    });
  });
});
