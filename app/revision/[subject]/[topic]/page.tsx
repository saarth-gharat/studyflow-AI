"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, ExternalLink, Layers3, PlayCircle, RotateCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";

const steps = [
  { minutes: 1, title: "Quick concept review", description: "Open your notes and recall the main idea before checking details." },
  { minutes: 2, title: "Key terms", description: "Review the vocabulary that defines this topic." },
  { minutes: 3, title: "Flashcards", description: "Use active recall to test what you remember." },
  { minutes: 3, title: "Practice questions", description: "Try a few questions and identify what still feels unclear." },
  { minutes: 1, title: "Mini quiz", description: "Finish with a short quiz in the existing StudyFlow quiz experience." },
];

export default function RevisionPage() {
  const params = useParams();
  const subject = decodeURIComponent(String(params?.subject || "Subject"));
  const topic = decodeURIComponent(String(params?.topic || "Topic"));
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [error, setError] = useState("");

  async function startRevision() {
    setStarted(true);
    setError("");
    try {
      const response = await fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "revision_started", subject, topic, title: `Started revision for ${topic}` }) });
      if (!response.ok && response.status !== 401) throw new Error("Revision activity could not be recorded.");
    } catch {
      setError("Revision started, but the activity could not be recorded.");
    }
  }

  async function finishRevision() {
    try {
      await fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "revision_completed", subject, topic, title: `Completed revision for ${topic}` }) });
    } finally {
      setCompleted(steps.map((_, index) => index));
    }
  }

  return <AppShell><div className="mx-auto max-w-4xl space-y-8"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Focused revision</p><h1 className="mt-2 text-3xl font-semibold">10-minute revision</h1><p className="mt-2 text-sm text-[var(--muted)]">{subject} · {topic}</p></div><section className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600"><Clock3 size={22} /></div><div><h2 className="text-xl font-semibold">A short, focused reset</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use your existing notes, flashcards, and quiz tools to revisit {topic} without starting a full course again.</p></div></div>{error && <p role="alert" className="mt-4 text-sm text-amber-600">{error}</p>}{!started ? <button type="button" onClick={() => void startRevision()} className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500">Start revision</button> : <p className="mt-6 text-sm font-medium text-violet-600">Revision in progress</p>}</section><section className="space-y-3">{steps.map((step, index) => { const done = completed.includes(index); return <article key={step.title} className={`flex items-start gap-4 rounded-2xl border p-5 ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-[var(--border)] bg-[var(--panel)]"}`}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-semibold text-violet-600">{done ? <CheckCircle2 size={18} /> : index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{step.title}</h2><span className="text-xs text-[var(--muted)]">{step.minutes} min</span></div><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{step.description}</p></div></article>; })}</section><div className="flex flex-wrap gap-3"><Link href={`/learn/${encodeURIComponent(subject)}/notes`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium"><ExternalLink size={15} /> Review notes</Link><Link href={`/flashcards?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium"><Layers3 size={15} /> Practice flashcards</Link><Link href={`/learn/${encodeURIComponent(subject)}/quiz`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium"><PlayCircle size={15} /> Take quiz</Link>{started && completed.length < steps.length && <button type="button" onClick={() => void finishRevision()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"><CheckCircle2 size={15} /> Complete revision</button>}{completed.length === steps.length && <button type="button" onClick={() => { setCompleted([]); setStarted(false); }} className="inline-flex items-center gap-2 text-sm text-[var(--muted)]"><RotateCcw size={15} /> Restart</button>}</div></div></AppShell>;
}
