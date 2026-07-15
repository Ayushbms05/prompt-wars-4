/**
 * NavigationChat.jsx
 * 
 * Chat-style UI for the stadium navigation assistant.
 * Users type natural-language questions about getting around the stadium
 * and receive AI-generated step-by-step directions.
 * 
 * Features:
 * - Chat bubble history (user messages + AI responses)
 * - Quick-action suggestion chips for common destinations
 * - Loading skeleton while waiting for AI response
 * - Full error handling for API failures
 */

import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { getDirections } from "../services/navigationService.js";
import { isAIConfigured } from "../services/geminiClient.js";
import TransportCard from "./TransportCard.jsx";
import "./NavigationChat.css";

// Quick-action chips for common navigation queries
const QUICK_ACTIONS = [
  { label: "🚻 Nearest Restroom", query: "Where is the nearest restroom from Gate A?" },
  { label: "🍔 Food Court", query: "How do I get to the food court from the North Concourse?" },
  { label: "🏥 First Aid", query: "Where is the closest first aid station?" },
  { label: "🛍️ Merchandise", query: "How do I find the official merchandise store?" },
  { label: "♿ Accessible Route", query: "What's the accessible route from Gate B to the Upper Deck?" },
  { label: "🙏 Prayer Room", query: "Where is the prayer room?" },
];

export default function NavigationChat() {
  const { language, accessibilityMode } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isRequestInFlight = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Sends the user's navigation query to the AI and displays the response.
   * Handles validation, loading state, and error display.
   */
  const handleSendMessage = async (query) => {
    if (isRequestInFlight.current) return;
    const trimmedQuery = (query || inputValue).trim();

    // Input validation — don't send empty messages
    if (!trimmedQuery) return;

    isRequestInFlight.current = true;
    setIsLoading(true);

    // Add user message to chat
    const userMessage = { role: "user", content: trimmedQuery, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      /**
       * AI CALL: Get navigation directions from Gemini.
       * Passes the user's query along with current language and accessibility settings.
       * The service handles prompt construction and error wrapping.
       */
      const aiResponse = await getDirections(trimmedQuery, language, accessibilityMode);

      const aiMessage = { role: "assistant", content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (unexpectedError) {
      // Safety net — the service should never throw, but just in case
      console.error("[NavigationChat] Unexpected error:", unexpectedError);
      const errorMessage = {
        role: "assistant",
        content: "⚠️ An unexpected error occurred. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      isRequestInFlight.current = false;
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="navigation-chat">
      <div className="chat-header-info">
        <h2>🧭 Stadium Navigator</h2>
        <p>Ask me how to get anywhere in the stadium — gates, food, restrooms, and more.</p>
      </div>

      <TransportCard />

      {/* API key warning */}
      {!isAIConfigured() && (
        <div className="api-warning">
          🔑 No Gemini API key detected. Set <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> file to enable AI features.
        </div>
      )}

      {/* Quick action chips */}
      {messages.length === 0 && (
        <div className="quick-actions">
          <p className="quick-actions-label">Try asking:</p>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                className="quick-action-chip"
                onClick={() => handleSendMessage(action.query)}
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="chat-messages" role="log" aria-label="Chat messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} ${msg.isError ? "chat-bubble-error" : ""}`}
          >
            <div className="chat-bubble-avatar">
              {msg.role === "user" ? "👤" : "🤖"}
            </div>
            <div className="chat-bubble-content">
              <div className="chat-bubble-text">{msg.content}</div>
              <span className="chat-bubble-time">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="chat-bubble chat-bubble-ai">
            <div className="chat-bubble-avatar">🤖</div>
            <div className="chat-bubble-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask: How do I get to...?"
          disabled={isLoading}
          aria-label="Navigation question"
          maxLength={500}
        />
        <button
          className="chat-send-btn"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send message"
        >
          {isLoading ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}
