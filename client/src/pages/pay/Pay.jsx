import React, { useEffect, useState } from "react";
import "./Pay.scss";
import { useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

// Load Stripe public key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_BASE = import.meta.env.VITE_API_BASE;

const Pay = () => {
  const { id } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [gig, setGig] = useState(null);

  useEffect(() => {
    const fetchGigAndCreatePaymentIntent = async () => {
      try {
        const gigRef = doc(db, "gigs", id);
        const gigSnap = await getDoc(gigRef);

        if (gigSnap.exists()) {
          const gigData = gigSnap.data();
          setGig(gigData);

          // Save gig info for Success page
          localStorage.setItem("lastGigId", id);
          localStorage.setItem("lastGigPrice", gigData.price);

          // Create Stripe payment intent
          const res = await axios.post(`${API_BASE}/api/stripe/create-payment-intent`, {
            amount: gigData.price * 100, // Stripe uses cents
          });
          

          setClientSecret(res.data.clientSecret);
        } else {
          console.error("❌ Gig not found.");
        }
      } catch (err) {
        console.error("❌ Error loading gig or creating payment intent:", err);
      }
    };

    fetchGigAndCreatePaymentIntent();
  }, [id]);

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="pay">
      <div className="container">
        <h1>Secure Payment</h1>
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        ) : (
          <p>Failed to load payment form.</p>
        )}
      </div>
    </div>
  );
};

export default Pay;
