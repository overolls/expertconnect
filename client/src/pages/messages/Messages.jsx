import React, { useEffect, useState } from "react";
import "./Messages.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isSeller = currentUser?.isSeller === true;
  const queryClient = useQueryClient();
  const [usernames, setUsernames] = useState({});

  const { isLoading, error, data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!currentUser?.uid) throw new Error("User not found");

      const q = query(
        collection(db, "conversations"),
        where(isSeller ? "sellerId" : "buyerId", "==", currentUser.uid),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const mutation = useMutation({
    mutationFn: async (id) => {
      const conversationRef = doc(db, "conversations", id);
      await updateDoc(conversationRef, {
        [isSeller ? "readBySeller" : "readByBuyer"]: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  useEffect(() => {
    const fetchUsernames = async () => {
      if (!conversations) return;

      const idsToFetch = new Set();
      conversations.forEach((c) => {
        const otherId = isSeller ? c.buyerId : c.sellerId;
        if (!usernames[otherId]) idsToFetch.add(otherId);
      });

      const newUsernames = { ...usernames };
      for (const uid of idsToFetch) {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          newUsernames[uid] = userSnap.data().username || "Unknown";
        }
      }
      setUsernames(newUsernames);
    };

    fetchUsernames();
  }, [conversations]);

  const handleRead = (id) => mutation.mutate(id);

  return (
    <div className="messages-page">
      <div className="messages-container">
        <h2>Inbox</h2>

        {isLoading ? (
          <p className="status-text">Loading...</p>
        ) : error ? (
          <p className="status-text error">Failed to load messages.</p>
        ) : !conversations || conversations.length === 0 ? (
          <p className="status-text">You have no conversations yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{isSeller ? "Buyer" : "Seller"}</th>
                <th>Last Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => {
                const isUnread =
                  (isSeller && !c.readBySeller) ||
                  (!isSeller && !c.readByBuyer);

                const otherUserId = isSeller ? c.buyerId : c.sellerId;
                const otherUsername = usernames[otherUserId] || otherUserId;

                return (
                  <tr key={c.id} className={isUnread ? "unread" : ""}>
                    <td>{otherUsername}</td>
                    <td>
                      <Link to={`/message/${c.id}`} className="link">
                        {c.lastMessage?.substring(0, 80) || "No messages yet..."}
                      </Link>
                    </td>
                    <td>
                      {c.updatedAt?.seconds
                        ? moment(c.updatedAt.toDate()).fromNow()
                        : "Unknown"}
                    </td>
                    <td>
                      {isUnread ? (
                        <button className="mark-read" onClick={() => handleRead(c.id)}>
                          Mark as Read
                        </button>
                      ) : (
                        <span className="read-label">Read</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Messages;
