import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setInteraction,
  setExtracted,
} from "../../store/slices/interactionSlice";
import { sendChat } from "../../services/chatApi";
import ToolTrace from "./ToolTrace";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await sendChat(message);

      // Add AI response
      const aiMessage = {
        type: "ai",
        content: res.data.response || "Action completed",
        timestamp: new Date(),
        actionPerformed: res.data.action_performed,
        state: res.data.state,
      };
      setChatHistory((prev) => [...prev, aiMessage]);

      // Update interaction data if present
      if (res.data.interaction_data) {
        dispatch(setInteraction(res.data.interaction_data));
        dispatch(
          setExtracted(
            Object.keys(res.data.interaction_data).reduce(
              (acc, key) => ({ ...acc, [key]: true }),
              {},
            ),
          ),
        );
      }
    } catch (error) {
      const errorMessage = {
        type: "error",
        content: "Failed to process message. Please try again.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1e293b",
          }}
        >
          AI Assistant
        </h3>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.875rem",
            color: "#64748b",
          }}
        >
          Describe interactions or request changes
        </p>
      </div>

      {/* Messages Container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {chatHistory.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.875rem",
              marginTop: "40px",
            }}
          >
            Start by describing a medical interaction or ask to modify existing
            details
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "12px 16px",
                borderRadius:
                  msg.type === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                backgroundColor:
                  msg.type === "user"
                    ? "#3b82f6"
                    : msg.type === "error"
                      ? "#ef4444"
                      : "#ffffff",
                color: msg.type === "user" ? "#ffffff" : "#1e293b",
                border: msg.type === "ai" ? "1px solid #e2e8f0" : "none",
                boxShadow:
                  msg.type === "ai" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <div style={{ fontSize: "0.875rem", lineHeight: "1.4" }}>
                {msg.content}
              </div>
              {msg.type === "ai" && msg.state ? (
                <ToolTrace state={msg.state} />
              ) : null}
              {msg.actionPerformed && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    display: "inline-block",
                  }}
                >
                  ✓ {msg.actionPerformed}
                </div>
              )}
              <div
                style={{
                  fontSize: "0.75rem",
                  color:
                    msg.type === "user" ? "rgba(255,255,255,0.7)" : "#64748b",
                  marginTop: "4px",
                }}
              >
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: "0.875rem",
              }}
            >
              Processing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              minHeight: "44px",
              maxHeight: "120px",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "0.875rem",
              lineHeight: "1.4",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            style={{
              padding: "12px 20px",
              backgroundColor:
                !message.trim() || isLoading ? "#cbd5e1" : "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: !message.trim() || isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
