import React, { useState } from "react";
import "./ChatPopup.scss";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaComments, FaUser } from "react-icons/fa";
import { db } from "../../utils/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE;
const supportId = "rwzbXHMay1dTq3U8bi6Ad05fkcm1";

const ChatPopup = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("ai");

  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "Hi there! How can I assist you today?" },
  ]);
  const [supportMessages, setSupportMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user?.uid || "anonymous";

    if (tab === "ai") {
      const newMessages = [...aiMessages, { role: "user", text: input }];
      setAiMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await axios.post(`${API_BASE}/api/ai`, {
          message: input,
        });
        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.data.reply?.slice(0, 400) || "No response.",
          },
        ]);
      } catch (err) {
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", text: "⚠️ Something went wrong." },
        ]);
      }

      setLoading(false);
    } else {
      // Support tab
      const combinedId =
        userId > supportId ? userId + supportId : supportId + userId;

      const userMessage = { role: "user", text: input };
      setSupportMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        // Create conversation if not exists
        await setDoc(doc(db, "conversations", combinedId), {
          participants: [userId, supportId],
          updatedAt: serverTimestamp(),
        });

        // Store message
        await addDoc(collection(db, "messages"), {
          conversationId: combinedId,
          senderId: userId,
          receiverId: supportId,
          text: input,
          timestamp: serverTimestamp(),
        });

        setSupportMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "✅ Message sent to support. They'll reply soon.",
          },
        ]);
      } catch (err) {
        setSupportMessages((prev) => [
          ...prev,
          { role: "assistant", text: "⚠️ Failed to send support message." },
        ]);
      }

      setLoading(false);
    }
  };

  const activeMessages = tab === "ai" ? aiMessages : supportMessages;

  return (
    <div className="chat-popup-container">
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        <FaComments />
      </button>

      {open && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="tabs">
              <button
                className={tab === "ai" ? "active" : ""}
                onClick={() => setTab("ai")}
              >
                <FaRobot /> AI
              </button>
              <button
                className={tab === "support" ? "active" : ""}
                onClick={() => setTab("support")}
              >
                <FaUser /> Support
              </button>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chat-body">
            {activeMessages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <span>{msg.text}</span>
              </div>
            ))}
            {loading && <div className="message assistant">Typing...</div>}
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                tab === "ai"
                  ? "Ask AI anything..."
                  : "Send a message to support..."
              }
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
