const axios = require("axios");

async function getEmbedding(text) {
    const response = await axios.post(
        "https://openrouter.ai/api/v1/embeddings",
        {
            model: process.env.EMBED_MODEL,
            input: text
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data.data[0].embedding;
}

module.exports = { getEmbedding };