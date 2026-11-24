"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Lock,
  Crown,
  Clock,
  Flame,
  Trophy,
  Send,
  GraduationCap,
  HelpCircle,
  Mic,
  Database,
  CreditCard,
  RotateCcw,
  SpellCheck,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input, Textarea } from "@/components/ui/input";
import {
  LANGUAGE_STAGES,
  LESSONS_DATA,
  QUIZZES_DATA,
  LanguageStageId,
  LanguageLevelCode,
  LessonItem,
} from "@/data/russianCurriculum";
import { ProPracticeStudio } from "@/components/ProPracticeStudio";
import { RagArchiveExplorer } from "@/components/RagArchiveExplorer";
import { PricingSection } from "@/components/PricingModalAndSection";

type MainTab =
  | "lessons"
  | "tutor_grammar"
  | "quizzes"
  | "pro_studio"
  | "rag_archive"
  | "pricing";

export default function RussianAiTutorSaaS() {
  // User Profile & Plan State (synced with Neon Postgres)
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [stage, setStage] = useState<LanguageStageId>("beginner");
  const [level, setLevel] = useState<LanguageLevelCode>("A1");
  const [xp, setXp] = useState<number>(340);
  const [streakDays, setStreakDays] = useState<number>(5);
  const [completedLessons, setCompletedLessons] = useState<string[]>(["les-a1-1"]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  // Daily 10-minute Free timer with 12:00 PM (Noon) reset
  const [dailySecondsUsed, setDailySecondsUsed] = useState<number>(120);
  const [noonCountdown, setNoonCountdown] = useState<string>("15ч 40м 00с");
  const [isPracticeTimerRunning, setIsPracticeTimerRunning] = useState<boolean>(true);
  const [noonResetNotice, setNoonResetNotice] = useState<string | null>(null);
  const [checkoutBanner, setCheckoutBanner] = useState<string | null>(null);

  // Navigation & Active Items
  const [activeTab, setActiveTab] = useState<MainTab>("lessons");
  const [stageFilter, setStageFilter] = useState<LanguageStageId | "all">("all");
  const [selectedLesson, setSelectedLesson] = useState<LessonItem>(LESSONS_DATA[0]);
  const [lessonTaskChoice, setLessonTaskChoice] = useState<number | null>(null);

  // AI Tutor Chat & Grammar Checker (gemini-3.5-flash-lite + RAG)
  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | "model";
      text: string;
      ragSources?: Array<{ id: string; title: string; similarityPercent?: number }>;
    }>
  >([
    {
      role: "model",
      text: "Здравствуйте! Я **«Слово.AI»** — ваш персональный AI-репетитор по русскому языку на базе модели `gemini-3.5-flash-lite` и векторной базы знаний RAG.\n\nВы можете:\n- Задать любой вопрос по **грамматике, орфографии, падежам и ударениям**\n- Проверить текст на ошибки в блоке **«Грамматика и правописание»**\n- Спросить данные из подключённого **RAG-архива** (курсы, расписание преподавателей, цены, FAQ).",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Grammar & Spelling Checker (Free & Pro)
  const [grammarText, setGrammarText] = useState(
    "Преподаватель предлогает разобрать новую тему, чтобы студенты не делали ошибок в окончании глаголов и правильно звонили."
  );
  const [grammarResult, setGrammarResult] = useState("");
  const [grammarLoading, setGrammarLoading] = useState(false);

  // Quizzes State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const FREE_LIMIT_SECONDS = 600; // 10 minutes
  const remainingFreeSeconds =
    plan === "pro" ? null : Math.max(0, FREE_LIMIT_SECONDS - dailySecondsUsed);
  const isFreeLimitExhausted = plan === "free" && (remainingFreeSeconds ?? 0) <= 0;

  // Fetch initial profile from Neon Postgres
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.profile) {
        setPlan(data.profile.plan === "pro" ? "pro" : "free");
        setStage((data.profile.stage as LanguageStageId) || "beginner");
        setLevel((data.profile.level as LanguageLevelCode) || "A1");
        setXp(Number(data.profile.xp || 340));
        setStreakDays(Number(data.profile.streak_days || 5));
        setDailySecondsUsed(Number(data.profile.daily_seconds_used || 0));
        if (Array.isArray(data.profile.completed_lessons)) {
          setCompletedLessons(data.profile.completed_lessons);
        }
        if (data.profile.quiz_scores && typeof data.profile.quiz_scores === "object") {
          setQuizScores(data.profile.quiz_scores);
        }
      }
      if (data?.noonResetInfo?.formattedCountdown) {
        setNoonCountdown(data.noonResetInfo.formattedCountdown);
      }
      if (data?.wasResetAtNoon) {
        setNoonResetNotice(
          "Наступил полдень (12:00)! Ваши 10 бесплатных минут практики автоматически обновлены."
        );
      }
    } catch {
      // Keep default local state if offline
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    // Check URL params for Stripe Checkout return (?checkout=success&plan=pro)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "success") {
        const sessionId = params.get("session_id") || "stripe_test_session";
        fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set_plan", plan: "pro", sessionId }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d?.profile) setPlan("pro");
            setCheckoutBanner(
              "Оплата через Stripe успешно подтверждена! Тариф Pro активирован: доступны произношение, Speaking, Listening, разбор ошибок и безлимитное время."
            );
          })
          .catch(() => {});
      }
    }
  }, [fetchProfile]);

  // Live 1-second tick for:
  // 1) Countdown until 12:00 PM (Noon) reset
  // 2) Active daily practice timer for Free tier
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextNoon = new Date(now);
      nextNoon.setHours(12, 0, 0, 0);
      if (now.getTime() >= nextNoon.getTime()) {
        nextNoon.setDate(nextNoon.getDate() + 1);
      }
      const diffSec = Math.max(0, Math.floor((nextNoon.getTime() - now.getTime()) / 1000));
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      setNoonCountdown(
        `${String(h).padStart(2, "0")}ч ${String(m).padStart(2, "0")}м ${String(s).padStart(2, "0")}с`
      );

      // If exact noon hits (diffSec === 0), reset daily counter!
      if (diffSec === 0) {
        setDailySecondsUsed(0);
        setNoonResetNotice(
          "Полдень (12:00)! Бесплатный лимит (10 минут практики) сброшен."
        );
      } else if (plan === "free" && isPracticeTimerRunning) {
        setDailySecondsUsed((prev) => Math.min(FREE_LIMIT_SECONDS, prev + 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [plan, isPracticeTimerRunning]);

  // Helper to record practice seconds to Neon DB
  const recordPracticeSeconds = async (seconds: number) => {
    if (plan === "free") {
      setDailySecondsUsed((prev) => Math.min(FREE_LIMIT_SECONDS, prev + seconds));
    }
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_time", seconds }),
      });
    } catch {}
  };

  // Switch Free <-> Pro plan
  const handleTogglePlan = async (targetPlan: "free" | "pro") => {
    setPlan(targetPlan);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_plan", plan: targetPlan }),
      });
    } catch {}
  };

  // Simulate 12:00 PM Noon Reset
  const handleSimulateNoonReset = async () => {
    setDailySecondsUsed(0);
    setNoonResetNotice(
      "Дневной лимит тарифа Free успешно сброшен (симуляция наступления 12:00 дня): снова доступно 10:00 минут!"
    );
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_noon_reset" }),
      });
    } catch {}
  };

  // Change Stage & Level
  const handleSelectStageAndLevel = async (
    newStage: LanguageStageId,
    newLevel: LanguageLevelCode
  ) => {
    setStage(newStage);
    setLevel(newLevel);
    setStageFilter(newStage);
    const matchingLesson = LESSONS_DATA.find((l) => l.level === newLevel);
    if (matchingLesson && (matchingLesson.isFree || plan === "pro")) {
      setSelectedLesson(matchingLesson);
      setLessonTaskChoice(null);
    }
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_level", stage: newStage, level: newLevel }),
      });
    } catch {}
  };

  // Complete a lesson
  const handleCompleteLesson = async (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
      setXp((prev) => prev + 50);
    }
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete_lesson", lessonId, xpGain: 50 }),
      });
    } catch {}
  };

  // Send message to AI Tutor (gemini-3.5-flash-lite + RAG)
  const handleSendChatMessage = async (customMsg?: string) => {
    const text = (customMsg ?? chatInput).trim();
    if (!text || chatLoading) return;
    if (isFreeLimitExhausted) {
      setActiveTab("pricing");
      return;
    }

    const updatedHistory = [...chatHistory, { role: "user" as const, text }];
    setChatHistory(updatedHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          message: text,
          level,
          stage,
          plan,
          history: updatedHistory.slice(-10).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      setChatHistory([
        ...updatedHistory,
        {
          role: "model",
          text: data.answer || "Извините, не удалось получить ответ.",
          ragSources: data.retrievedChunks,
        },
      ]);
      recordPracticeSeconds(15);
    } finally {
      setChatLoading(false);
    }
  };

  // Run Grammar & Spelling Check (Available on Free & Pro)
  const handleCheckGrammarAndSpelling = async () => {
    if (!grammarText.trim() || grammarLoading) return;
    if (isFreeLimitExhausted) {
      setActiveTab("pricing");
      return;
    }
    setGrammarLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "grammar",
          message: grammarText,
          level,
          stage,
          plan,
        }),
      });
      const data = await res.json();
      setGrammarResult(data.answer || "Проверка завершена.");
      recordPracticeSeconds(20);
    } finally {
      setGrammarLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const filteredLessons =
    stageFilter === "all"
      ? LESSONS_DATA
      : LESSONS_DATA.filter((l) => l.stage === stageFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[#D8D2CF] text-[#2E3604]">
      {/* TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#4E5E07]/30 bg-[#2E3604] text-[#D8D2CF] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4E5E07] to-[#E19D29] flex items-center justify-center text-[#2E3604] font-bold text-xl shadow-md border border-[#E19D29]/40">
              Ъ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-3xl sm:text-4xl text-[#E19D29] leading-none">
                  Слово.AI
                </h1>
                <Badge variant="amber" className="text-[10px] py-0">
                  gemini-3.5-flash-lite • RAG
                </Badge>
              </div>
              <p className="text-[11px] text-[#D8D2CF]/75">
                Персональный AI-репетитор по русскому языку
              </p>
            </div>
          </div>

          {/* Daily Timer (10 Min Free with 12:00 PM Noon Reset) & User Stats */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Daily Practice Timer Widget */}
            <div className="flex items-center gap-3 rounded-xl bg-[#4E5E07]/35 border border-[#8D8179]/35 px-3.5 py-1.5">
              <Clock className="w-4 h-4 text-[#E19D29]" />
              {plan === "pro" ? (
                <div className="text-xs">
                  <div className="font-bold text-[#E19D29]">∞ Безлимит PRO</div>
                  <div className="text-[10px] text-[#D8D2CF]/75">
                    Неограниченное время практики
                  </div>
                </div>
              ) : (
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      Осталось: {formatTimer(remainingFreeSeconds ?? 0)} / 10:00
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPracticeTimerRunning((v) => !v)}
                      className="text-[10px] underline text-[#E19D29] cursor-pointer"
                    >
                      {isPracticeTimerRunning ? "Пауза" : "Старт"}
                    </button>
                  </div>
                  <div className="text-[10px] text-[#D8D2CF]/80">
                    Сброс в 12:00 (полдень) через: <strong>{noonCountdown}</strong>
                  </div>
                </div>
              )}
              {plan === "free" && (
                <button
                  type="button"
                  onClick={handleSimulateNoonReset}
                  title="Симулировать наступление 12:00 дня (сброс лимита 10 минут)"
                  className="rounded-lg bg-[#E19D29]/20 hover:bg-[#E19D29]/35 text-[#E19D29] p-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level, XP & Streak */}
            <div className="hidden md:flex items-center gap-2 rounded-xl bg-[#4E5E07]/25 border border-[#8D8179]/30 px-3 py-1.5 text-xs">
              <GraduationCap className="w-4 h-4 text-[#E19D29]" />
              <span>
                Уровень: <strong className="text-[#E19D29]">{level}</strong>
              </span>
              <span className="text-[#8D8179]">|</span>
              <Trophy className="w-3.5 h-3.5 text-[#E19D29]" />
              <span>{xp} XP</span>
              <span className="text-[#8D8179]">|</span>
              <Flame className="w-3.5 h-3.5 text-[#E19D29]" />
              <span>{streakDays} дн.</span>
            </div>

            {/* Instant Plan Switcher & Stripe CTA */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTogglePlan(plan === "pro" ? "free" : "pro")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  plan === "pro"
                    ? "bg-[#E19D29] text-[#2E3604] border-[#E19D29] shadow"
                    : "bg-[#4E5E07] text-[#D8D2CF] border-[#E19D29]/40 hover:bg-[#5b6e08]"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Тариф: {plan.toUpperCase()}</span>
                <span className="text-[10px] opacity-80">(Сменить)</span>
              </button>

              {plan === "free" && (
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => setActiveTab("pricing")}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Купить Pro (Stripe)</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* NOTIFICATIONS (Stripe Checkout Success / Noon Reset / Free Limit Reached) */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 space-y-3">
        {checkoutBanner && (
          <div className="rounded-2xl bg-[#4E5E07] text-[#D8D2CF] p-4 flex items-center justify-between gap-4 shadow-md border border-[#E19D29]">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#E19D29] shrink-0" />
              <span>{checkoutBanner}</span>
            </div>
            <Button
              size="sm"
              variant="amber"
              onClick={() => setCheckoutBanner(null)}
            >
              Отлично
            </Button>
          </div>
        )}

        {noonResetNotice && (
          <div className="rounded-2xl bg-[#2E3604] text-[#E19D29] p-3.5 flex items-center justify-between gap-4 border border-[#E19D29]/50 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{noonResetNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoonResetNotice(null)}
              className="underline cursor-pointer"
            >
              Скрыть
            </button>
          </div>
        )}

        {isFreeLimitExhausted && (
          <div className="rounded-2xl bg-[#2E3604] text-[#D8D2CF] p-4 flex flex-wrap items-center justify-between gap-4 border-2 border-[#E19D29]">
            <div className="flex items-center gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-[#E19D29] shrink-0" />
              <div>
                <strong className="text-[#E19D29]">
                  Исчерпан дневной лимит 10 минут на тарифе Free!
                </strong>{" "}
                Следующий автоматический сброс произойдёт в полдень (12:00) через{" "}
                <strong>{noonCountdown}</strong>. Перейдите на тариф <strong>Pro</strong> для безлимитного обучения или симулируйте сброс 12:00.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleSimulateNoonReset} className="text-[#E19D29] border-[#E19D29]">
                <RotateCcw className="w-3.5 h-3.5" />
                Сброс 12:00
              </Button>
              <Button size="sm" variant="amber" onClick={() => handleTogglePlan("pro")}>
                <Crown className="w-3.5 h-3.5" />
                Включить Pro Безлимит
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* HERO & LANGUAGE STAGES (Начальный, Продвинутый, Эксперт) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#2E3604] via-[#374205] to-[#4E5E07] p-6 sm:p-8 text-[#D8D2CF] shadow-xl border border-[#E19D29]/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#8D8179]/30">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="amber">Персональная траектория A1 → C2</Badge>
                <Badge variant="default" className="bg-white/10 text-[#D8D2CF]">
                  5 уроков бесплатно • Квизы • Грамматика и Правописание
                </Badge>
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl text-[#E19D29] tracking-wide">
                Этапы изучения русского языка
              </h2>
              <p className="text-xs sm:text-sm text-[#D8D2CF]/85 leading-relaxed">
                Выберите свой этап и уровень: программа разделена на{" "}
                <strong className="text-white">Начальный (A1–A2)</strong>,{" "}
                <strong className="text-white">Продвинутый (B1–B2)</strong> и{" "}
                <strong className="text-white">Эксперт (C1–C2)</strong>. Агент{" "}
                <code>gemini-3.5-flash-lite</code> адаптирует сложность примеров, диктантов и объяснений под ваш уровень.
              </p>
            </div>

            {/* Free Lessons & Daily Progress Summary */}
            <div className="rounded-2xl bg-[#2E3604]/80 p-4 border border-[#E19D29]/30 min-w-[260px] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#D8D2CF]/80">Пройдено уроков:</span>
                <span className="font-bold text-[#E19D29]">
                  {completedLessons.length} из {LESSONS_DATA.length} (5 Free)
                </span>
              </div>
              <Progress
                value={(completedLessons.length / LESSONS_DATA.length) * 100}
              />
              <div className="flex items-center justify-between text-[11px] text-[#D8D2CF]/75 pt-1">
                <span>Бесплатных уроков открыто: 5 / 5</span>
                <span>Pro-уроков: {plan === "pro" ? "5 / 5" : "Закрыты"}</span>
              </div>
            </div>
          </div>

          {/* 3 STAGES GRID: Начальный, Продвинутый, Эксперт */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            {LANGUAGE_STAGES.map((st) => {
              const isStageActive = stage === st.id;
              return (
                <div
                  key={st.id}
                  className={`rounded-2xl p-4 transition-all border ${
                    isStageActive
                      ? "bg-[#D8D2CF] text-[#2E3604] border-[#E19D29] shadow-lg"
                      : "bg-[#2E3604]/60 text-[#D8D2CF] border-[#8D8179]/30 hover:border-[#E19D29]/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`font-heading text-3xl ${
                        isStageActive ? "text-[#4E5E07]" : "text-[#E19D29]"
                      }`}
                    >
                      {st.title}
                    </span>
                    <Badge variant={isStageActive ? "default" : "amber"}>
                      {st.badge}
                    </Badge>
                  </div>
                  <p
                    className={`text-xs mb-3 leading-relaxed ${
                      isStageActive ? "text-[#2E3604]/80" : "text-[#D8D2CF]/75"
                    }`}
                  >
                    {st.description}
                  </p>
                  <div className="space-y-2">
                    {st.levels.map((lvl) => {
                      const isLevelSelected = level === lvl.code;
                      return (
                        <button
                          key={lvl.code}
                          type="button"
                          onClick={() => handleSelectStageAndLevel(st.id, lvl.code)}
                          className={`w-full text-left rounded-xl p-2.5 text-xs transition-all cursor-pointer border flex items-start justify-between gap-2 ${
                            isLevelSelected
                              ? "bg-[#4E5E07] text-[#D8D2CF] border-[#E19D29] font-semibold shadow"
                              : isStageActive
                              ? "bg-white/80 text-[#2E3604] border-[#8D8179]/30 hover:border-[#4E5E07]"
                              : "bg-[#4E5E07]/25 text-[#D8D2CF] border-[#8D8179]/20 hover:bg-[#4E5E07]/40"
                          }`}
                        >
                          <div>
                            <div className="font-bold">{lvl.name}</div>
                            <div className="text-[11px] opacity-85 mt-0.5">
                              {lvl.focus}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN NAVIGATION TABS */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-2">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#2E3604]/10 p-1.5 border border-[#8D8179]/30">
          <button
            type="button"
            onClick={() => setActiveTab("lessons")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "lessons"
                ? "bg-[#2E3604] text-[#E19D29] shadow"
                : "text-[#2E3604] hover:bg-[#4E5E07]/15"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Уроки (5 Free + Pro)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tutor_grammar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tutor_grammar"
                ? "bg-[#2E3604] text-[#E19D29] shadow"
                : "text-[#2E3604] hover:bg-[#4E5E07]/15"
            }`}
          >
            <SpellCheck className="w-4 h-4" />
            <span>AI-Репетитор & Правописание</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "quizzes"
                ? "bg-[#2E3604] text-[#E19D29] shadow"
                : "text-[#2E3604] hover:bg-[#4E5E07]/15"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Квизы и Задачи</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pro_studio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pro_studio"
                ? "bg-[#E19D29] text-[#2E3604] shadow"
                : "text-[#2E3604] hover:bg-[#E19D29]/25"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>PRO: Произношение, Speaking, Listening, Ошибки</span>
            <Badge variant="dark" className="text-[10px] px-1.5 py-0">
              PRO
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rag_archive")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rag_archive"
                ? "bg-[#2E3604] text-[#E19D29] shadow"
                : "text-[#2E3604] hover:bg-[#4E5E07]/15"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>База знаний RAG (Архив)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pricing"
                ? "bg-[#2E3604] text-[#E19D29] shadow"
                : "text-[#2E3604] hover:bg-[#4E5E07]/15"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Тарифы и Оплата (Stripe)</span>
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex-1">
        {/* TAB 1: LESSONS (5 FREE LESSONS + PRO LESSONS) */}
        {activeTab === "lessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Lesson List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading text-3xl text-[#2E3604]">
                  Программа уроков
                </h3>
                <div className="flex flex-wrap gap-1">
                  {(["all", "beginner", "advanced", "expert"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStageFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                        stageFilter === f
                          ? "bg-[#4E5E07] text-[#D8D2CF]"
                          : "bg-white/70 text-[#2E3604] hover:bg-white"
                      }`}
                    >
                      {f === "all"
                        ? "Все (10)"
                        : f === "beginner"
                        ? "Начальный"
                        : f === "advanced"
                        ? "Продвинутый"
                        : "Эксперт"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredLessons.map((les) => {
                  const isLocked = !les.isFree && plan !== "pro";
                  const isCompleted = completedLessons.includes(les.id);
                  const isSelected = selectedLesson.id === les.id;

                  return (
                    <div
                      key={les.id}
                      onClick={() => {
                        if (isLocked) {
                          setActiveTab("pricing");
                          return;
                        }
                        setSelectedLesson(les);
                        setLessonTaskChoice(null);
                      }}
                      className={`rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#4E5E07] bg-white shadow-md"
                          : isLocked
                          ? "border-[#8D8179]/30 bg-[#D8D2CF]/50 opacity-80 hover:border-[#E19D29]"
                          : "border-[#8D8179]/30 bg-white/75 hover:border-[#4E5E07]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant={les.isFree ? "default" : "amber"}>
                            {les.isFree ? `Бесплатно • Урок ${les.number}/5` : "PRO Урок"}
                          </Badge>
                          <Badge variant="secondary">{les.level}</Badge>
                          <span className="text-[11px] text-[#8D8179]">
                            {les.topicCategory}
                          </span>
                        </div>
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-[#8D8179]" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4E5E07]" />
                        ) : null}
                      </div>
                      <h4 className="text-sm font-bold text-[#2E3604] leading-snug">
                        {les.title}
                      </h4>
                      <p className="text-xs text-[#8D8179] mt-1 line-clamp-2">
                        {les.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Active Lesson Reader & Mini-Task */}
            <div className="lg:col-span-7">
              <Card className="border-2 border-[#4E5E07]/50 bg-white/95 shadow-lg">
                <CardHeader className="border-b border-[#8D8179]/25">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedLesson.isFree ? "default" : "amber"}>
                        {selectedLesson.isFree
                          ? `Бесплатный тариф (Урок ${selectedLesson.number} из 5)`
                          : "Тариф PRO"}
                      </Badge>
                      <Badge variant="secondary">
                        Уровень {selectedLesson.level} • {selectedLesson.topicCategory}
                      </Badge>
                    </div>
                    <span className="text-xs text-[#8D8179]">
                      ⏱ {selectedLesson.durationMinutes} мин
                    </span>
                  </div>
                  <CardTitle className="font-heading text-3xl sm:text-4xl text-[#2E3604] pt-2">
                    {selectedLesson.title}
                  </CardTitle>
                  <CardDescription className="text-[#2E3604]/80">
                    {selectedLesson.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Theory Content */}
                  <div className="rounded-2xl bg-[#D8D2CF]/45 p-5 border border-[#8D8179]/30 space-y-3">
                    <div className="text-xs font-bold uppercase text-[#4E5E07]">
                      Теория и правила русского языка
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#2E3604]">
                      {selectedLesson.theoryMarkdown}
                    </div>
                  </div>

                  {/* Key Rules Pills */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-[#4E5E07]">
                      Главные правила для запоминания:
                    </h4>
                    <ul className="space-y-2">
                      {selectedLesson.keyRules.map((rule, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs bg-[#4E5E07]/10 p-3 rounded-xl border border-[#4E5E07]/20"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#4E5E07] shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples Comparison */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-[#2E3604]">
                      Примеры правописания и употребления:
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedLesson.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-[#8D8179]/30 p-3.5 bg-white space-y-1 text-xs"
                        >
                          <div className="text-[#4E5E07] font-bold">
                            ✓ Правильно: {ex.correct}
                          </div>
                          {ex.incorrect && (
                            <div className="text-red-700 line-through">
                              ✗ Ошибочно: {ex.incorrect}
                            </div>
                          )}
                          <div className="text-[#8D8179] pt-1">{ex.explanation}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Exercise inside Lesson */}
                  <div className="rounded-2xl bg-[#2E3604] text-[#D8D2CF] p-5 space-y-4 border border-[#E19D29]/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#E19D29]">
                        Практическое задание к уроку (+50 XP)
                      </span>
                      {completedLessons.includes(selectedLesson.id) && (
                        <Badge variant="amber">Урок пройден ✓</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {selectedLesson.practiceTask.prompt}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedLesson.practiceTask.options.map((opt, idx) => {
                        const isChosen = lessonTaskChoice === idx;
                        const isRight = idx === selectedLesson.practiceTask.correctIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setLessonTaskChoice(idx);
                              if (idx === selectedLesson.practiceTask.correctIndex) {
                                handleCompleteLesson(selectedLesson.id);
                                recordPracticeSeconds(20);
                              }
                            }}
                            className={`text-left text-xs p-3 rounded-xl border transition-all cursor-pointer ${
                              isChosen
                                ? isRight
                                  ? "bg-[#E19D29] text-[#2E3604] border-[#E19D29] font-bold"
                                  : "bg-red-900/60 text-white border-red-400"
                                : "bg-[#4E5E07]/30 text-[#D8D2CF] border-[#8D8179]/30 hover:border-[#E19D29]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {lessonTaskChoice !== null && (
                      <div className="rounded-xl bg-white/10 p-3 text-xs text-[#D8D2CF] space-y-1">
                        <div className="font-bold text-[#E19D29]">
                          {lessonTaskChoice === selectedLesson.practiceTask.correctIndex
                            ? "🎉 Верно! +50 XP начислено в профиль."
                            : "Попробуйте ещё раз! Обратите внимание на правило:"}
                        </div>
                        <div>{selectedLesson.practiceTask.explanation}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: AI TUTOR CHAT & GRAMMAR/SPELLING CHECKER (gemini-3.5-flash-lite + RAG) */}
        {activeTab === "tutor_grammar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Interactive AI Tutor Chat with RAG Citations */}
            <Card className="lg:col-span-7 border-2 border-[#4E5E07]/50 bg-white/95 flex flex-col">
              <CardHeader className="border-b border-[#8D8179]/25 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="default">
                    Агент: gemini-3.5-flash-lite • Векторный RAG
                  </Badge>
                  <Badge variant="secondary">
                    Текущий уровень: {level} ({stage})
                  </Badge>
                </div>
                <CardTitle className="font-heading text-3xl text-[#2E3604] pt-1">
                  Диалог с AI-репетитором «Слово.AI»
                </CardTitle>
                <CardDescription>
                  Спрашивайте правила русского языка, разбор предложений или информацию из подключённой базы знаний RAG.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#4E5E07] text-[#D8D2CF]"
                            : "bg-[#D8D2CF]/60 text-[#2E3604] border border-[#8D8179]/35"
                        }`}
                      >
                        <div className="text-[11px] font-bold uppercase opacity-75 mb-1">
                          {msg.role === "user"
                            ? "Вы"
                            : "Слово.AI (gemini-3.5-flash-lite)"}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {msg.ragSources && msg.ragSources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-[#8D8179]/30 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-[#4E5E07]">
                              RAG-источники:
                            </span>
                            {msg.ragSources.map((s) => (
                              <span
                                key={s.id}
                                className="text-[10px] rounded-full bg-[#2E3604] text-[#E19D29] px-2 py-0.5"
                              >
                                {s.title} ({s.similarityPercent || 90}%)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Prompt Suggestions */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Объясни разницу между «надеть» и «одеть» с примерами",
                      "Как легко запомнить правописание корней -ЛАГ-/-ЛОЖ- и -КАС-/-КОС-?",
                      "Какие преподаватели, курсы и цены есть в базе знаний RAG?",
                      "Когда ставится тире между подлежащим и сказуемым?",
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChatMessage(q)}
                        className="text-[11px] rounded-xl bg-[#4E5E07]/10 hover:bg-[#4E5E07]/20 text-[#2E3604] border border-[#4E5E07]/25 px-2.5 py-1 transition-all cursor-pointer text-left"
                      >
                        ✨ {q}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendChatMessage();
                      }}
                      placeholder="Задайте вопрос репетитору по русскому языку или RAG..."
                      className="flex-1"
                    />
                    <Button
                      variant="amber"
                      disabled={chatLoading}
                      onClick={() => handleSendChatMessage()}
                    >
                      <Send className="w-4 h-4" />
                      <span>{chatLoading ? "Думаю..." : "Спросить"}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right 5 Cols: Grammar & Spelling Checker (Free & Pro) */}
            <Card className="lg:col-span-5 border-2 border-[#4E5E07]/50 bg-white/95">
              <CardHeader className="border-b border-[#8D8179]/25 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="default">Доступно в Free и Pro</Badge>
                  <span className="text-xs text-[#4E5E07] font-semibold">
                    Орфография и Пунктуация
                  </span>
                </div>
                <CardTitle className="font-heading text-3xl text-[#2E3604] pt-1">
                  Грамматика и правописание
                </CardTitle>
                <CardDescription>
                  Вставьте любое предложение или абзац: агент{" "}
                  <code>gemini-3.5-flash-lite</code> исправит ошибки, выделит орфограммы и объяснит правила.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <Textarea
                  value={grammarText}
                  onChange={(e) => setGrammarText(e.target.value)}
                  rows={4}
                  placeholder="Введите предложение на русском языке для проверки правописания и запятых..."
                />
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setGrammarText(
                        "В течении всего урока мы разберали причастные обороты и не заметили как пролитело время."
                      )
                    }
                    className="text-[11px] rounded-lg bg-[#D8D2CF] px-2.5 py-1 hover:bg-[#8D8179]/30 cursor-pointer"
                  >
                    Пример 1: «В течении урока...»
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGrammarText(
                        "Они борятся за высокий результат, слышут подсказки и расчитывают на победу."
                      )
                    }
                    className="text-[11px] rounded-lg bg-[#D8D2CF] px-2.5 py-1 hover:bg-[#8D8179]/30 cursor-pointer"
                  >
                    Пример 2: Спряжения глаголов
                  </button>
                </div>

                <Button
                  variant="default"
                  className="w-full"
                  disabled={grammarLoading}
                  onClick={handleCheckGrammarAndSpelling}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {grammarLoading
                      ? "Проверяем орфографию и грамматику..."
                      : "Проверить грамматику и правописание"}
                  </span>
                </Button>

                {grammarResult && (
                  <div className="rounded-2xl bg-[#D8D2CF]/60 border border-[#4E5E07]/40 p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-[#2E3604] max-h-[320px] overflow-y-auto">
                    {grammarResult}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: QUIZZES & TASKS (Available on Free & Pro) */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <Card className="border-2 border-[#4E5E07]/40 bg-[#2E3604] text-[#D8D2CF]">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="amber">Доступно на тарифах Free и Pro</Badge>
                  <span className="text-xs text-[#E19D29]">
                    Решено задач: {Object.keys(quizAnswers).length} из {QUIZZES_DATA.length}
                  </span>
                </div>
                <CardTitle className="font-heading text-4xl text-[#E19D29] pt-1">
                  Квизы и практические задачи по русскому языку
                </CardTitle>
                <CardDescription className="text-[#D8D2CF]/80">
                  Проверьте знание орфографии, пунктуации, падежей, спряжений и орфоэпических ударений по всем этапам (A1–C2).
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {QUIZZES_DATA.map((q, index) => {
                const selectedOpt = quizAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <Card
                    key={q.id}
                    className="border-2 border-[#8D8179]/35 bg-white/90 flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Задача #{index + 1}</Badge>
                          <Badge variant="secondary">
                            Уровень {q.level} • {q.category}
                          </Badge>
                        </div>
                        {quizScores[q.id] === 100 && (
                          <Badge variant="amber">+40 XP ✓</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-[#2E3604] pt-2">
                        {q.question}
                      </CardTitle>
                      <p className="text-xs bg-[#D8D2CF]/55 p-3 rounded-xl border border-[#8D8179]/30 text-[#2E3604] font-medium mt-1">
                        «{q.sentenceWithBlank}»
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          const isThisRight = optIdx === q.correctIndex;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={async () => {
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                recordPracticeSeconds(15);
                                if (optIdx === q.correctIndex && quizScores[q.id] !== 100) {
                                  setQuizScores((prev) => ({ ...prev, [q.id]: 100 }));
                                  setXp((prev) => prev + 40);
                                  try {
                                    await fetch("/api/profile", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        action: "save_quiz",
                                        quizId: q.id,
                                        score: 100,
                                        xpGain: 40,
                                      }),
                                    });
                                  } catch {}
                                }
                              }}
                              className={`text-left text-xs p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                isThisSelected
                                  ? isThisRight
                                    ? "bg-[#4E5E07] text-white border-[#4E5E07] font-bold"
                                    : "bg-red-100 text-red-950 border-red-500 font-semibold"
                                  : "bg-white hover:bg-[#D8D2CF]/40 border-[#8D8179]/35"
                              }`}
                            >
                              <span>{opt}</span>
                              {isThisSelected && (
                                <span>{isThisRight ? "✓ Верно" : "✗ Ошибка"}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div
                          className={`rounded-xl p-3 text-xs leading-relaxed ${
                            isCorrect
                              ? "bg-[#4E5E07]/15 text-[#2E3604] border border-[#4E5E07]/30"
                              : "bg-[#E19D29]/20 text-[#2E3604] border border-[#E19D29]"
                          }`}
                        >
                          <strong>Правило:</strong> {q.ruleExplanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRO PRACTICE STUDIO (Pronunciation, Speaking, Listening, Deep Error Analysis) */}
        {activeTab === "pro_studio" && (
          <ProPracticeStudio
            plan={plan}
            level={level}
            stage={stage}
            onUpgradeToPro={() => handleTogglePlan("pro")}
            onOpenPricingTab={() => setActiveTab("pricing")}
            onRecordPracticeTime={recordPracticeSeconds}
          />
        )}

        {/* TAB 5: RAG ARCHIVE EXPLORER */}
        {activeTab === "rag_archive" && <RagArchiveExplorer />}

        {/* TAB 6: PRICING & STRIPE CHECKOUT */}
        {activeTab === "pricing" && (
          <PricingSection
            currentPlan={plan}
            onTogglePlan={handleTogglePlan}
            remainingSeconds={remainingFreeSeconds}
            noonCountdown={noonCountdown}
            onSimulateNoonReset={handleSimulateNoonReset}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-[#8D8179]/35 bg-[#2E3604] text-[#D8D2CF] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-heading text-2xl text-[#E19D29]">Слово.AI</span>
            <span className="text-[#8D8179]">|</span>
            <span>Модель агента: gemini-3.5-flash-lite</span>
            <span className="text-[#8D8179]">|</span>
            <span>Эмбеддинги RAG: gemini-embedding-001</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[#D8D2CF]/75">
            <span>Цвета бренда: #2E3604 • #4E5E07 • #E19D29 • #D8D2CF • #8D8179</span>
            <span>•</span>
            <span>Оплата: Stripe (Good Corp.)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
