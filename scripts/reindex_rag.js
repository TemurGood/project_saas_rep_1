import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { parseMarkdownFiles } from './markdownParser.js';

// Read environment variables from .env
const envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
const parseEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : process.env[key] || '';
};

const API_KEY = parseEnv('VITE_GEMINI_API_KEY') || parseEnv('GEMINI_API_KEY');
const EMBEDDING_MODEL = parseEnv('VITE_GEMINI_EMBEDDING_MODEL') || 'gemini-embedding-001';

async function getEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.embedding?.values;
}

export async function reindex() {
  const chunks = parseMarkdownFiles();
  const vectorStorePath = path.resolve('src/data/vectorKnowledgeBase.json');

  let existingVectors = [];
  if (fs.existsSync(vectorStorePath)) {
    try {
      existingVectors = JSON.parse(fs.readFileSync(vectorStorePath, 'utf-8'));
    } catch (e) {}
  }

  // Key by exact text so any modification to a chunk's content triggers re-embedding
  const vectorByTextMap = new Map();
  for (const v of existingVectors) {
    if (v.text && v.vector) vectorByTextMap.set(v.text, v.vector);
  }

  console.log(`[RAG Indexer] Processing ${chunks.length} chunks from rag_data markdown documents...`);
  const finalChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let vector = vectorByTextMap.get(chunk.text);

    if (vector) {
      finalChunks.push({ ...chunk, vector });
    } else {
      console.log(`[RAG Indexer] Vectorizing new/updated chunk: "${chunk.title}"...`);
      try {
        vector = await getEmbedding(chunk.text);
        finalChunks.push({ ...chunk, vector });
        await new Promise((r) => setTimeout(r, 150));
      } catch (err) {
        console.error(`Failed to vectorize ${chunk.id}:`, err);
      }
    }
  }

  fs.writeFileSync(vectorStorePath, JSON.stringify(finalChunks, null, 2), 'utf-8');
  console.log(`[RAG Indexer] Done! Saved ${finalChunks.length} vector chunks to ${vectorStorePath}`);
  return finalChunks;
}

// Run when executed directly from CLI
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  reindex();
}
