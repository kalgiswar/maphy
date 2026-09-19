const fs = require("fs");
const path = require("path");

// Step 1: Read the markdown file as plain text
const kbPath = path.join(__dirname, "../knowledge-base/maphy_knowledge_base.md");
const rawText = fs.readFileSync(kbPath, "utf-8");

// Step 2: Split into chunks using "## " as the separator (each section = one chunk)
function chunkMarkdown(text) {
    const sections = text.split(/\n## /); // splits every time it sees a new "## Heading"
    const chunks = [];

    sections.forEach((section, i) => {
        if (i === 0) return; // skip the very first bit (title + intro before first ##)
        const heading = section.split("\n")[0].trim(); // first line = the heading text
        const content = "## " + section.trim(); // re-add the "## " we stripped during split
        chunks.push({ heading, content });
    });

    return chunks;
}

const chunks = chunkMarkdown(rawText);

console.log(`Found ${chunks.length} chunks:`);
chunks.forEach((c, i) => console.log(`${i + 1}. ${c.heading}`));

const axios = require("axios");
require("dotenv").config();
const { getEmbedding } = require("../utils/embedding");

async function buildAllEmbeddings() {
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Embedding ${i + 1}/${chunks.length}: ${chunk.heading}`);

        const vector = await getEmbedding(chunk.content);

        results.push({
            heading: chunk.heading,
            content: chunk.content,
            embedding: vector
        });
    }

    const outputPath = path.join(__dirname, "../data/embeddings.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\nDone! Saved ${results.length} embeddings to ${outputPath}`);
}

buildAllEmbeddings();