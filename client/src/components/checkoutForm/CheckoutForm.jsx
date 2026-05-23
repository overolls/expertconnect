import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "./CheckoutForm.scss";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { addDoc, collection } from "firebase/firestore";
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const gigId = localStorage.getItem("lastGigId");
  const price = localStorage.getItem("lastGigPrice");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!stripe || !elements) return;

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + "/success", // Optional redirect
    },
    redirect: "if_required", // Avoid automatic redirection
  });

  if (error) {
    setMessage(error.message);
    setLoading(false);
    return;
  }

  if (paymentIntent && paymentIntent.status === "succeeded") {
    try {
      const gigId = localStorage.getItem("lastGigId");
      const gigPrice = Number(localStorage.getItem("lastGigPrice"));

      // Get gig info for saving to Firestore
      const gigRef = doc(db, "gigs", gigId);
      const gigSnap = await getDoc(gigRef);
      if (!gigSnap.exists()) throw new Error("Gig not found");

      const gig = gigSnap.data();
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      await addDoc(collection(db, "orders"), {
        buyerId: currentUser.uid,
        sellerId: gig.userId,
        gigId: gigId,
        title: gig.title,
        img: gig.cover,
        price: gigPrice,
        isCompletedBySeller: false,
        isConfirmedByBuyer: false,
        createdAt: new Date(),
      });

      // Redirect
      window.location.href = "/orders";
    } catch (err) {
      console.error(":x: Failed to save order:", err);
      setMessage("Order saved failed. Please contact support.");
    }
  }

  setLoading(false);
};

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={loading || !stripe || !elements}>
        {loading ? "Processing..." : "Pay"}
      </button>
      {message && <div className="message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
