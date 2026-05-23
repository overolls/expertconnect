import React, { useState } from "react";
import "./Orders.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../../utils/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();
  const [showCompleted, setShowCompleted] = useState(false);
  const queryClient = useQueryClient();

  const { isLoading, error, data: orders } = useQuery({
    queryKey: ["orders", currentUser.uid],
    queryFn: async () => {
      const q = query(
        collection(db, "orders"),
        where(currentUser.isSeller ? "sellerId" : "buyerId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!currentUser?.uid,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, field }) => {
      await updateDoc(doc(db, "orders", id), {
        [field]: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders", currentUser.uid]);
    },
  });

  const handleConfirm = (id, field) => {
    mutation.mutate({ id, field });
  };

 const handleContact = async (order) => {
  const sellerId = order.sellerId;
  const buyerId = order.buyerId;

  // Always use sorted IDs to prevent mismatch
  const conversationId = sellerId > buyerId
    ? `${sellerId}_${buyerId}`
    : `${buyerId}_${sellerId}`;

  try {
    const convoRef = doc(db, "conversations", conversationId);
    const convoSnap = await getDoc(convoRef);

    if (!convoSnap.exists()) {
      await setDoc(convoRef, {
        id: conversationId,
        sellerId,
        buyerId,
        readBySeller: false,
        readByBuyer: false,
        lastMessage: "",
        updatedAt: new Date(),
      });
    }

    navigate(`/message/${conversationId}`);
  } catch (err) {
    console.error(":x: Failed to contact seller:", err);
  }
};

  const filteredOrders = orders?.filter((order) =>
    showCompleted
      ? order.isCompletedBySeller && order.isConfirmedByBuyer
      : true
  );

  return (
    <div className="orders">
      <div className="container">
        <div className="title">
          <h1>{showCompleted ? "Completed Orders" : "Orders"}</h1>
          <button onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? "View All" : "View Completed"}
          </button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error loading orders.</p>
        ) : filteredOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <img className="image" src={order.img} alt="gig" />
                  </td>
                  <td>{order.title}</td>
                  <td>${order.price}</td>
                  <td>
                    {currentUser.isSeller && !order.isCompletedBySeller && (
                      <button
                        onClick={() =>
                          handleConfirm(order.id, "isCompletedBySeller")
                        }
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {!currentUser.isSeller &&
                      order.isCompletedBySeller &&
                      !order.isConfirmedByBuyer && (
                        <button
                          onClick={() =>
                            handleConfirm(order.id, "isConfirmedByBuyer")
                          }
                        >
                          Confirm Receipt
                        </button>
                      )}

                    {order.isCompletedBySeller && order.isConfirmedByBuyer && (
                      <span className="status done">✓ Completed</span>
                    )}
                  </td>
                  <td>
                    <img
                      className="message"
                      src="/img/message.png"
                      alt="Message"
                      onClick={() => handleContact(order)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
