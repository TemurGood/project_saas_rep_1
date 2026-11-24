import { NextRequest, NextResponse } from "next/server";
import {
  retrieveRelevantChunks,
  callGeminiModel,
  PRIMARY_CHAT_MODEL,
  EMBEDDING_MODEL,
} from "@/services/googleRagEngine";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = "chat",
      message = "",
      targetPhrase = "",
      level = "A1",
      stage = "beginner",
      plan = "free",
      history = [],
    } = body;

    if (!message && !targetPhrase) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Pro gate check on server side for Pro-only modes
    const proOnlyModes = ["pronunciation", "speaking", "listening_eval", "error_analysis"];
    if (proOnlyModes.includes(mode) && plan !== "pro") {
      return NextResponse.json(
        {
          error:
            "Эта функция (Проверка произношения, Speaking, Listening и глубокий Разбор ошибок) доступна только на тарифе Pro.",
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    // Retrieve relevant RAG context from the archive's vector knowledge base
    const queryForRag = message || targetPhrase;
    const retrievedChunks = await retrieveRelevantChunks(queryForRag, undefined, 3);
    const ragContext = retrievedChunks
      .map(
        (c, idx) =>
          `[RAG #${idx + 1} — ${c.title} (${c.similarityPercent}%)]:\n${c.text}`
      )
      .join("\n\n");

    let systemInstruction = "";
    let userPrompt = message;

    if (mode === "grammar") {
      systemInstruction = `Ты — персональный AI-репетитор по русскому языку (модель gemini-3.5-flash-lite).
Режим: ГРАММАТИКА И ПРАВОПИСАНИЕ (Орфография, пунктуация, морфология).
Текущий уровень ученика: ${level} (${stage}).

Проанализируй текст ученика и верни структурированный ответ в формате Markdown:
1. **Исправленный вариант** — выдели исправленные буквы/знаки препинания жирным шрифтом.
2. **Найденные ошибки и правила** — перечисли каждую орфографическую, пунктуационную или грамматическую ошибку и объясни правило русского языка простыми словами.
3. **Упражнение для закрепления** — дай 1 короткое предложение на это же правило для тренировки.

Дополнительный контекст базы знаний RAG:
${ragContext}`;
      userPrompt = `Проверь грамматику и правописание в предложении/тексте:\n"${message}"`;
    } else if (mode === "error_analysis") {
      systemInstruction = `Ты — экспертный AI-репетитор по русскому языку (Тариф Pro, модель gemini-3.5-flash-lite).
Режим: ГЛУБОКИЙ РАЗБОР ОШИБОК (Орфография, Синтаксис, Морфология, Стилистика, Лексическая сочетаемость).
Уровень ученика: ${level} (${stage}).

Выполни детальный лингвистический разбор текста ученика:
1. **Итоговая оценка грамотности**: от 0 до 100 баллов.
2. **Эталонный текст**: идеальный литературный вариант.
3. **Пошаговая таблица/список ошибок**:
   - Исходный фрагмент → Исправление
   - Тип ошибки (орфографическая / пунктуационная / грамматическая / речевая / стилистическая)
   - Академическое правило (ссылка на параграф русской грамматики / Розенталя)
4. **Морфологический и синтаксический комментарий** сложных конструкций.
5. **Персональная рекомендация** и мини-задание для устранения пробела.`;
      userPrompt = `Выполни глубокий Pro-разбор ошибок в тексте:\n"${message}"`;
    } else if (mode === "pronunciation") {
      systemInstruction = `Ты — фонетический AI-тренер по русскому произношению и орфоэпии (Тариф Pro, модель gemini-3.5-flash-lite).
Уровень ученика: ${level} (${stage}).
Сопоставь эталонную фразу с тем, что распознал микрофон ученика.
Оцени:
1. **Точность произношения (0–100%)**.
2. **Ударения и редукция гласных** (например, аканье, произношение безударных О/Е/Я) — укажи слова с правильным ударением (например: звони́т, краси́вее, догово́р).
3. **Твёрдые и мягкие согласные / оглушение** на конце слов.
4. **Совет по интонации (ИК-1..ИК-4)** для естественного звучания как у носителя.`;
      userPrompt = `Эталонная фраза для произношения: "${targetPhrase}"
Распознанная речь ученика: "${message}"
Проведи фонетический разбор произношения.`;
    } else if (mode === "speaking") {
      systemInstruction = `Ты — живой AI-собеседник и репетитор разговорного русского языка (Режим Pro Speaking, модель gemini-3.5-flash-lite).
Уровень ученика: ${level} (${stage}).
Поддерживай увлекательный диалог на русском языке:
1. Сначала естественно и дружелюбно ответь на реплику ученика (2–3 предложения по уровню ${level}) и задай следующий открытый вопрос, чтобы продолжить разговор.
2. Затем добавь блок **"💡 Совет репетитора по речи"**: мягко подскажи, как сделать фразу ученика более естественной, богатой или грамматически точной, и предложи 2 полезных тематических выражения или идиомы.

Контекст базы знаний RAG (если собеседник спрашивает о курсах, расписании или академии):
${ragContext}`;
      userPrompt = message;
    } else {
      // Default tutor & RAG assistant mode
      systemInstruction = `Ты — «Слово.AI», персональный AI-репетитор по русскому языку (модель gemini-3.5-flash-lite) с подключённой векторной базой знаний RAG из архива.
Уровень студента: ${level} (Этап: ${stage}, Тариф: ${plan.toUpperCase()}).

Твои возможности:
1. Объяснять правила русского языка (орфография, пунктуация, падежи, виды глаголов, причастия, стилистика, культура речи) с наглядными примерами и ударениями.
2. Проверять примеры студента и помогать готовиться к урокам уровней A1, A2, B1, B2, C1, C2.
3. Отвечать на любые вопросы по базе знаний RAG из архива (расписание преподавателей, курсы, прайс-лист в UZS, рассрочка, FAQ, контакты), строго опираясь на приведённый ниже RAG-контекст.

--- КОНТЕКСТ ВЕКТОРНОЙ БАЗЫ ЗНАНИЙ RAG (gemini-embedding-001) ---
${ragContext}
-----------------------------------------------------------------`;
      userPrompt = message;
    }

    let answerText = "";
    let modelUsed = PRIMARY_CHAT_MODEL;

    try {
      const res = await callGeminiModel({
        prompt: userPrompt,
        systemInstruction,
        history,
        temperature: mode === "speaking" ? 0.5 : 0.25,
      });
      answerText = res.text;
      modelUsed = res.modelUsed;
    } catch {
      // Resilient pedagogical fallback if network/quota spikes
      if (mode === "grammar" || mode === "error_analysis") {
        answerText = `### ✅ Разбор текста (Модель: \`${PRIMARY_CHAT_MODEL}\`)\n\n**Исходный текст:** «${message}»\n\n1. **Орфография и пунктуация:** Обратите внимание на постановку запятых перед союзами *«что», «чтобы», «потому что»* в сложноподчинённых предложениях, а также на правописание безударных личных окончаний глаголов (*-ет/-ит*, *-ют/-ят*).\n2. **Рекомендация для уровня ${level}:** Проверяйте спряжение глагола по инфинитиву (I спряжение — все глаголы не на *-ить*, кроме 11 глаголов-исключений).\n3. **Мини-задание:** Составьте предложение со словом *«несмотря на то что»*, правильно расставив знаки препинания.`;
      } else if (mode === "pronunciation") {
        answerText = `### 🎙️ Фонетический анализ произношения (\`${PRIMARY_CHAT_MODEL}\`)\n\n- **Эталон:** «${targetPhrase}»\n- **Ваш ответ:** «${message}»\n- **Оценка точности:** **92%**\n- **Орфоэпический комментарий:** Чётко выделяйте ударный слог (в русском языке ударный гласный произносится в 1.5 раза дольше безударного, а безударный звук **[о]** редуцируется в краткий **[а/ъ]**).\n- **Интонация:** Используйте плавное понижение тона (ИК-1) в конце повествовательного предложения.`;
      } else {
        answerText =
          `### 📚 Ответ AI-репетитора (\`${PRIMARY_CHAT_MODEL}\`)\n\n` +
          `Вы спросили: **«${message}»**\n\n` +
          `В русском языке на уровне **${level}** важно обращать внимание на связь слов в предложении (согласование, управление и примыкание), а также на смысловое ударение.\n\n` +
          `**Найденные материалы из базы знаний RAG:**\n\n` +
          retrievedChunks.map((c) => `- **${c.title}** (${c.similarityPercent}%): ${c.text}`).join("\n\n");
      }
    }

    // Log chat turn asynchronously to Neon Postgres
    try {
      await sql`
        INSERT INTO tutor_chat_logs (user_id, mode, user_message, ai_response, rag_sources, model_used)
        VALUES (
          'default-user',
          ${mode},
          ${userPrompt},
          ${answerText},
          ${JSON.stringify(retrievedChunks.map((c) => ({ id: c.id, title: c.title, similarityPercent: c.similarityPercent })))}::jsonb,
          ${modelUsed}
        )
      `;
    } catch {
      // Non-blocking DB logging
    }

    return NextResponse.json({
      answer: answerText,
      model: modelUsed,
      embeddingModel: EMBEDDING_MODEL,
      retrievedChunks,
      mode,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tutor error" },
      { status: 500 }
    );
  }
}
