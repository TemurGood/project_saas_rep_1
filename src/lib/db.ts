import { neon } from "@neondatabase/serverless";

export const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost/neondb";

export const sql = neon(DATABASE_URL);

/**
 * Calculates the current Noon (12:00 PM) Reset Window Key.
 * Since the Free tier resets once a day at 12:00 PM (noon):
 * - If current time is before 12:00 PM today, the current window started yesterday at 12:00 PM.
 * - If current time is >= 12:00 PM today, the current window started today at 12:00 PM.
 */
export function getCurrentNoonResetKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = now.getHours();

  if (hours >= 12) {
    return `${year}-${month}-${day}-NOON`;
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yYear = yesterday.getFullYear();
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
    const yDay = String(yesterday.getDate()).padStart(2, "0");
    return `${yYear}-${yMonth}-${yDay}-NOON`;
  }
}

/**
 * Returns milliseconds and formatted countdown string until the next 12:00 PM (noon) reset.
 */
export function getNextNoonResetInfo(now: Date = new Date()): {
  nextResetIso: string;
  secondsUntilReset: number;
  formattedCountdown: string;
} {
  const nextNoon = new Date(now);
  nextNoon.setHours(12, 0, 0, 0);
  if (now.getTime() >= nextNoon.getTime()) {
    nextNoon.setDate(nextNoon.getDate() + 1);
  }
  const diffMs = Math.max(0, nextNoon.getTime() - now.getTime());
  const totalSec = Math.floor(diffMs / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return {
    nextResetIso: nextNoon.toISOString(),
    secondsUntilReset: totalSec,
    formattedCountdown: `${String(hrs).padStart(2, "0")}ч ${String(mins).padStart(2, "0")}м ${String(secs).padStart(2, "0")}с`,
  };
}
