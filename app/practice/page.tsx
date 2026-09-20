"use client";

import Link from "next/link";
import { ChevronRight, Code2, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { displayMode, practiceDifficulties, practiceModes, recommendedModes, type PracticeMode, type PracticeSet } from "@/lib/practice";

function safeNumber(value: string) { return Number(value.replace(/[^0-9.+-]/g, "")); }

export default function PracticePage() {
  const [subject, setSubject] = useState("Python");
  const [topic, setTopic] = useState("Functions");
  const [difficulty, setDifficulty] = useState<(typeof practiceDifficulties)[number]>("beginner");
  const [mode, setMode] = useState<PracticeMode>("recommended");
  const [count, setCount] = useState(5);
  const [practice, setPractice] = useState<PracticeSet | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subject")) setSubject(params.get("subject") || "Python");
      if (params.get("topic")) setTopic(params.get("topic") || "Functions");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const availableModes = useMemo(() => recommendedModes(subject), [subject]);
  const question = practice?.questions[index];
  const isCode = question?.mode === "coding";

  async function generatePractice() {
    if (!subject.trim() || !topic.trim() || loading) return;
    setLoading(true); setError(""); setPractice(null); setIndex(0); setScore(0); setSubmitted(false); setAnswer("");
    try {
      const response = await fetch("/api/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, topic, difficulty, mode, count }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to create practice.");
      setPractice(data.practice);
      void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "practice_started", subject, topic, title: `Started practice for ${topic}`, metadata: { mode, difficulty, count } }) }).catch(() => undefined);
    } catch (generationError) { setError(generationError instanceof Error ? generationError.message : "Unable to create practice."); } finally { setLoading(false); }
  }

  function submitAnswer() {
    if (!question || submitted || !answer.trim()) return;
    let isCorrect: boolean | null = null;
    if (question.mode === "multiple_choice") isCorrect = answer === question.answer;
    else if (typeof question.numericAnswer === "number") isCorrect = Math.abs(safeNumber(answer) - question.numericAnswer) < 0.01;
    setCorrect(isCorrect); setSubmitted(true); if (isCorrect) setScore((current) => current + 1);
    void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "practice_question_answered", subject, topic, title: `Answered practice question for ${topic}`, metadata: { mode: question.mode, correct: isCorrect, questionNumber: index + 1 } }) }).catch(() => undefined);
  }

  function nextQuestion() {
    if (!practice || index >= practice.questions.length - 1) {
      void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "practice_completed", subject, topic, title: `Completed practice for ${topic}`, metadata: { score: score + (correct ? 1 : 0), total: practice?.questions.length || 0, mode: practice?.mode } }) }).catch(() => undefined);
      return;
    }
    setIndex((current) => current + 1); setAnswer(""); setSubmitted(false); setCorrect(null); setHintVisible(false);
  }

  const complete = practice && index === practice.questions.length - 1 && submitted;

  return <AppShell><div className="space-y-8"><PageHeader eyebrow="Universal practice" title="Practice Lab" description="Practice any subject with a format adapted to what you are learning." />
    {!practice && <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:p-8"><div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Calculus, Biology, Marketing..." className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Topic<input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Functions, Cell Structure, World War II..." className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500">{practiceDifficulties.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium">Questions<select value={count} onChange={(event) => setCount(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500"><option value={3}>3 questions</option><option value={5}>5 questions</option><option value={10}>10 questions</option></select></label></div><div className="mt-5"><p className="text-sm font-medium">Practice type</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => setMode("recommended")} className={`rounded-full border px-3 py-2 text-xs ${mode === "recommended" ? "border-violet-500 bg-violet-500 text-white" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)]"}`}>Recommended: {displayMode(availableModes[0])}</button>{practiceModes.filter((item) => item !== "recommended" && (item === "multiple_choice" || availableModes.includes(item))).map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-full border px-3 py-2 text-xs ${mode === item ? "border-violet-500 bg-violet-500 text-white" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)]"}`}>{displayMode(item)}</button>)}</div></div>{error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}<button type="button" onClick={() => void generatePractice()} disabled={loading || !subject.trim() || !topic.trim()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Sparkles size={16} />{loading ? "Creating practice..." : "Start practice"}</button></section>}
    {!practice && !loading && !error && <EmptyState icon={<Sparkles size={19} />} title="Choose something to practice" description="Enter any subject and topic. StudyFlow will adapt the questions to the way that subject is best practiced." />}
    {question && <section className="mx-auto w-full max-w-3xl space-y-5"><div className="flex items-center justify-between text-sm text-[var(--muted)]"><span>{practice?.subject} · {practice?.topic}</span><span>Question {index + 1} / {practice?.questions.length}</span></div><div className="h-2 rounded-full bg-[var(--panel-soft)]"><div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${((index + 1) / (practice?.questions.length || 1)) * 100}%` }} /></div><article className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600">{displayMode(question.mode)}</span><span className="text-xs text-[var(--muted)]">{practice?.difficulty}</span></div><h2 className="mt-6 text-2xl font-semibold leading-9">{question.question}</h2>{isCode && <><pre className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--text)]"><code>{question.starterCode || "// Starter code provided by StudyFlow"}</code></pre><p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700"><Code2 size={15} className="mr-2 inline" />Code execution is disabled because this project has no secure sandbox. Submit your reasoning or solution for review instead.</p></>}{question.options && <div className="mt-6 grid gap-3">{question.options.map((option) => <button key={option} type="button" onClick={() => setAnswer(option)} className={`rounded-xl border p-4 text-left text-sm transition ${answer === option ? "border-violet-500 bg-violet-500/10" : "border-[var(--border)] bg-[var(--panel-soft)] hover:border-violet-500/40"}`}>{option}</button>)}</div>}{!question.options && <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={question.numericAnswer !== undefined ? "Enter your numeric answer..." : "Write your answer..."} className="mt-6 min-h-32 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm outline-none focus:border-violet-500" />}{question.hint && <button type="button" onClick={() => setHintVisible((current) => !current)} className="mt-5 inline-flex items-center gap-2 text-sm text-violet-600"><Lightbulb size={15} />{hintVisible ? question.hint : "Get hint"}</button>}{submitted && <div className={`mt-6 rounded-2xl border p-4 ${correct === true ? "border-emerald-500/30 bg-emerald-500/10" : correct === false ? "border-red-500/30 bg-red-500/10" : "border-violet-500/20 bg-violet-500/10"}`}><p className="font-semibold">{correct === true ? "Correct" : correct === false ? "Needs another look" : "Submitted for practice"}</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{question.explanation}</p>{question.mode !== "multiple_choice" && question.numericAnswer === undefined && <p className="mt-2 text-xs text-[var(--muted)]">This response mode is practice-oriented; no perfect deterministic score is claimed.</p>}</div>}<div className="mt-7 flex flex-wrap justify-between gap-3"><button type="button" onClick={submitAnswer} disabled={submitted || !answer.trim()} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Submit answer</button>{submitted && <button type="button" onClick={nextQuestion} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2.5 text-sm font-medium">{complete ? "Finish practice" : "Next question"}<ChevronRight size={15} /></button>}</div></article>{complete && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"><h2 className="text-lg font-semibold">Practice complete</h2><p className="mt-2 text-sm text-[var(--muted)]">Recorded deterministic score: {score + (correct ? 1 : 0)} / {practice.questions.length}. AI-evaluated responses are not treated as exact scores.</p><button type="button" onClick={() => setPractice(null)} className="mt-4 inline-flex items-center gap-2 text-sm text-violet-600"><RotateCcw size={15} /> Try another set</button></div>}</section>}
    <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Back to dashboard</Link></div></AppShell>;
}
