"use client";

import { Brain, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

type Message = { role: "user" | "assistant"; content: string };

export default function DoubtsPage() {
  const [subject, setSubject] = useState("Python");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setSubject(params.get("subject") || "Python");
      setQuestion(params.get("question") || "");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function ask() {
    const clean = question.trim();
    if (!clean || loading || !subject.trim()) return;
    const previous = messages;
    setMessages([...messages, { role: "user", content: clean }]);
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tutor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: subject.trim(), question: clean, conversation: previous }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "StudyFlow could not answer right now.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
      void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "doubt_asked", subject: subject.trim(), title: `Asked a doubt about ${subject.trim()}`, topic: clean.slice(0, 120), metadata: { questionLength: clean.length } }) }).catch(() => undefined);
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "StudyFlow could not answer right now.");
    } finally {
      setLoading(false);
    }
  }

  return <AppShell><div className="space-y-8"><PageHeader eyebrow="AI support" title="Ask StudyFlow" description="Get a patient explanation when a concept, error, or question stops your progress." />
    <section className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600"><Brain size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Doubt solver</p><h2 className="mt-2 text-2xl font-semibold">What are you stuck on?</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ask for a short answer, an example, a step-by-step explanation, or a practice question.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-[180px_1fr_auto]"><label className="sr-only" htmlFor="doubt-subject">Subject</label><input id="doubt-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /><label className="sr-only" htmlFor="doubt-question">Question</label><input id="doubt-question" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void ask(); }} placeholder="Explain recursion in simple terms..." className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /><button type="button" onClick={() => void ask()} disabled={loading || !question.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Send size={15} />{loading ? "Thinking..." : "Ask StudyFlow"}</button></div>{error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}</section>
    {messages.length === 0 && <EmptyState icon={<Sparkles size={19} />} title="Your doubt history starts here" description="Ask a question above and StudyFlow will explain it using your selected subject." />}
    {messages.length > 0 && <section className="space-y-4" aria-live="polite"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">This conversation</h2><button type="button" onClick={() => { setMessages([]); setError(""); }} className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /> Clear</button></div>{messages.map((message, index) => <article key={`${message.role}-${index}`} className={`rounded-2xl border p-5 ${message.role === "user" ? "ml-8 border-violet-500/20 bg-violet-500/10" : "mr-8 border-[var(--border)] bg-[var(--panel)]"}`}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{message.role === "user" ? "You" : "StudyFlow AI"}</p><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{message.content}</div></article>)}{loading && <div className="mr-8 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">StudyFlow is thinking...</div>}</section>}
  </div></AppShell>;
}
