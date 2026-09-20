"use client";

import { Check, ChevronLeft, ChevronRight, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

type Card = { question: string; answer: string; topic: string };

export default function FlashcardsPage() {
  const [subject, setSubject] = useState("Python");
  const [topic, setTopic] = useState("Functions");
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subject")) setSubject(params.get("subject") || "Python");
      if (params.get("topic")) setTopic(params.get("topic") || "Functions");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function generate() {
    if (!subject.trim() || !topic.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/flashcards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, topic, count }) });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.cards)) throw new Error(data.error || "Unable to generate flashcards.");
      setCards(data.cards);
      setIndex(0);
      setFlipped(false);
      setKnown({});
      void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "flashcards_generated", subject, topic, title: `Generated ${data.cards.length} flashcards for ${topic}`, metadata: { count: data.cards.length } }) }).catch(() => undefined);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate flashcards.");
    } finally {
      setLoading(false);
    }
  }

  function rateCard(value: boolean) {
    const nextKnown = { ...known, [index]: value };
    setKnown(nextKnown);
    setFlipped(true);
  }

  function next() {
    if (index >= cards.length - 1) {
      void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "flashcards_completed", subject, topic, title: `Completed flashcards for ${topic}`, metadata: { reviewed: cards.length, known: Object.values(known).filter(Boolean).length } }) }).catch(() => undefined);
      return;
    }
    setIndex((current) => current + 1);
    setFlipped(false);
  }

  const card = cards[index];
  const complete = cards.length > 0 && index === cards.length - 1 && known[index] !== undefined;

  return <AppShell><div className="space-y-8"><PageHeader eyebrow="Active recall" title="AI flashcards" description="Generate a focused deck, flip each card, and mark what you truly know." />
    {!card && <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:p-8"><div className="grid gap-5 md:grid-cols-3"><label className="text-sm font-medium">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Topic<input value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Cards<select value={count} onChange={(event) => setCount(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500"><option value={5}>5 cards</option><option value={10}>10 cards</option><option value={15}>15 cards</option><option value={20}>20 cards</option></select></label></div>{error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}<button type="button" onClick={() => void generate()} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Sparkles size={16} />{loading ? "Generating flashcards..." : "Generate flashcards"}</button></section>}
    {!card && !loading && !error && <EmptyState icon={<Sparkles size={19} />} title="No flashcards yet" description="Generate a deck from a subject and topic to start revising." />}
    {card && <section className="mx-auto w-full max-w-2xl space-y-5"><div className="flex items-center justify-between text-sm text-[var(--muted)]"><span>{index + 1} / {cards.length}</span><span>{Object.keys(known).length} reviewed</span></div><div className="h-2 rounded-full bg-[var(--panel-soft)]"><div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div><button type="button" onClick={() => setFlipped((current) => !current)} className="min-h-[280px] w-full rounded-3xl border border-violet-500/20 bg-[var(--panel)] p-8 text-left shadow-lg transition hover:border-violet-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">{flipped ? "Answer" : "Question"}</p><p className="mt-6 text-2xl font-semibold leading-10 text-[var(--text)]">{flipped ? card.answer : card.question}</p><p className="mt-8 text-sm text-[var(--muted)]">{flipped ? card.topic : "Click to show answer"}</p></button><div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => rateCard(false)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600"><X size={15} /> Didn&apos;t know</button><button type="button" onClick={() => rateCard(true)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-600"><Check size={15} /> Got it</button></div><div className="flex justify-between"><button type="button" onClick={() => { setIndex((current) => Math.max(0, current - 1)); setFlipped(false); }} disabled={index === 0} className="inline-flex items-center gap-1 text-sm text-[var(--muted)] disabled:opacity-40"><ChevronLeft size={16} /> Previous</button><button type="button" onClick={next} className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">{complete ? "Complete deck" : "Next"} <ChevronRight size={16} /></button></div>{complete && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm text-emerald-600">Deck complete. Your review activity was recorded.</div>}<button type="button" onClick={() => { setCards([]); setKnown({}); setIndex(0); setFlipped(false); }} className="mx-auto inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"><RotateCcw size={15} /> Generate another deck</button></section>}
  </div></AppShell>;
}
