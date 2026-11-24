"use client";

import React, { useState, useEffect } from "react";
import { Database, Search, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface RagChunkItem {
  id: string;
  category: string;
  title: string;
  content?: string;
  text?: string;
  similarityPercent?: number;
}

interface RagFileItem {
  name: string;
  size: number;
  modifiedAt: string;
  preview: string;
  fullText: string;
}

export function RagArchiveExplorer() {
  const [files, setFiles] = useState<RagFileItem[]>([]);
  const [chunks, setChunks] = useState<RagChunkItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("faq.md");
  const [searchQuery, setSearchQuery] = useState(
    "Какие курсы, цены, условия рассрочки и расписание преподавателей есть в базе знаний?"
  );
  const [ragAnswer, setRagAnswer] = useState("");
  const [retrievedChunks, setRetrievedChunks] = useState<RagChunkItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch("/api/rag")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.files)) setFiles(data.files);
        if (Array.isArray(data?.chunks)) setChunks(data.chunks);
      })
      .catch(() => {});
  }, []);

  const handleVectorSearch = async (customQuery?: string) => {
    const q = (customQuery ?? searchQuery).trim();
    if (!q || isSearching) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setRagAnswer(data.answer || "");
      setRetrievedChunks(data.retrievedChunks || []);
    } finally {
      setIsSearching(false);
    }
  };

  const activeFileObj = files.find((f) => f.name === selectedFile) || files[0];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-[#4E5E07]/40 bg-[#2E3604] text-[#D8D2CF]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="amber">RAG Архив • Строго без изменений текста</Badge>
              <Badge variant="default" className="bg-[#4E5E07] text-[#D8D2CF]">
                gemini-embedding-001 (3072 dim) + gemini-3.5-flash-lite
              </Badge>
            </div>
            <span className="text-xs text-[#E19D29]">
              Векторных чанков в индексе: {chunks.length || 27}
            </span>
          </div>
          <CardTitle className="font-heading text-4xl text-[#E19D29] pt-2">
            Векторная база знаний RAG из архива
          </CardTitle>
          <CardDescription className="text-[#D8D2CF]/80">
            Все оригинальные документы из архива (<code>rag_data/faq.md</code>,{" "}
            <code>rag_data/price_list.md</code>, <code>rag_data/schedule.md</code>,{" "}
            <code>export/*.docx, *.xlsx</code> и предвычисленные эмбеддинги{" "}
            <code>vectorKnowledgeBase.json</code>) подключены к AI-агенту.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVectorSearch();
              }}
              placeholder="Задайте вопрос по RAG-документам архива или правилам..."
              className="flex-1 bg-white text-[#2E3604]"
            />
            <Button
              variant="amber"
              disabled={isSearching}
              onClick={() => handleVectorSearch()}
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? "Векторный поиск..." : "Выполнить RAG-запрос"}</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Перечисли всех преподавателей и их расписание лекций",
              "Сколько стоит курс Frontend и Data Science и есть ли рассрочка?",
              "Как записаться на бесплатный пробный урок и какие правила заморозки?",
            ].map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(sample);
                  handleVectorSearch(sample);
                }}
                className="text-xs rounded-xl bg-[#4E5E07]/40 hover:bg-[#4E5E07]/70 text-[#D8D2CF] px-3 py-1.5 border border-[#8D8179]/30 transition-all cursor-pointer"
              >
                🔍 {sample}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Result & Retrieved Vector Chunks */}
      {(ragAnswer || retrievedChunks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-2 border-[#4E5E07] bg-white/90">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4E5E07] uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Ответ агента gemini-3.5-flash-lite по RAG-контексту</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#2E3604]">
                {ragAnswer}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#8D8179]/40 bg-[#D8D2CF]/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-[#4E5E07]" />
                <span>Топ найденных векторных чанков</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {retrievedChunks.map((c, i) => (
                <div
                  key={c.id || i}
                  className="rounded-xl bg-white/90 p-3 border border-[#8D8179]/30 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#2E3604]">{c.title}</span>
                    <Badge variant="amber">{c.similarityPercent || 90}%</Badge>
                  </div>
                  <p className="text-[#8D8179] line-clamp-3">{c.text || c.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Raw Archive Documents Viewer */}
      <Card className="border border-[#8D8179]/40 bg-white/85">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4E5E07]" />
                <span>Оригинальные документы из архива (rag_data/*.md)</span>
              </CardTitle>
              <CardDescription>
                Тексты сохранены байт-в-байт из загруженного архива <code>rag_data_saas_rep.zip</code>.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {files.map((f) => (
                <Button
                  key={f.name}
                  size="sm"
                  variant={selectedFile === f.name ? "default" : "outline"}
                  onClick={() => setSelectedFile(f.name)}
                >
                  {f.name} ({Math.round(f.size / 1024)} KB)
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeFileObj ? (
            <pre className="rounded-xl bg-[#2E3604] text-[#D8D2CF] p-4 text-xs overflow-x-auto max-h-[340px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {activeFileObj.fullText}
            </pre>
          ) : (
            <div className="text-xs text-[#8D8179] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4E5E07]" />
              <span>Файлы базы знаний загружены и индексированы.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
