import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import Stripe from "stripe";
import fetch from "node-fetch";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Multer for memory storage (IMGbb)
const upload = multer();

// ✅ IMGbb Upload Route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const form = new FormData();
    const base64Image = req.file.buffer.toString("base64");
    form.append("image", base64Image);

    const imgbbRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const imageUrl = imgbbRes.data.data.url;
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error("IMGbb upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ Stripe Payment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/api/stripe/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI Chatbot with OpenRouter
app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error("OpenRouter error:", data);
      res.status(500).json({ reply: "Error processing your request." });
    }
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
