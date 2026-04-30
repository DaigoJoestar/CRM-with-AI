import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setInteraction, setExtracted } from "../../store/slices/interactionSlice";
import { sendChat } from "../../services/chatApi";
import ToolTrace from "./ToolTrace";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

  .ci-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'Inter', sans-serif;
    background: #fafaf9;
    border-radius: 14px;
    border: 0.5px solid rgba(0,0,0,0.1);
    overflow: hidden;
  }

  /* ── Header ── */
  .ci-header {
    padding: 14px 18px;
    background: #fff;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ci-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #E1F5EE;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ci-avatar-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #1D9E75;
  }

  .ci-header-text h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .ci-header-text p {
    margin: 1px 0 0;
    font-size: 12px;
    color: #999;
  }

  .ci-status {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #1D9E75;
    font-weight: 500;
  }

  .ci-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #1D9E75;
    animation: ci-pulse 2s ease infinite;
  }

  .ci-status-dot--busy {
    background: #EF9F27;
    animation: ci-pulse 0.8s ease infinite;
  }

  /* ── Messages ── */
  .ci-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.1) transparent;
  }

  .ci-messages::-webkit-scrollbar { width: 4px; }
  .ci-messages::-webkit-scrollbar-track { background: transparent; }
  .ci-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 99px; }

  .ci-empty {
    margin: auto;
    text-align: center;
    color: #bbb;
    font-size: 13px;
    line-height: 1.6;
    padding: 2rem;
  }

  .ci-empty-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f0f0ee;
    margin: 0 auto 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ci-msg-row {
    display: flex;
    gap: 8px;
    animation: ci-fadein 0.2s ease forwards;
  }

  .ci-msg-row--user  { justify-content: flex-end; }
  .ci-msg-row--ai    { justify-content: flex-start; }
  .ci-msg-row--error { justify-content: flex-start; }

  .ci-msg-icon {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    margin-top: 2px;
  }

  .ci-msg-icon--ai    { background: #E1F5EE; color: #0F6E56; }
  .ci-msg-icon--error { background: #FCEBEB; color: #A32D2D; }

  .ci-bubble {
    max-width: 72%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.55;
  }

  .ci-bubble--user {
    background: #1a1a1a;
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .ci-bubble--ai {
    background: #fff;
    color: #1a1a1a;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-bottom-left-radius: 4px;
  }

  .ci-bubble--error {
    background: #FCEBEB;
    color: #A32D2D;
    border: 0.5px solid rgba(226,75,74,0.2);
    border-bottom-left-radius: 4px;
  }

  .ci-action-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    padding: 3px 8px;
    background: #E1F5EE;
    color: #0F6E56;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 500;
  }

  .ci-timestamp {
    font-size: 11px;
    color: #bbb;
    margin-top: 5px;
    font-family: 'Inter', monospace;
  }

  .ci-timestamp--user { color: rgba(255,255,255,0.45); }

  /* ── Typing indicator ── */
  .ci-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 14px;
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    width: fit-content;
  }

  .ci-typing span {
    display: block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ccc;
    animation: ci-bounce 1.2s ease infinite;
  }

  .ci-typing span:nth-child(2) { animation-delay: 0.15s; }
  .ci-typing span:nth-child(3) { animation-delay: 0.3s; }

  /* ── Input ── */
  .ci-input-area {
    padding: 14px 18px;
    background: #fff;
    border-top: 0.5px solid rgba(0,0,0,0.08);
  }

  .ci-input-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: #fafaf9;
    border: 0.5px solid rgba(0,0,0,0.12);
    border-radius: 12px;
    padding: 8px 10px 8px 14px;
    transition: border-color 0.2s;
  }

  .ci-input-row:focus-within {
    border-color: rgba(0,0,0,0.25);
  }

  .ci-textarea {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: #1a1a1a;
    resize: none;
    min-height: 22px;
    max-height: 100px;
    line-height: 1.5;
    padding: 4px 0;
  }

  .ci-textarea::placeholder { color: #bbb; }
  .ci-textarea:disabled { opacity: 0.5; }

  .ci-send-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: #1a1a1a;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, transform 0.1s;
  }

  .ci-send-btn:disabled {
    background: #e5e5e5;
    cursor: not-allowed;
  }

  .ci-send-btn:not(:disabled):hover  { background: #333; }
  .ci-send-btn:not(:disabled):active { transform: scale(0.94); }

  .ci-send-icon {
    width: 14px;
    height: 14px;
  }

  .ci-hint {
    font-size: 11px;
    color: #ccc;
    margin-top: 7px;
    text-align: center;
    letter-spacing: 0.01em;
  }

  /* ── Animations ── */
  @keyframes ci-fadein {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes ci-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%           { transform: translateY(-4px); }
  }

  @keyframes ci-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
`;

const SendIcon = () => (
  <svg className="ci-send-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor" />
  </svg>
);

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("ci-styles")) {
      const tag = document.createElement("style");
      tag.id = "ci-styles";
      tag.textContent = styles;
      document.head.appendChild(tag);
    }
    return () => { document.getElementById("ci-styles")?.remove(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = { type: "user", content: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const res = await sendChat(message);
      const aiMessage = {
        type: "ai",
        content: res.data.response || "Action completed",
        timestamp: new Date(),
        actionPerformed: res.data.action_performed,
        state: res.data.state,
      };
      setChatHistory(prev => [...prev, aiMessage]);

      // Prefer explicit interaction_data from the backend, but also
      // merge in top-level `state` fields (next_steps, discussion_topics, etc.)
      // so medical insights and NBA suggestions are reflected in the UI
      const interactionData = res.data.interaction_data || {};
      const returnedState = res.data.state || {};

      const mergedInteraction = {
        ...interactionData,
        // overlay common fields that tools may populate directly on state
        hcp_name: interactionData.hcp_name || returnedState.hcp_name || "",
        discussion_topics: interactionData.discussion_topics || returnedState.discussion_topics || [],
        sentiment: interactionData.sentiment || returnedState.sentiment || "Neutral",
        next_steps: interactionData.next_steps || returnedState.next_steps || "",
        last_interaction_id: interactionData.id || returnedState.last_interaction_id || returnedState.last_interaction || "",
        nba_recommendation: returnedState.nba_recommendation || interactionData.nba_recommendation || "",
        compliance_check: (interactionData.compliance_check !== undefined) ? interactionData.compliance_check : (returnedState.compliance_check !== undefined ? returnedState.compliance_check : true),
      };

      // Dispatch the merged interaction so the InteractionCard and other UI
      // components show medical insights and NBA recommendations even when
      // the backend did not return full `interaction_data`.
      dispatch(setInteraction(mergedInteraction));
      dispatch(setExtracted(
        Object.keys(mergedInteraction).reduce(
          (acc, key) => ({ ...acc, [key]: true }), {}
        )
      ));
    } catch (error) {
      setChatHistory(prev => [...prev, {
        type: "error",
        content: "Failed to process message. Please try again.",
        timestamp: new Date(),
      }]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ci-wrap">

      {/* Header */}
      <div className="ci-header">
        <div className="ci-avatar">
          <div className="ci-avatar-dot" />
        </div>
        <div className="ci-header-text">
          <h3>AI Assistant</h3>
          <p>Describe interactions or request changes</p>
        </div>
        <div className="ci-status">
          <div className={`ci-status-dot${isLoading ? " ci-status-dot--busy" : ""}`} />
          {isLoading ? "Thinking" : "Ready"}
        </div>
      </div>

      {/* Messages */}
      <div className="ci-messages">
        {chatHistory.length === 0 && (
          <div className="ci-empty">
            <div className="ci-empty-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5A6.5 6.5 0 1 0 14.5 8 6.507 6.507 0 0 0 8 1.5zm.75 9.75h-1.5v-4.5h1.5zm0-6h-1.5v-1.5h1.5z" fill="#ccc"/>
              </svg>
            </div>
            Describe a medical interaction<br />or ask to modify existing details
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`ci-msg-row ci-msg-row--${msg.type}`}>
            {msg.type !== "user" && (
              <div className={`ci-msg-icon ci-msg-icon--${msg.type}`}>
                {msg.type === "ai" ? "AI" : "!"}
              </div>
            )}
            <div>
              <div className={`ci-bubble ci-bubble--${msg.type}`}>
                {msg.content}
                {msg.type === "ai" && msg.state && <ToolTrace state={msg.state} />}
                {msg.actionPerformed && (
                  <div className="ci-action-badge">
                    <span>✓</span> {msg.actionPerformed}
                  </div>
                )}
              </div>
              <div className={`ci-timestamp${msg.type === "user" ? " ci-timestamp--user" : ""}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ci-msg-row ci-msg-row--ai">
            <div className="ci-msg-icon ci-msg-icon--ai">AI</div>
            <div className="ci-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ci-input-area">
        <div className="ci-input-row">
          <textarea
            ref={textareaRef}
            className="ci-textarea"
            value={message}
            onChange={e => { setMessage(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            disabled={isLoading}
            rows={1}
          />
          <button
            className="ci-send-btn"
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        <div className="ci-hint">Enter to send · Shift+Enter for new line</div>
      </div>

    </div>
  );
};

export default ChatInterface;