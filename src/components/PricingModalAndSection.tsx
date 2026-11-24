"use client";

import React, { useState } from "react";
import {
  Check,
  Crown,
  Sparkles,
  Clock,
  Lock,
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricingSectionProps {
  currentPlan: "free" | "pro";
  onTogglePlan: (targetPlan: "free" | "pro") => Promise<void>;
  remainingSeconds: number | null;
  noonCountdown: string;
  onSimulateNoonReset: () => Promise<void>;
}

export function PricingSection({
  currentPlan,
  onTogglePlan,
  remainingSeconds,
  noonCountdown,
  onSimulateNoonReset,
}: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleStripeCheckout = async () => {
    setIsRedirecting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await res.json();
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleInstantPlanSwitch = async (plan: "free" | "pro") => {
    setIsSwitching(true);
    try {
      await onTogglePlan(plan);
    } finally {
      setIsSwitching(false);
    }
  };

  const formatMinSec = (sec: number | null) => {
    if (sec === null) return "∞ Безлимит";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Noon Reset Explanation & Billing Toggle */}
      <div className="rounded-2xl border-2 border-[#4E5E07]/40 bg-[#2E3604] p-6 text-[#D8D2CF] shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="amber">Stripe Billing • Good Corp. (Test Mode)</Badge>
              <Badge variant="default" className="bg-[#4E5E07] text-[#D8D2CF]">
                Авто-сброс Free: ежедневно в 12:00 (Полдень)
              </Badge>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl text-[#E19D29] tracking-wide">
              Тарифные планы обучения
            </h2>
            <p className="text-sm text-[#D8D2CF]/85 max-w-2xl">
              Начните с бесплатного тарифа (10 минут практики в день, 5 базовых уроков, квизы, грамматика и правописание) или перейдите на{" "}
              <span className="text-[#E19D29] font-semibold">Pro</span> для безлимитного доступа к проверке произношения, Speaking, Listening и глубокому AI-разбору ошибок.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#4E5E07]/25 p-3 rounded-xl border border-[#8D8179]/30">
            <div className="text-xs space-y-1 pr-2">
              <div className="flex items-center gap-1.5 text-[#E19D29] font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>До сброса в 12:00 дня: {noonCountdown}</span>
              </div>
              <div className="text-[#D8D2CF]/80">
                Остаток Free-лимита сегодня:{" "}
                <span className="font-bold text-white">{formatMinSec(remainingSeconds)}</span> / 10:00
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSimulateNoonReset}
              className="border-[#E19D29]/50 text-[#E19D29] hover:bg-[#E19D29]/15 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Симулировать 12:00 (Сброс)
            </Button>
          </div>
        </div>

        {/* Monthly / Annual Selector */}
        <div className="mt-6 pt-5 border-t border-[#8D8179]/25 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center rounded-xl bg-[#4E5E07]/30 p-1 border border-[#8D8179]/30">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#E19D29] text-[#2E3604] shadow"
                  : "text-[#D8D2CF] hover:text-white"
              }`}
            >
              Помесячно ($19 / мес)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-[#E19D29] text-[#2E3604] shadow"
                  : "text-[#D8D2CF] hover:text-white"
              }`}
            >
              <span>За год ($15 / мес • $180/год)</span>
              <span className="rounded-full bg-[#2E3604] text-[#E19D29] px-2 py-0.5 text-[10px]">
                -21%
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#D8D2CF]/80">
            <ShieldCheck className="w-4 h-4 text-[#E19D29]" />
            <span>
              Текущий режим:{" "}
              <strong className="text-[#E19D29] uppercase">{currentPlan}</strong>
            </span>
            <Button
              variant="amber"
              size="sm"
              disabled={isSwitching}
              onClick={() => handleInstantPlanSwitch(currentPlan === "pro" ? "free" : "pro")}
            >
              <Zap className="w-3.5 h-3.5" />
              {currentPlan === "pro"
                ? "Переключить на Free (Демо)"
                : "Мгновенно включить Pro (Демо)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FREE TIER CARD */}
        <Card
          className={`relative overflow-hidden border-2 transition-all ${
            currentPlan === "free"
              ? "border-[#4E5E07] bg-white/85 shadow-md"
              : "border-[#8D8179]/40 bg-[#D8D2CF]/70"
          }`}
        >
          {currentPlan === "free" && (
            <div className="bg-[#4E5E07] text-[#D8D2CF] text-xs font-semibold px-4 py-1.5 text-center">
              ВАШ ТЕКУЩИЙ ТАРИФ
            </div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Базовый старт</Badge>
              <span className="text-xs text-[#8D8179]">Сброс лимита в 12:00 дня</span>
            </div>
            <CardTitle className="font-heading text-4xl text-[#2E3604] pt-1">
              Тариф Free
            </CardTitle>
            <CardDescription className="text-[#2E3604]/80">
              Ежедневная тренировка базовой грамматики, правописания и квизов с AI-репетитором.
            </CardDescription>
            <div className="pt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#2E3604]">$0</span>
              <span className="text-xs text-[#8D8179]">/ навсегда • без привязки карты</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#4E5E07]/15 p-1 text-[#4E5E07]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>10 минут практики в день</strong> — автоматический сброс таймера раз в сутки ровно в полдень (12:00).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#4E5E07]/15 p-1 text-[#4E5E07]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>5 уроков бесплатно</strong> — открыты фундаментальные уроки по фонетике, роду, 6 падежам, корням и видам глагола.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#4E5E07]/15 p-1 text-[#4E5E07]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Базовые темы</strong> — доступ к этапам и справочнику правил русского языка.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#4E5E07]/15 p-1 text-[#4E5E07]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Квизы и задачи</strong> — интерактивные тесты с проверкой и пояснениями правил.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#4E5E07]/15 p-1 text-[#4E5E07]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Грамматика и правописание</strong> — базовая AI-проверка орфографии и пунктуации на базе <code>gemini-3.5-flash-lite</code> и RAG.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-[#8D8179]">
                <div className="mt-0.5 rounded-full bg-[#8D8179]/20 p-1 text-[#8D8179]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>Проверка произношения, Speaking, Listening и глубокий Разбор ошибок (только в Pro)</span>
              </li>
            </ul>

            <div className="pt-2">
              {currentPlan === "free" ? (
                <Button variant="outline" className="w-full" disabled>
                  Активен тариф Free (Сброс в 12:00)
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isSwitching}
                  onClick={() => handleInstantPlanSwitch("free")}
                >
                  Вернуться на тариф Free
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PRO TIER CARD */}
        <Card
          className={`relative overflow-hidden border-2 transition-all ${
            currentPlan === "pro"
              ? "border-[#E19D29] bg-[#2E3604] text-[#D8D2CF] shadow-xl"
              : "border-[#E19D29] bg-gradient-to-br from-[#2E3604] to-[#3a4505] text-[#D8D2CF] shadow-xl"
          }`}
        >
          <div className="bg-[#E19D29] text-[#2E3604] text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            <span>
              {currentPlan === "pro"
                ? "ВАШ АКТИВНЫЙ ТАРИФ PRO (БЕЗЛИМИТ)"
                : "МАКСИМАЛЬНЫЙ РЕЗУЛЬТАТ • ПОЛНЫЙ ДОСТУП"}
            </span>
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge variant="amber">Все уровни A1–C2 + Голос</Badge>
              <span className="text-xs text-[#E19D29]">Stripe Checkout Ready</span>
            </div>
            <CardTitle className="font-heading text-4xl text-[#E19D29] pt-1">
              Тариф Pro
            </CardTitle>
            <CardDescription className="text-[#D8D2CF]/85">
              Полное погружение в русский язык без ограничений по времени с голосовым AI-репетитором.
            </CardDescription>
            <div className="pt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {billingCycle === "monthly" ? "$19" : "$15"}
              </span>
              <span className="text-xs text-[#D8D2CF]/75">
                {billingCycle === "monthly"
                  ? "/ месяц • оплата через Stripe"
                  : "/ месяц ($180 при оплате за год)"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm text-[#D8D2CF]">
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#E19D29] p-1 text-[#2E3604]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong className="text-[#E19D29]">Неограниченное время использования (∞)</strong> — занимайтесь сколько угодно часов в день без 10-минутного лимита.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#E19D29] p-1 text-[#2E3604]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong className="text-[#E19D29]">Проверка произношения</strong> — запись голоса через микрофон, анализ ударений, редукции гласных и дикции.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#E19D29] p-1 text-[#2E3604]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong className="text-[#E19D29]">Speaking (Разговорная практика)</strong> — ролевые диалоги с AI-репетитором, озвучка ответов и подсказки живых идиом.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#E19D29] p-1 text-[#2E3604]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong className="text-[#E19D29]">Listening (Аудирование)</strong> — прослушивание русской речи на скоростях 0.8x / 1.0x / 1.2x, тесты на понимание и диктанты.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#E19D29] p-1 text-[#2E3604]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong className="text-[#E19D29]">Глубокий Разбор ошибок</strong> — морфологическая, синтаксическая и стилистическая диагностика текста с персональной работой над ошибками.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-full bg-[#E19D29] p-1 text-[#2E3604]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Все 10 уроков и 3 этапа (Начальный A1–A2, Продвинутый B1–B2, Эксперт C1–C2)</strong> + полный доступ к векторной базе знаний RAG.
                </span>
              </li>
            </ul>

            <div className="pt-2 space-y-2.5">
              <Button
                variant="amber"
                size="lg"
                className="w-full"
                onClick={handleStripeCheckout}
                disabled={isRedirecting}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isRedirecting
                    ? "Открываем Stripe Checkout..."
                    : `Оплатить Pro через Stripe (${billingCycle === "monthly" ? "$19/мес" : "$180/год"})`}
                </span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              {currentPlan !== "pro" && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-[#4E5E07] hover:bg-[#5e7209] text-[#D8D2CF]"
                  onClick={() => handleInstantPlanSwitch("pro")}
                  disabled={isSwitching}
                >
                  <Zap className="w-3.5 h-3.5 text-[#E19D29]" />
                  <span>Активировать Pro мгновенно (Демо-режим для проверки)</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
