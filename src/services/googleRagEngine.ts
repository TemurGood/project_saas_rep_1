import CopyRagKnowledge from "@/data/vectorKnowledgeBase.json";

export interface VectorChunk {
  id: string;
  category: "price" | "faq" | "schedule";
  title: string;
  text: string;
  vector?: number[];
  similarity?: number;
  similarityPercent?: number;
}

export const API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ||
  process.env.VITE_GEMINI_EMBEDDING_MODEL ||
  "gemini-embedding-001";

export const PRIMARY_CHAT_MODEL =
  process.env.GEMINI_MODEL ||
  process.env.VITE_GEMINI_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_MODEL ||
  "gemini-3.5-flash-lite";

export const FALLBACK_CHAT_MODELS = [
  process.env.GEMINI_FALLBACK_MODEL ||
    process.env.VITE_GEMINI_FALLBACK_MODEL ||
    "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];

const queryVectorCache = new Map<string, number[]>();

/**
 * 1. Vector Math: Cosine Similarity
 * Cos(θ) = (A · B) / (||A|| * ||B||)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 2. Generate Vector Embedding via Google AI Studio API (gemini-embedding-001)
 */
export async function getEmbedding(
  text: string,
  taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT" = "RETRIEVAL_QUERY"
): Promise<number[]> {
  const cacheKey = `${taskType}:${text}`;
  if (queryVectorCache.has(cacheKey)) {
    return queryVectorCache.get(cacheKey)!;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google AI Studio Embedding Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const vector = data?.embedding?.values;
  if (!vector || !Array.isArray(vector)) {
    throw new Error("Invalid embedding vector structure received from Google AI Studio.");
  }

  queryVectorCache.set(cacheKey, vector);
  return vector;
}

/**
 * Keyword fallback scoring when embedding call is skipped or offline
 */
function keywordRetrieveChunks(
  userQuery: string,
  activeBase: VectorChunk[],
  topK: number
): VectorChunk[] {
  const lower = userQuery.toLowerCase();
  const tokens = lower.split(/[\s,?.!;:—]+/).filter((t) => t.length > 2);

  const scored = activeBase.map((chunk) => {
    let score = 0.45;
    const hay = `${chunk.title} ${chunk.text}`.toLowerCase();
    for (const token of tokens) {
      if (chunk.title.toLowerCase().includes(token)) score += 0.18;
      if (hay.includes(token)) score += 0.1;
    }
    const clamped = Math.min(0.98, score);
    return {
      ...chunk,
      similarity: clamped,
      similarityPercent: Math.round(clamped * 100),
    };
  });

  scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  return scored.slice(0, topK);
}

/**
 * 3. Retrieve Top-K Most Relevant Chunks by Cosine Similarity over the archive's vectorKnowledgeBase.json
 */
export async function retrieveRelevantChunks(
  userQuery: string,
  knowledgeBase?: VectorChunk[],
  defaultTopK: number = 4
): Promise<VectorChunk[]> {
  const activeBase = (knowledgeBase || (CopyRagKnowledge as VectorChunk[])) as VectorChunk[];

  const lowerQuery = userQuery.toLowerCase();
  const isBroadTeachers =
    /преподават|учител|ментор|кто вед|кто учит|расписан|график|faculty|teacher/.test(lowerQuery);
  const isBroadCourses =
    /все курс|список курс|какие курс|направлени|прайс|цен|стоимост|courses/.test(lowerQuery);

  const topK = isBroadTeachers ? 8 : isBroadCourses ? 8 : defaultTopK;

  try {
    const queryVector = await getEmbedding(userQuery, "RETRIEVAL_QUERY");

    const scored = activeBase
      .filter((c) => c.vector && Array.isArray(c.vector))
      .map((chunk) => {
        let similarity = cosineSimilarity(queryVector, chunk.vector!);

        if (isBroadTeachers && chunk.category === "schedule") {
          similarity = Math.min(1.0, similarity + 0.15);
        }
        if (isBroadCourses && chunk.category === "price") {
          similarity = Math.min(1.0, similarity + 0.15);
        }

        return {
          id: chunk.id,
          category: chunk.category,
          title: chunk.title,
          text: chunk.text,
          similarity,
          similarityPercent: Math.round(similarity * 100),
        };
      });

    scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    return scored.slice(0, topK);
  } catch (err) {
    console.warn("[RAG Engine] Falling back to lexical similarity over archive chunks:", err);
    return keywordRetrieveChunks(
      userQuery,
      activeBase.map(({ vector, ...rest }) => rest),
      topK
    );
  }
}

/**
 * 4. Call Gemini 3.5 Flash-Lite with auto-retry and fallback
 */
export async function callGeminiModel({
  prompt,
  systemInstruction,
  history = [],
  temperature = 0.25,
  responseMimeType,
}: {
  prompt: string;
  systemInstruction?: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  temperature?: number;
  responseMimeType?: string;
}): Promise<{ text: string; modelUsed: string }> {
  const models = [PRIMARY_CHAT_MODEL, ...FALLBACK_CHAT_MODELS];
  let lastError: Error | null = null;

  const contents = [
    ...history.slice(-14).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const bodyPayload: Record<string, unknown> = {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: 4096,
            ...(responseMimeType ? { responseMimeType } : {}),
          },
        };

        if (systemInstruction) {
          bodyPayload.system_instruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        const res = await fetch(genUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok) {
          const data = await res.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const text = parts
            .filter((p: { thought?: boolean; text?: string }) => !p.thought && typeof p.text === "string")
            .map((p: { text: string }) => p.text)
            .join("");

          if (text) {
            return { text, modelUsed: model };
          }
        }

        const status = res.status;
        const errText = await res.text();
        if (status === 503 || status === 429) {
          await new Promise((r) => setTimeout(r, 400 * attempt));
          continue;
        }
        lastError = new Error(`Gemini API (${model}) status ${status}: ${errText}`);
        break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastError || new Error("Gemini API temporarily unavailable");
}
