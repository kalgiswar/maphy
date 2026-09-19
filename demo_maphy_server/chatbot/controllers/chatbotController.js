const { getEmbedding } = require("../utils/embedding");
const { findTopMatches } = require("../utils/similarity");
const axios = require("axios");

exports.getReply = async (req, res) => {
    try {
        const userMessage = req.body.message?.trim();
        if (!userMessage) {
            return res.json({ reply: "Please type a question." });
        }

        // Step 1: convert the user's question into numbers
        const questionEmbedding = await getEmbedding(userMessage);

        // Step 2: find the most relevant knowledge base chunks
        const topMatches = findTopMatches(questionEmbedding, 3);

        // Step 3: build context text from those matches
        const context = topMatches.map(m => m.content).join("\n\n---\n\n");

        // Step 4: ask the LLM to answer using that context
        const llmResponse = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: process.env.CHAT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant for the Maphy IT asset management platform. Answer the user's question using ONLY the information in the context below. If the answer isn't in the context, say you don't have that information.\n\nContext:\n${context}`
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = llmResponse.data.choices[0].message.content;
        res.json({ reply });

    } catch (err) {
        console.error("Chatbot error:", err.message);
        res.status(500).json({ reply: "Something went wrong. Please try again." });
    }
};
exports.getReply = async (req, res) => {
    try {
        const userMessage = req.body.message?.trim();
        if (!userMessage) {
            return res.json({ reply: "Please type a question." });
        }

        console.log("1. User asked:", userMessage);

        const questionEmbedding = await getEmbedding(userMessage);
        console.log("2. Question embedded, vector length:", questionEmbedding.length);

        const topMatches = findTopMatches(questionEmbedding, 3);
        console.log("3. Top matches found:");
        topMatches.forEach(m => console.log(`   - ${m.heading} (score: ${m.score.toFixed(4)})`));

        const context = topMatches.map(m => m.content).join("\n\n---\n\n");

        const llmResponse = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: process.env.CHAT_MODEL,
                messages: [
                    { role: "system", content: `You are a helpful assistant for the Maphy IT asset management platform. Answer the user's question using ONLY the information in the context below. If the answer isn't in the context, say you don't have that information.\n\nContext:\n${context}` },
                    { role: "user", content: userMessage }
                ]
            },
            { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
        );

        console.log("4. LLM model that actually responded:", llmResponse.data.model);

        const reply = llmResponse.data.choices[0].message.content;
        console.log("5. Final reply generated.");

        res.json({ reply });

    } catch (err) {
        console.error("Chatbot error:", err.message);
        res.status(500).json({ reply: "Something went wrong. Please try again." });
    }
};