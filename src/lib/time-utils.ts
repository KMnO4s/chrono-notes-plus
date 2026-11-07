import type { Session } from "@/components/Chronometer";

import { Language, createTranslator, languageLocale } from "./i18n";

export function formatRelativeTime(timestamp: number, language: Language = "en"): string {
  const t = createTranslator(language);
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return t("Just now");
  if (minutes < 60) return t("{number}m ago", { number: minutes });
  if (hours < 24) return t("{number}h ago", { number: hours });
  if (days < 7) return t("{number}d ago", { number: days });
  return new Date(timestamp).toLocaleDateString(languageLocale(language));
}

export function calculateAverageSession(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const total = sessions.reduce((sum, s) => sum + s.duration, 0);
  return total / sessions.length;
}

export function groupSessionsByDate(sessions: Session[], _language: Language = "en"): Record<string, Session[]> {
  return sessions.reduce((groups, session) => {
    const date = new Date(session.completedAt).toLocaleDateString("en-CA");
    if (!groups[date]) groups[date] = [];
    groups[date].push(session);
    return groups;
  }, {} as Record<string, Session[]>);
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
