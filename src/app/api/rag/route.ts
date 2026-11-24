import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  retrieveRelevantChunks,
  callGeminiModel,
  PRIMARY_CHAT_MODEL,
  EMBEDDING_MODEL,
} from "@/services/googleRagEngine";
import { RAG_KNOWLEDGE_CHUNKS } from "@/services/ragKnowledge";

export async function GET() {
  try {
    const ragDir = path.resolve(process.cwd(), "rag_data");
    const files = ["faq.md", "price_list.md", "schedule.md"].map((name) => {
      const fullPath = path.join(ragDir, name);
      const exists = fs.existsSync(fullPath);
      const content = exists ? fs.readFileSync(fullPath, "utf-8") : "";
      const stat = exists ? fs.statSync(fullPath) : null;
      return {
        name,
        size: stat?.size || 0,
        modifiedAt: stat?.mtime.toISOString() || null,
        preview: content.slice(0, 500),
        fullText: content,
      };
    });

    return NextResponse.json({
      status: "ok",
      model: PRIMARY_CHAT_MODEL,
      embeddingModel: EMBEDDING_MODEL,
      totalChunks: RAG_KNOWLEDGE_CHUNKS.length,
      chunks: RAG_KNOWLEDGE_CHUNKS,
      files,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to inspect RAG data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body?.query || "").trim();
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const retrievedChunks = await retrieveRelevantChunks(query, undefined, 4);
    const contextText = retrievedChunks
      .map(
        (c, i) =>
          `[Источник ${i + 1}: ${c.title} (Категория: ${c.category}, Релевантность: ${c.similarityPercent}%)]\n${c.text}`
      )
      .join("\n\n---\n\n");

    const systemInstruction = `Ты — интеллектуальный AI-репетитор по русскому языку и консультант образовательной платформы с подключённой базой знаний RAG из архива.
Отвечай структурированно, грамотно и вежливо.
Если вопрос касается данных из базы знаний RAG (расписание преподавателей, курсы, цены в UZS, условия рассрочки, FAQ, адрес кампуса, контакты) — отвечай СТРОГО по фактам из RAG-контекста ниже.
Если вопрос касается русского языка (грамматика, орфография, пунктуация, лексика, произношение, этапы изучения A1–C2) — давай подробный педагогический разбор с примерами и правилами, при желании связывая примеры с темами из RAG-контекста.

--- АКТУАЛЬНЫЙ RAG-КОНТЕКСТ ИЗ АРХИВА (GOOGLE AI STUDIO VECTOR EMBEDDINGS) ---
${contextText}
------------------------------------------------------------------------------`;

    try {
      const { text, modelUsed } = await callGeminiModel({
        prompt: query,
        systemInstruction,
        history,
        temperature: 0.25,
      });

      return NextResponse.json({
        answer: text,
        retrievedChunks,
        model: modelUsed,
        embeddingModel: EMBEDDING_MODEL,
      });
    } catch {
      const fallback =
        `На основе векторной базы знаний RAG (модель ${PRIMARY_CHAT_MODEL}) найдены следующие релевантные фрагменты:\n\n` +
        retrievedChunks.map((c) => `### ${c.title} (${c.similarityPercent}%)\n${c.text}`).join("\n\n");

      return NextResponse.json({
        answer: fallback,
        retrievedChunks,
        model: `${PRIMARY_CHAT_MODEL} (RAG Local Fallback)`,
        embeddingModel: EMBEDDING_MODEL,
      });
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "RAG request failed" },
      { status: 500 }
    );
  }
}
