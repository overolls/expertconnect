import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Message.scss";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

const Message = () => {
  const { id: conversationId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [messages, setMessages] = useState([]);
  const [receiverData, setReceiverData] = useState(null);
  const bottomRef = useRef(null);

  const getReceiverId = () => {
    if (!currentUser) return null;
    const [id1, id2] = conversationId.split("_");
    return id1 === currentUser.uid ? id2 : id1;
  };

  useEffect(() => {
    const receiverId = getReceiverId();
    if (!receiverId) return;

    const fetchReceiver = async () => {
      const ref = doc(db, "users", receiverId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setReceiverData(snap.data());
      }
    };

    fetchReceiver();
  }, [conversationId]);

 useEffect(() => {
  const checkAndSubscribe = async () => {
    const convoRef = doc(db, "conversations", conversationId);
    const convoSnap = await getDoc(convoRef);

    if (convoSnap.exists()) {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(updatedMessages);
      });

      return unsubscribe;
    }
  };

  let unsubscribe;
  checkAndSubscribe().then((fn) => (unsubscribe = fn));

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [conversationId]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = e.target.message.value.trim();
    if (!message || !currentUser) return;

    const isSeller = currentUser?.isSeller === true;
    const receiverId = getReceiverId();
    const conversationRef = doc(db, "conversations", conversationId);

    try {
      const convoSnap = await getDoc(conversationRef);

      if (!convoSnap.exists()) {
        await setDoc(conversationRef, {
          id: conversationId,
          sellerId: isSeller ? currentUser.uid : receiverId,
          buyerId: isSeller ? receiverId : currentUser.uid,
          readBySeller: isSeller,
          readByBuyer: !isSeller,
          lastMessage: message,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(conversationRef, {
          lastMessage: message,
          updatedAt: serverTimestamp(),
          [isSeller ? "readBySeller" : "readByBuyer"]: true,
        });
      }

      await addDoc(collection(db, "messages"), {
        conversationId,
        desc: message,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      e.target.message.value = "";
    } catch (err) {
      console.error("Message send error:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="message-page">
      <div className="message-container">
        <div className="message-header">
          <Link to="/messages" className="back-link">← Back</Link>
          <div className="chat-with">
            Chat with {receiverData?.username || "User"}
          </div>
        </div>

        <div className="message-thread">
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet.</p>
          ) : (
            messages.map((m) => {
              const isSender = m.userId === currentUser.uid;
              const imgSrc = isSender
                ? currentUser.photoURL || "/img/noavatar.jpg"
                : receiverData?.img || "/img/noavatar.jpg";

              return (
                <div
                  key={m.id}
                  className={`message-item ${isSender ? "sent" : "received"}`}
                >
                  <img src={imgSrc} alt="user" />
                  <div className="message-text">{m.desc}</div>
                </div>
              );
            })
          )}
          <div ref={bottomRef}></div>
        </div>

        <form className="message-form" onSubmit={handleSubmit}>
          <textarea name="message" placeholder="Type your message..." required />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Message;
