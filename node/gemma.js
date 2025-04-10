require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


const GROQ_API_KEY = "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"; // Store API Key in .env
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.post("/chat", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // First, get the evaluation from the model
        const response = await axios.post(
            API_URL,
            {
                model: "llama3-70b-8192", // Using a different model that may follow instructions better
                messages: [
                    {
                        role: "system",
                        content: "You are evaluating interview feedback. Respond with ONLY the word 'Yes' or 'No' without any additional text, quotes, or explanation."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 10, // We only need a short response
                temperature: 0.1, // Very low temperature for consistent output
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content.trim();

        // Extract just "Yes" or "No" from the response
        let result = "Unknown";
        if (aiResponse.toLowerCase().includes("yes")) {
            result = "Yes";
        } else if (aiResponse.toLowerCase().includes("no")) {
            result = "No";
        }

        // Create our own JSON response
        const jsonResponse = { response: result, raw: aiResponse };
        res.json(jsonResponse);

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});