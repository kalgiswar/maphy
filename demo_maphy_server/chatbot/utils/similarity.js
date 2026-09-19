function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = { cosineSimilarity };

const fs = require("fs");
const path = require("path");

function findTopMatches(questionEmbedding, topN = 3) {
    const embeddingsPath = path.join(__dirname, "../data/embeddings.json");
    const knowledgeBase = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));

    const scored = knowledgeBase.map(chunk => ({
        heading: chunk.heading,
        content: chunk.content,
        score: cosineSimilarity(questionEmbedding, chunk.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topN);
}

module.exports = { cosineSimilarity, findTopMatches };