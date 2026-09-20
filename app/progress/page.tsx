"use client";

import Link from "next/link";
import { BarChart3, Brain, CheckCircle2, Clock3, FileText, PlayCircle, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";

type Analytics = {
  metrics: { activityTotal: number; videosWatched: number; notesGenerated: number; quizzesCompleted: number; flashcardsReviewed: number; doubtsAsked: number; plansCreated: number; learningPathsCreated: number; practiceSessions: number; practiceQuestions: number; codingChallengesCompleted: number; averageQuizScore: number | null; bestQuizScore: number | null };
  dailyActivity: { label: string; date: string; count: number }[];
  activities: { id: string; title: string; subject: string; created_at: string }[];
  attempts: { id: string; subject: string; percentage: number; completed_at: string }[];
  progress: { subject: string; videos_progress: number; notes_progress: number; quiz_progress: number; tutor_progress: number }[];
};

export default function ProgressPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Learning analytics are unavailable.");
      setAnalytics(data);
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Learning analytics are unavailable.")).finally(() => setLoading(false));
  }, []);

  return <AppShell><div className="space-y-8"><div><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Analytics</span><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your learning</h1><p className="mt-2 text-sm text-[var(--muted)]">Only activity and quiz results recorded by StudyFlow are shown.</p></div>
    {loading && <section aria-live="polite" className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8"><div className="h-5 w-48 animate-pulse rounded bg-[var(--panel-soft)]" /><div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--panel-soft)]" /></section>}
    {!loading && error && <section role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8"><h2 className="font-semibold text-red-600">Unable to load analytics</h2><p className="mt-2 text-sm text-red-600/80">{error}</p></section>}
    {!loading && !error && analytics && analytics.metrics.activityTotal === 0 && analytics.progress.length === 0 && <EmptyState icon={<BarChart3 size={19} />} title="No analytics yet" description="Start a lesson, complete a quiz, ask a doubt, or create flashcards to see real learning activity here." actionHref="/explore" actionLabel="Start learning" />}
    {!loading && !error && analytics && (analytics.metrics.activityTotal > 0 || analytics.progress.length > 0) && <>
      {(() => { const summaryCards: { label: string; value: number; Icon: LucideIcon }[] = [{ label: "Videos watched", value: analytics.metrics.videosWatched, Icon: PlayCircle }, { label: "Quizzes completed", value: analytics.metrics.quizzesCompleted, Icon: CheckCircle2 }, { label: "Practice sessions", value: analytics.metrics.practiceSessions, Icon: BarChart3 }, { label: "Doubts asked", value: analytics.metrics.doubtsAsked, Icon: Brain }, { label: "Flashcard decks", value: analytics.metrics.flashcardsReviewed, Icon: Sparkles }]; return <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{summaryCards.map(({ label, value, Icon }) => <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-[var(--muted)]">{label}</p><Icon size={17} className="text-violet-600" /></div><p className="mt-4 text-3xl font-semibold">{value}</p></div>)}</section>; })()}
      <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Activity this week</h2><p className="mt-1 text-sm text-[var(--muted)]">Recorded events by day</p></div><Clock3 size={18} className="text-violet-600" /></div><div className="mt-6 flex h-36 items-end justify-between gap-2">{analytics.dailyActivity.map((day) => { const max = Math.max(...analytics.dailyActivity.map((item) => item.count), 1); return <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div title={`${day.count} activities`} className="w-full max-w-8 rounded-t-lg bg-violet-500/70" style={{ height: `${Math.max(day.count ? (day.count / max) * 100 : 4, 4)}%` }} /><span className="text-[11px] text-[var(--muted)]">{day.label}</span></div>; })}</div></div><div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><h2 className="font-semibold">Quiz performance</h2><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[var(--panel-soft)] p-4"><p className="text-xs text-[var(--muted)]">Attempts</p><p className="mt-2 text-2xl font-semibold">{analytics.attempts.length}</p></div><div className="rounded-xl bg-[var(--panel-soft)] p-4"><p className="text-xs text-[var(--muted)]">Average score</p><p className="mt-2 text-2xl font-semibold">{analytics.metrics.averageQuizScore === null ? "Not enough data" : `${analytics.metrics.averageQuizScore}%`}</p></div></div>{analytics.attempts.length > 0 && <div className="mt-4 space-y-2">{analytics.attempts.slice(0, 5).map((attempt) => <div key={attempt.id} className="flex justify-between text-sm"><span className="text-[var(--muted)]">{attempt.subject}</span><span className="font-medium text-violet-600">{attempt.percentage}%</span></div>)}</div>}</div></section>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-sm"><div className="border-b border-[var(--border)] px-5 py-4"><h2 className="font-semibold">Recorded subject progress</h2></div>{analytics.progress.length === 0 ? <p className="p-5 text-sm text-[var(--muted)]">No subject progress has been recorded yet.</p> : <div className="divide-y divide-[var(--border)]">{analytics.progress.map((record) => <div key={record.subject} className="px-5 py-5"><div className="flex justify-between"><h3 className="font-medium">{record.subject}</h3><Link href={`/learn/${encodeURIComponent(record.subject)}`} className="text-sm text-violet-600">Open workspace</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-4">{[["Videos", record.videos_progress], ["Notes", record.notes_progress], ["Quiz", record.quiz_progress], ["Tutor", record.tutor_progress]].map(([label, value]) => <div key={String(label)}><div className="flex justify-between text-xs text-[var(--muted)]"><span>{label}</span><span>{value}%</span></div><div className="mt-2 h-1.5 rounded-full bg-[var(--panel-soft)]"><div className="h-full rounded-full bg-violet-600" style={{ width: `${value}%` }} /></div></div>)}</div></div>)}</div>}</section>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5"><div className="flex items-center gap-2"><FileText size={17} className="text-violet-600" /><h2 className="font-semibold">Recent activity</h2></div>{analytics.activities.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">Not enough activity yet.</p> : <div className="mt-4 space-y-3">{analytics.activities.slice(0, 8).map((activity) => <div key={activity.id} className="flex justify-between gap-4 text-sm"><span>{activity.title}</span><span className="shrink-0 text-xs text-[var(--muted)]">{new Date(activity.created_at).toLocaleDateString()}</span></div>)}</div>}</section>
    </>}
  </div></AppShell>;
}
