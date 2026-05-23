import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");

  const [status, setStatus] = useState("Processing your payment...");

  useEffect(() => {
    if (!payment_intent) {
      setStatus("No payment information found.");
      return;
    }

    const saveOrder = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const gigId = localStorage.getItem("lastGigId"); // Optional: store gig ID before payment
        const price = localStorage.getItem("lastGigPrice");

        await setDoc(doc(db, "orders", payment_intent), {
          userId: currentUser.uid,
          gigId: gigId || "unknown",
          price: Number(price) || 0,
          createdAt: serverTimestamp(),
          paymentIntent: payment_intent,
        });

        setStatus("✅ Payment successful! Redirecting to orders page...");
        setTimeout(() => {
          navigate("/orders");
        }, 5000);
      } catch (err) {
        console.error("Failed to create order:", err);
        setStatus("❌ Something went wrong. Please contact support.");
      }
    };

    saveOrder();
  }, [payment_intent, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontSize: "18px" }}>
      {status}
    </div>
  );
};

export default Success;
