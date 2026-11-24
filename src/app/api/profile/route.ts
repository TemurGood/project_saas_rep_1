import { NextRequest, NextResponse } from "next/server";
import { sql, getCurrentNoonResetKey, getNextNoonResetInfo } from "@/lib/db";

const FREE_DAILY_LIMIT_SECONDS = 600; // 10 minutes per day on Free tier

export async function GET() {
  try {
    const now = new Date();
    const currentNoonKey = getCurrentNoonResetKey(now);
    const noonInfo = getNextNoonResetInfo(now);

    const rows = await sql`
      SELECT * FROM user_profiles WHERE id = 'default-user' LIMIT 1
    `;

    let profile = rows[0];

    if (!profile) {
      const inserted = await sql`
        INSERT INTO user_profiles (
          id, name, email, plan, stage, level, xp, streak_days,
          daily_seconds_used, last_noon_reset_key, completed_lessons, quiz_scores
        )
        VALUES (
          'default-user', 'Студент Русского Языка', 'student@slovo-ai.ru',
          'free', 'beginner', 'A1', 340, 5,
          120, ${currentNoonKey}, '["les-a1-1"]'::jsonb, '{"quiz-a1-1": 100}'::jsonb
        )
        RETURNING *
      `;
      profile = inserted[0];
    }

    // Check if we crossed 12:00 PM (noon) since last_noon_reset_key!
    let wasResetAtNoon = false;
    if (profile.last_noon_reset_key !== currentNoonKey) {
      const updated = await sql`
        UPDATE user_profiles
        SET daily_seconds_used = 0,
            last_noon_reset_key = ${currentNoonKey},
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      profile = updated[0];
      wasResetAtNoon = true;
    }

    return NextResponse.json({
      profile,
      freeDailyLimitSeconds: FREE_DAILY_LIMIT_SECONDS,
      remainingSeconds:
        profile.plan === "pro"
          ? null
          : Math.max(0, FREE_DAILY_LIMIT_SECONDS - Number(profile.daily_seconds_used || 0)),
      currentNoonKey,
      wasResetAtNoon,
      noonResetInfo: noonInfo,
    });
  } catch (error: unknown) {
    const now = new Date();
    return NextResponse.json({
      profile: {
        id: "default-user",
        name: "Студент Русского Языка",
        email: "student@slovo-ai.ru",
        plan: "free",
        stage: "beginner",
        level: "A1",
        xp: 340,
        streak_days: 5,
        daily_seconds_used: 120,
        last_noon_reset_key: getCurrentNoonResetKey(now),
        completed_lessons: ["les-a1-1"],
        quiz_scores: { "quiz-a1-1": 100 },
      },
      freeDailyLimitSeconds: FREE_DAILY_LIMIT_SECONDS,
      remainingSeconds: 480,
      currentNoonKey: getCurrentNoonResetKey(now),
      wasResetAtNoon: false,
      noonResetInfo: getNextNoonResetInfo(now),
      dbError: error instanceof Error ? error.message : undefined,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const now = new Date();
    const currentNoonKey = getCurrentNoonResetKey(now);
    const noonInfo = getNextNoonResetInfo(now);

    if (action === "toggle_plan" || action === "set_plan") {
      const targetPlan = body.plan === "pro" ? "pro" : "free";
      const rows = await sql`
        UPDATE user_profiles
        SET plan = ${targetPlan},
            stripe_session_id = COALESCE(${body.sessionId || null}, stripe_session_id),
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      return NextResponse.json({
        profile: rows[0],
        noonResetInfo: noonInfo,
      });
    }

    if (action === "add_time") {
      const addSec = Number(body.seconds || 0);
      const rows = await sql`
        UPDATE user_profiles
        SET daily_seconds_used = CASE
              WHEN last_noon_reset_key != ${currentNoonKey} THEN ${addSec}
              ELSE LEAST(600, daily_seconds_used + ${addSec})
            END,
            last_noon_reset_key = ${currentNoonKey},
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      const profile = rows[0];
      return NextResponse.json({
        profile,
        remainingSeconds:
          profile.plan === "pro"
            ? null
            : Math.max(0, FREE_DAILY_LIMIT_SECONDS - Number(profile.daily_seconds_used || 0)),
        noonResetInfo: noonInfo,
      });
    }

    if (action === "simulate_noon_reset") {
      const rows = await sql`
        UPDATE user_profiles
        SET daily_seconds_used = 0,
            last_noon_reset_key = ${currentNoonKey},
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      return NextResponse.json({
        profile: rows[0],
        wasResetAtNoon: true,
        remainingSeconds: FREE_DAILY_LIMIT_SECONDS,
        noonResetInfo: noonInfo,
      });
    }

    if (action === "set_level") {
      const { stage, level } = body;
      const rows = await sql`
        UPDATE user_profiles
        SET stage = ${stage || "beginner"},
            level = ${level || "A1"},
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      return NextResponse.json({ profile: rows[0], noonResetInfo: noonInfo });
    }

    if (action === "complete_lesson") {
      const { lessonId, xpGain = 50 } = body;
      const currentRows = await sql`SELECT * FROM user_profiles WHERE id = 'default-user' LIMIT 1`;
      const current = currentRows[0];
      const completed: string[] = Array.isArray(current?.completed_lessons)
        ? current.completed_lessons
        : [];
      const isNew = !completed.includes(lessonId);
      const nextCompleted = isNew ? [...completed, lessonId] : completed;

      const rows = await sql`
        UPDATE user_profiles
        SET completed_lessons = ${JSON.stringify(nextCompleted)}::jsonb,
            xp = xp + ${isNew ? Number(xpGain) : 10},
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      return NextResponse.json({ profile: rows[0], noonResetInfo: noonInfo });
    }

    if (action === "save_quiz") {
      const { quizId, score, xpGain = 40 } = body;
      const currentRows = await sql`SELECT * FROM user_profiles WHERE id = 'default-user' LIMIT 1`;
      const current = currentRows[0];
      const scores: Record<string, number> =
        current?.quiz_scores && typeof current.quiz_scores === "object"
          ? current.quiz_scores
          : {};
      scores[quizId] = Math.max(scores[quizId] || 0, Number(score));

      const rows = await sql`
        UPDATE user_profiles
        SET quiz_scores = ${JSON.stringify(scores)}::jsonb,
            xp = xp + ${Number(xpGain)},
            updated_at = NOW()
        WHERE id = 'default-user'
        RETURNING *
      `;
      return NextResponse.json({ profile: rows[0], noonResetInfo: noonInfo });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
