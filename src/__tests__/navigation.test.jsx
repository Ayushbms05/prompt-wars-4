/**
 * navigation.test.jsx
 * 
 * Tests for the NavigationChat component and navigationService.
 * Covers:
 * - Component rendering (input, submit button, quick actions)
 * - Input validation (empty query rejection)
 * - API error handling (graceful error messages)
 * - Successful AI response display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../context/AppContext.jsx";
import NavigationChat from "../components/NavigationChat.jsx";

// Mock the gemini client module so we don't make real API calls in tests
vi.mock("../services/geminiClient.js", () => ({
  generateText: vi.fn(),
  isAIConfigured: vi.fn(() => true),
}));

// Import the mock after vi.mock so we can control its behavior
import { generateText, isAIConfigured } from "../services/geminiClient.js";

/**
 * Helper to render NavigationChat wrapped in AppProvider (required for context).
 */
function renderNavigationChat() {
  return render(
    <AppProvider>
      <NavigationChat />
    </AppProvider>
  );
}

describe("NavigationChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAIConfigured.mockReturnValue(true);
  });

  // --- Rendering tests ---

  it("renders the navigation header", () => {
    renderNavigationChat();
    expect(screen.getByText("🧭 Stadium Navigator")).toBeInTheDocument();
  });

  it("renders the chat input field", () => {
    renderNavigationChat();
    const input = screen.getByPlaceholderText("Ask: How do I get to...?");
    expect(input).toBeInTheDocument();
    expect(input).toBeEnabled();
  });

  it("renders the send button", () => {
    renderNavigationChat();
    const sendBtn = screen.getByLabelText("Send message");
    expect(sendBtn).toBeInTheDocument();
  });

  it("renders quick action chips when no messages exist", () => {
    renderNavigationChat();
    expect(screen.getByText("🚻 Nearest Restroom")).toBeInTheDocument();
    expect(screen.getByText("🍔 Food Court")).toBeInTheDocument();
    expect(screen.getByText("🏥 First Aid")).toBeInTheDocument();
  });

  it("shows API key warning when AI is not configured", () => {
    isAIConfigured.mockReturnValue(false);
    renderNavigationChat();
    expect(screen.getByText(/No Gemini API key detected/)).toBeInTheDocument();
  });

  // --- Input validation tests ---

  it("disables send button when input is empty", () => {
    renderNavigationChat();
    const sendBtn = screen.getByLabelText("Send message");
    expect(sendBtn).toBeDisabled();
  });

  it("enables send button when input has text", async () => {
    renderNavigationChat();
    const input = screen.getByPlaceholderText("Ask: How do I get to...?");
    await userEvent.type(input, "Where is Gate A?");
    const sendBtn = screen.getByLabelText("Send message");
    expect(sendBtn).toBeEnabled();
  });

  // --- AI interaction tests ---

  it("sends a message and displays AI response", async () => {
    // Mock a successful AI response
    generateText.mockResolvedValue(
      "Walk north from Gate A for 2 minutes to reach the North Concourse."
    );

    renderNavigationChat();
    const input = screen.getByPlaceholderText("Ask: How do I get to...?");

    await userEvent.type(input, "How do I get to the North Concourse from Gate A?");
    await userEvent.click(screen.getByLabelText("Send message"));

    // User message should appear
    await waitFor(() => {
      expect(
        screen.getByText("How do I get to the North Concourse from Gate A?")
      ).toBeInTheDocument();
    });

    // AI response should appear
    await waitFor(() => {
      expect(
        screen.getByText("Walk north from Gate A for 2 minutes to reach the North Concourse.")
      ).toBeInTheDocument();
    });
  });

  it("displays error message when AI call fails", async () => {
    // Mock an API error response (service returns error string, doesn't throw)
    generateText.mockResolvedValue(
      "⚠️ Something went wrong while contacting the AI service. Please try again. (Network error)"
    );

    renderNavigationChat();
    const input = screen.getByPlaceholderText("Ask: How do I get to...?");

    await userEvent.type(input, "Where is the restroom?");
    await userEvent.click(screen.getByLabelText("Send message"));

    // Error message should appear in chat, not crash the app
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  it("handles quick action chip clicks", async () => {
    generateText.mockResolvedValue("The nearest restroom is Restrooms N1 on the North Concourse.");

    renderNavigationChat();
    await userEvent.click(screen.getByText("🚻 Nearest Restroom"));

    // The quick action query should appear as a user message
    await waitFor(() => {
      expect(
        screen.getByText("Where is the nearest restroom from Gate A?")
      ).toBeInTheDocument();
    });
  });

  it("clears input after sending a message", async () => {
    generateText.mockResolvedValue("Directions...");

    renderNavigationChat();
    const input = screen.getByPlaceholderText("Ask: How do I get to...?");

    await userEvent.type(input, "Test message");
    await userEvent.click(screen.getByLabelText("Send message"));

    expect(input.value).toBe("");
  });
});
