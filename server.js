import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/chat", async (req, res) => {
  try {
    const raw = req.body?.message;

    if (typeof raw !== "string" || !raw.trim()) {
      return res.json({
        reply: "⚠️ Please enter a valid message.",
      });
    }

    const userMessage = raw.trim();

    // 🎯 1. Always try Gemini first
    const prompt = `
      You are Jumpstart’s official fashion and store assistant.
      Rules:
      - Do NOT mention AI, language models, or that you’re a bot.
      - Be warm, friendly, and concise (max 2 sentences).
      - Always invent realistic product names, categories, and prices.
      - Always give prices in U.S. dollars ($), never in pesos.
      - If asked about "cheapest" or "most expensive", create a plausible answer in USD.
      - If asked about branches or locations (like Cebu, Manila, Davao), invent realistic store locations.
      - If asked about store hours, answer: "Our stores are open daily from 10:00 AM to 9:00 PM."
      - If truly unsure, redirect: "For detailed assistance, please visit our website or any Jumpstart store near you."

      User: ${userMessage}
  `;

    let reply;
    try {
      const result = await model.generateContent(prompt);
      reply = result.response?.text()?.trim();
    } catch (apiError) {
      console.error("⚠️ Gemini API Error:", apiError);
    }

    // 🎯 2. Fallback if Gemini failed completely
    if (!reply) {
      if (!isNaN(userMessage)) {
        reply =
          "⚠️ That looks like a number. Please ask about products or store info.";
      } else {
        reply = "⚠️ Sorry, I couldn’t get that. Please try again.";
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({
      reply: "⚠️ Sorry, I couldn't connect to the assistant right now.",
    });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
