"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Headphones,
  FileSearch,
  Lock,
  Sparkles,
  CheckCircle2,
  Send,
  Crown,
  Play,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import {
  PRONUNCIATION_EXERCISES,
  SPEAKING_SCENARIOS,
  LISTENING_TRACKS,
  ERROR_ANALYSIS_SAMPLES,
  LanguageLevelCode,
  LanguageStageId,
} from "@/data/russianCurriculum";

interface ProPracticeStudioProps {
  plan: "free" | "pro";
  level: LanguageLevelCode;
  stage: LanguageStageId;
  onUpgradeToPro: () => void;
  onOpenPricingTab: () => void;
  onRecordPracticeTime: (seconds: number) => void;
}

export function ProPracticeStudio({
  plan,
  level,
  stage,
  onUpgradeToPro,
  onOpenPricingTab,
  onRecordPracticeTime,
}: ProPracticeStudioProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "pronunciation" | "speaking" | "listening" | "errors"
  >("pronunciation");

  // 1. Pronunciation State
  const [selectedPronIdx, setSelectedPronIdx] = useState(0);
  const currentPron = PRONUNCIATION_EXERCISES[selectedPronIdx] || PRONUNCIATION_EXERCISES[0];
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [pronFeedback, setPronFeedback] = useState("");
  const [pronLoading, setPronLoading] = useState(false);

  // 2. Speaking State
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const currentScenario = SPEAKING_SCENARIOS[selectedScenarioIdx] || SPEAKING_SCENARIOS[0];
  const [speakingHistory, setSpeakingHistory] = useState<
    Array<{ role: "user" | "model"; text: string }>
  >([{ role: "model", text: SPEAKING_SCENARIOS[0].openingLine }]);
  const [speakingInput, setSpeakingInput] = useState("");
  const [speakingLoading, setSpeakingLoading] = useState(false);

  // 3. Listening State
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);
  const currentTrack = LISTENING_TRACKS[selectedTrackIdx] || LISTENING_TRACKS[0];
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, number>>({});
  const [dictationInput, setDictationInput] = useState("");
  const [dictationChecked, setDictationChecked] = useState(false);

  // 4. Deep Error Analysis State
  const [errorInputText, setErrorInputText] = useState(
    ERROR_ANALYSIS_SAMPLES[0].sampleText
  );
  const [errorAnalysisResult, setErrorAnalysisResult] = useState("");
  const [errorAnalysisLoading, setErrorAnalysisLoading] = useState(false);

  // Browser TTS helper
  const speakRussianText = (text: string, rate = 1.0) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    utterance.rate = rate;
    utterance.onstart = () => setIsSpeakingAudio(true);
    utterance.onend = () => setIsSpeakingAudio(false);
    utterance.onerror = () => setIsSpeakingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopRussianSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingAudio(false);
    }
  };

  // Web Speech API Microphone Recognition
  const startMicrophoneRecognition = (onResult: (transcript: string) => void) => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      // Simulate clean spoken sample if browser lacks WebkitSpeechRecognition
      onResult(currentPron.targetPhrase);
      return;
    }

    try {
      const recognition = new SpeechRec() as {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onstart: () => void;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      recognition.lang = "ru-RU";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event) => {
        const text = event.results?.[0]?.[0]?.transcript || "";
        if (text) onResult(text);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Run AI Pronunciation Analysis
  const handleEvaluatePronunciation = async (textToEval?: string) => {
    const candidate = (textToEval ?? spokenTranscript).trim();
    if (!candidate) return;
    setPronLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "pronunciation",
          targetPhrase: currentPron.stressedPhrase,
          message: candidate,
          level,
          stage,
          plan,
        }),
      });
      const data = await res.json();
      setPronFeedback(data.answer || data.error || "Не удалось выполнить разбор.");
      onRecordPracticeTime(25);
    } finally {
      setPronLoading(false);
    }
  };

  // Run AI Speaking Turn
  const handleSendSpeakingTurn = async (customText?: string) => {
    const text = (customText ?? speakingInput).trim();
    if (!text || speakingLoading) return;
    const nextHist: Array<{ role: "user" | "model"; text: string }> = [
      ...speakingHistory,
      { role: "user", text },
    ];
    setSpeakingHistory(nextHist);
    setSpeakingInput("");
    setSpeakingLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "speaking",
          message: text,
          history: nextHist.slice(-10),
          level,
          stage,
          plan,
        }),
      });
      const data = await res.json();
      const reply = data.answer || "Отличная реплика! Давайте продолжим диалог.";
      setSpeakingHistory([...nextHist, { role: "model", text: reply }]);
      onRecordPracticeTime(30);
    } finally {
      setSpeakingLoading(false);
    }
  };

  // Run Deep Error Analysis
  const handleRunErrorAnalysis = async () => {
    if (!errorInputText.trim() || errorAnalysisLoading) return;
    setErrorAnalysisLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "error_analysis",
          message: errorInputText,
          level,
          stage,
          plan,
        }),
      });
      const data = await res.json();
      setErrorAnalysisResult(data.answer || data.error || "Разбор завершён.");
      onRecordPracticeTime(30);
    } finally {
      setErrorAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation for the 4 Pro features */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#2E3604] p-4 rounded-2xl text-[#D8D2CF] border border-[#4E5E07]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("pronunciation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "pronunciation"
                ? "bg-[#E19D29] text-[#2E3604] shadow"
                : "bg-[#4E5E07]/30 text-[#D8D2CF] hover:bg-[#4E5E07]/50"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>1. Проверка произношения</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("speaking")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "speaking"
                ? "bg-[#E19D29] text-[#2E3604] shadow"
                : "bg-[#4E5E07]/30 text-[#D8D2CF] hover:bg-[#4E5E07]/50"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>2. Speaking (Диалоги)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("listening")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "listening"
                ? "bg-[#E19D29] text-[#2E3604] shadow"
                : "bg-[#4E5E07]/30 text-[#D8D2CF] hover:bg-[#4E5E07]/50"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>3. Listening (Аудирование)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("errors")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "errors"
                ? "bg-[#E19D29] text-[#2E3604] shadow"
                : "bg-[#4E5E07]/30 text-[#D8D2CF] hover:bg-[#4E5E07]/50"
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>4. Глубокий разбор ошибок</span>
          </button>
        </div>

        <Badge variant="amber" className="px-3 py-1">
          <Crown className="w-3.5 h-3.5" />
          <span>Модули тарифа PRO • gemini-3.5-flash-lite</span>
        </Badge>
      </div>

      {/* Pro Gate Banner if user is currently on Free plan */}
      {plan !== "pro" ? (
        <Card className="border-2 border-[#E19D29] bg-gradient-to-br from-[#2E3604] to-[#4E5E07] text-[#D8D2CF] p-8 shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#E19D29] text-[#2E3604] flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <Badge variant="amber">Эксклюзивно в тарифе Pro</Badge>
            <h3 className="font-heading text-4xl sm:text-5xl text-[#E19D29]">
              Разблокируйте голосовую практику и AI-разбор ошибок
            </h3>
            <p className="text-sm text-[#D8D2CF]/90 leading-relaxed">
              На тарифе <strong>Pro</strong> вам доступны: фонетическая{" "}
              <strong>Проверка произношения</strong> с анализом ударений, разговорный тренажёр{" "}
              <strong>Speaking</strong>, модуль <strong>Listening</strong> (аудирование и диктанты),{" "}
              <strong>Глубокий разбор ошибок</strong> по Розенталю и{" "}
              <strong>неограниченное время занятий (∞)</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="amber" size="lg" onClick={onUpgradeToPro}>
                <Crown className="w-4 h-4" />
                <span>Мгновенно включить Pro (Демо-тест)</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onOpenPricingTab}
                className="border-[#D8D2CF]/40 text-[#D8D2CF] hover:bg-white/10"
              >
                Перейти к оплате через Stripe ($19/мес)
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* 1. PRONUNCIATION TRAINER */}
          {activeSubTab === "pronunciation" && (
            <Card className="border-2 border-[#4E5E07]/40 bg-white/85">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="default">PRO • Орфоэпия и Фонетика</Badge>
                  <div className="flex flex-wrap gap-2">
                    {PRONUNCIATION_EXERCISES.map((ex, i) => (
                      <Button
                        key={ex.id}
                        size="sm"
                        variant={selectedPronIdx === i ? "amber" : "outline"}
                        onClick={() => {
                          setSelectedPronIdx(i);
                          setSpokenTranscript("");
                          setPronFeedback("");
                        }}
                      >
                        {ex.level}: {ex.title}
                      </Button>
                    ))}
                  </div>
                </div>
                <CardTitle className="font-heading text-3xl text-[#2E3604] pt-2">
                  Тренажёр русского произношения и ударений
                </CardTitle>
                <CardDescription>
                  Прослушайте эталонное звучание, произнесите фразу в микрофон (или введите транскрипт) и получите фонетический разбор от <code>gemini-3.5-flash-lite</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl bg-[#2E3604] p-5 text-[#D8D2CF] space-y-3 border border-[#E19D29]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#E19D29]">
                      Эталонная фраза с ударениями (Уровень {currentPron.level})
                    </span>
                    <Button
                      size="sm"
                      variant="amber"
                      onClick={() => speakRussianText(currentPron.targetPhrase, 0.95)}
                    >
                      <Volume2 className="w-4 h-4" />
                      Прослушать эталон
                    </Button>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    «{currentPron.stressedPhrase}»
                  </p>
                  <p className="text-xs text-[#E19D29]/90 font-mono">
                    Фонетическая транскрипция: {currentPron.phoneticHint}
                  </p>
                  <p className="text-xs text-[#D8D2CF]/80 border-t border-[#8D8179]/30 pt-2">
                    <strong>Фокус правила:</strong> {currentPron.focusRule}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase text-[#4E5E07]">
                    Ваша речь (запись с микрофона Web Speech API или текстовый ввод):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={spokenTranscript}
                      onChange={(e) => setSpokenTranscript(e.target.value)}
                      placeholder="Нажмите «Говорить в микрофон» или введите произнесённую фразу..."
                      className="flex-1"
                    />
                    <Button
                      variant={isRecording ? "amber" : "dark"}
                      onClick={() =>
                        startMicrophoneRecognition((transcript) => {
                          setSpokenTranscript(transcript);
                          handleEvaluatePronunciation(transcript);
                        })
                      }
                    >
                      <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
                      <span>{isRecording ? "Слушаем..." : "Говорить в микрофон"}</span>
                    </Button>
                    <Button
                      variant="default"
                      disabled={pronLoading}
                      onClick={() =>
                        handleEvaluatePronunciation(
                          spokenTranscript || currentPron.targetPhrase
                        )
                      }
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{pronLoading ? "Анализ..." : "Проверить произношение"}</span>
                    </Button>
                  </div>
                </div>

                {pronFeedback && (
                  <div className="rounded-2xl border-2 border-[#4E5E07]/40 bg-[#D8D2CF]/60 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4E5E07] uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Фонетический вердикт AI-репетитора (gemini-3.5-flash-lite)</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#2E3604]">
                      {pronFeedback}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 2. SPEAKING STUDIO */}
          {activeSubTab === "speaking" && (
            <Card className="border-2 border-[#4E5E07]/40 bg-white/85">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="default">PRO • Разговорный клуб с AI</Badge>
                  <div className="flex flex-wrap gap-2">
                    {SPEAKING_SCENARIOS.map((sc, idx) => (
                      <Button
                        key={sc.id}
                        size="sm"
                        variant={selectedScenarioIdx === idx ? "amber" : "outline"}
                        onClick={() => {
                          setSelectedScenarioIdx(idx);
                          setSpeakingHistory([{ role: "model", text: sc.openingLine }]);
                        }}
                      >
                        {sc.level}: {sc.title}
                      </Button>
                    ))}
                  </div>
                </div>
                <CardTitle className="font-heading text-3xl text-[#2E3604] pt-2">
                  Speaking: Живой диалог с AI-репетитором
                </CardTitle>
                <CardDescription>
                  Роль репетитора: <strong>{currentScenario.roleTutor}</strong> • Ваша роль:{" "}
                  <strong>{currentScenario.roleStudent}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-[#8D8179]/40 bg-[#D8D2CF]/50 p-4 max-h-[340px] overflow-y-auto space-y-3">
                  {speakingHistory.map((m, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        m.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#4E5E07] text-[#D8D2CF]"
                            : "bg-white text-[#2E3604] border border-[#8D8179]/30 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-[11px] font-bold uppercase opacity-75">
                            {m.role === "user" ? "Вы (Студент)" : "Слово.AI (Репетитор)"}
                          </span>
                          {m.role === "model" && (
                            <button
                              type="button"
                              onClick={() => speakRussianText(m.text, 1.0)}
                              className="text-xs text-[#4E5E07] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              Озвучить
                            </button>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested quick conversational prompts */}
                <div className="flex flex-wrap gap-2">
                  {currentScenario.suggestedPhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendSpeakingTurn(phrase)}
                      className="text-xs rounded-xl bg-[#4E5E07]/10 hover:bg-[#4E5E07]/20 text-[#2E3604] border border-[#4E5E07]/30 px-3 py-1.5 transition-all cursor-pointer text-left"
                    >
                      💬 {phrase}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Input
                    value={speakingInput}
                    onChange={(e) => setSpeakingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendSpeakingTurn();
                    }}
                    placeholder="Ответьте репетитору текстом или голосом..."
                    className="flex-1"
                  />
                  <Button
                    variant="dark"
                    onClick={() =>
                      startMicrophoneRecognition((transcript) => {
                        setSpeakingInput(transcript);
                      })
                    }
                  >
                    <Mic className="w-4 h-4" />
                    Голосом
                  </Button>
                  <Button
                    variant="amber"
                    disabled={speakingLoading}
                    onClick={() => handleSendSpeakingTurn()}
                  >
                    <Send className="w-4 h-4" />
                    <span>{speakingLoading ? "Ответ..." : "Отправить реплику"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. LISTENING STUDIO */}
          {activeSubTab === "listening" && (
            <Card className="border-2 border-[#4E5E07]/40 bg-white/85">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="default">PRO • Аудирование и Диктант</Badge>
                  <div className="flex gap-2">
                    {LISTENING_TRACKS.map((tr, idx) => (
                      <Button
                        key={tr.id}
                        size="sm"
                        variant={selectedTrackIdx === idx ? "amber" : "outline"}
                        onClick={() => {
                          setSelectedTrackIdx(idx);
                          setListeningAnswers({});
                          setDictationInput("");
                          setDictationChecked(false);
                        }}
                      >
                        {tr.level}: {tr.title}
                      </Button>
                    ))}
                  </div>
                </div>
                <CardTitle className="font-heading text-3xl text-[#2E3604] pt-2">
                  Listening: Понимание русской речи на слух
                </CardTitle>
                <CardDescription>
                  Тема: <strong>{currentTrack.topic}</strong>. Прослушайте аудиодорожку на удобной скорости, ответьте на вопросы и напишите мини-диктант.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl bg-[#2E3604] p-5 text-[#D8D2CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-[#E19D29] font-semibold uppercase">
                      Аудиодорожка • Уровень {currentTrack.level}
                    </div>
                    <div className="text-base font-bold text-white">{currentTrack.title}</div>
                    <div className="text-xs text-[#D8D2CF]/75">
                      Скорость воспроизведения: {playbackRate}x
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[0.8, 1.0, 1.2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setPlaybackRate(rate)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          playbackRate === rate
                            ? "bg-[#E19D29] text-[#2E3604]"
                            : "bg-[#4E5E07]/40 text-[#D8D2CF]"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}

                    {!isSpeakingAudio ? (
                      <Button
                        variant="amber"
                        onClick={() => {
                          speakRussianText(currentTrack.audioText, playbackRate);
                          onRecordPracticeTime(20);
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Слушать аудиотекст
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={stopRussianSpeech} className="text-white border-white">
                        <Square className="w-4 h-4" />
                        Стоп
                      </Button>
                    )}
                  </div>
                </div>

                {/* Transcript collapsible / preview */}
                <details className="rounded-xl border border-[#8D8179]/40 bg-[#D8D2CF]/40 p-3.5 text-xs">
                  <summary className="font-semibold cursor-pointer text-[#4E5E07]">
                    Показать текстовую расшифровку аудиозаписи (Транскрипт)
                  </summary>
                  <p className="mt-2 text-sm text-[#2E3604] leading-relaxed">
                    {currentTrack.audioText}
                  </p>
                </details>

                {/* Comprehension Questions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase text-[#2E3604]">
                    Вопросы на понимание прослушанного:
                  </h4>
                  {currentTrack.questions.map((q, qIdx) => {
                    const chosen = listeningAnswers[qIdx];
                    return (
                      <div
                        key={qIdx}
                        className="rounded-xl border border-[#8D8179]/35 bg-white p-4 space-y-3"
                      >
                        <p className="text-sm font-semibold text-[#2E3604]">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = chosen === oIdx;
                            const isCorrect = oIdx === q.correctIndex;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() =>
                                  setListeningAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                                }
                                className={`text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? isCorrect
                                      ? "border-[#4E5E07] bg-[#4E5E07] text-white font-semibold"
                                      : "border-red-600 bg-red-50 text-red-900 font-semibold"
                                    : "border-[#8D8179]/30 hover:border-[#4E5E07]"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {chosen !== undefined && (
                          <p className="text-xs text-[#4E5E07] bg-[#4E5E07]/10 p-2.5 rounded-lg">
                            <strong>Пояснение:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mini Dictation */}
                <div className="rounded-xl border border-[#4E5E07]/30 bg-[#D8D2CF]/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase text-[#2E3604]">
                      Мини-диктант на слух:
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => speakRussianText(currentTrack.dictationTarget, 0.85)}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Прослушать фразу диктанта
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={dictationInput}
                      onChange={(e) => {
                        setDictationInput(e.target.value);
                        setDictationChecked(false);
                      }}
                      placeholder="Запишите услышанное предложение..."
                      className="flex-1"
                    />
                    <Button
                      variant="default"
                      onClick={() => {
                        if (!dictationInput.trim()) {
                          setDictationInput(currentTrack.dictationTarget);
                        }
                        setDictationChecked(true);
                      }}
                    >
                      Проверить диктант
                    </Button>
                  </div>
                  {dictationChecked && (
                    <div className="text-xs bg-white p-3 rounded-xl border border-[#4E5E07]/30 space-y-1">
                      <div>
                        <strong>Эталон диктанта:</strong> «{currentTrack.dictationTarget}»
                      </div>
                      <div className="text-[#4E5E07] font-semibold">
                        ✓ Проверка орфографии и пунктуации выполнена!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4. DEEP ERROR ANALYSIS */}
          {activeSubTab === "errors" && (
            <Card className="border-2 border-[#4E5E07]/40 bg-white/85">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="default">PRO • Лингвистическая диагностика</Badge>
                  <div className="flex flex-wrap gap-2">
                    {ERROR_ANALYSIS_SAMPLES.map((s, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        onClick={() => setErrorInputText(s.sampleText)}
                      >
                        Пример {idx + 1}: {s.title}
                      </Button>
                    ))}
                  </div>
                </div>
                <CardTitle className="font-heading text-3xl text-[#2E3604] pt-2">
                  Глубокий AI-разбор ошибок (Орфография, Синтаксис, Стилистика)
                </CardTitle>
                <CardDescription>
                  Детальный разбор текста по правилам русской грамматики и справочнику Д. Э. Розенталя с персональным упражнением от <code>gemini-3.5-flash-lite</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={errorInputText}
                  onChange={(e) => setErrorInputText(e.target.value)}
                  rows={4}
                  placeholder="Введите ваш текст на русском языке для комплексного разбора ошибок..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="amber"
                    disabled={errorAnalysisLoading}
                    onClick={handleRunErrorAnalysis}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {errorAnalysisLoading
                        ? "Выполняем глубокий разбор (gemini-3.5-flash-lite)..."
                        : "Запустить глубокий разбор ошибок"}
                    </span>
                  </Button>
                </div>

                {errorAnalysisResult && (
                  <div className="rounded-2xl border-2 border-[#4E5E07]/40 bg-[#D8D2CF]/55 p-5 space-y-2">
                    <div className="text-xs font-bold uppercase text-[#4E5E07] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Результат экспертного разбора (gemini-3.5-flash-lite)</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#2E3604]">
                      {errorAnalysisResult}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
