import React, { useState } from "react";
import "./ChatBot.scss";

// ✅ Use environment variable for backend base URL
const API_BASE = import.meta.env.VITE_API_BASE;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
    { role: "assistant", content: (data.reply || "No response.").slice(0, 400) },

      ]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error getting response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-popup">
      <button className="toggle-btn" onClick={toggleChat}>
        💬
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            🤖 AI Support
            <span onClick={toggleChat}>×</span>
          </div>
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="msg assistant">Typing...</div>}
          </div>
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
