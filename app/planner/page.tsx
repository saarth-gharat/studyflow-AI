"use client";

import { CalendarDays, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

type PlanTopic = { name: string; description: string; minutes: number };
type StudyDay = { day: number; title: string; goal: string; estimatedHours: number; topics: PlanTopic[]; practice: string[] };
type StudyPlan = { title: string; description: string; subject: string; level: string; duration: number; hoursPerDay: number; goal: string; days: StudyDay[] };
type SavedPlanner = { plan: StudyPlan; completedDays: number[]; targetDate: string; preferredDays: string[] };

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PlannerPage() {
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState(30);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [targetDate, setTargetDate] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>(days);
  const [saved, setSaved] = useState<SavedPlanner | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = localStorage.getItem("studyflow-planner-global");
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as SavedPlanner;
        if (parsed.plan?.days?.length) {
          setSaved(parsed);
          setSubject(parsed.plan.subject);
          setGoal(parsed.plan.goal);
          setCompletedDays(parsed.completedDays || []);
          setTargetDate(parsed.targetDate || "");
          setPreferredDays(parsed.preferredDays || days);
        }
      } catch {
        localStorage.removeItem("studyflow-planner-global");
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function persist(nextPlan: StudyPlan, nextCompleted: number[]) {
    const next = { plan: nextPlan, completedDays: nextCompleted, targetDate, preferredDays };
    localStorage.setItem("studyflow-planner-global", JSON.stringify(next));
    setSaved(next);
  }

  async function generatePlan() {
    if (!subject.trim() || !goal.trim()) {
      setError("Add a subject and learning goal first.");
      return;
    }
    if (preferredDays.length === 0) {
      setError("Choose at least one preferred study day.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: subject.trim(), goal: goal.trim(), level, duration, hoursPerDay, targetDate, preferredDays }) });
      const data = await response.json();
      if (!response.ok || !data.success || !data.plan?.days?.length) throw new Error(data.error || "The AI returned no study plan.");
      persist(data.plan as StudyPlan, []);
      void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "planner_created", subject: subject.trim(), title: `${subject.trim()} study plan created`, metadata: { duration, hoursPerDay } }) }).catch(() => undefined);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to create a study plan.");
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(day: number) {
    if (!saved) return;
    const next = completedDays.includes(day) ? completedDays.filter((item) => item !== day) : [...completedDays, day];
    setCompletedDays(next);
    persist(saved.plan, next);
    if (!completedDays.includes(day)) void fetch("/api/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType: "planner_day_completed", subject: saved.plan.subject, topic: saved.plan.days.find((item) => item.day === day)?.title, title: `Completed day ${day} of ${saved.plan.title}` }) }).catch(() => undefined);
  }

  function togglePreferredDay(day: string) {
    setPreferredDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  const plan = saved?.plan;
  const progress = plan ? Math.round((completedDays.length / plan.days.length) * 100) : 0;

  return <AppShell><div className="space-y-8"><PageHeader eyebrow="Workspace" title="AI study planner" description="Turn a goal into a realistic study schedule, then mark each study day complete as you go." />
    {!plan && <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:p-8"><div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-medium">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Python" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Learning goal<input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Learn Python for my exam" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Skill level<select value={level} onChange={(event) => setLevel(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="text-sm font-medium">Target date<input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500" /></label><label className="text-sm font-medium">Duration<select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500"><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option><option value={60}>60 days</option></select></label><label className="text-sm font-medium">Study time per day<select value={hoursPerDay} onChange={(event) => setHoursPerDay(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-violet-500"><option value={1}>1 hour</option><option value={2}>2 hours</option><option value={3}>3 hours</option><option value={4}>4 hours</option></select></label></div><div className="mt-5"><p className="text-sm font-medium">Preferred study days</p><div className="mt-2 flex flex-wrap gap-2">{days.map((day) => <button key={day} type="button" onClick={() => togglePreferredDay(day)} className={`rounded-full border px-3 py-2 text-xs ${preferredDays.includes(day) ? "border-violet-500 bg-violet-500 text-white" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)]"}`}>{day}</button>)}</div></div>{error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}<button type="button" onClick={generatePlan} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Sparkles size={16} />{loading ? "Generating study plan..." : "Generate study plan"}</button></section>}
    {!plan && !loading && !error && <EmptyState icon={<CalendarDays size={19} />} title="No study plan yet" description="Create a personalized plan to organize your next learning goal." />}
    {plan && <section className="space-y-5"><div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">{plan.subject}</p><h2 className="mt-2 text-2xl font-semibold">{plan.title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{plan.description}</p></div><div className="flex gap-3 text-sm text-[var(--muted)]"><span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {plan.duration} days</span><span className="inline-flex items-center gap-1"><Clock3 size={15} /> {plan.hoursPerDay}h/day</span></div></div><div className="mt-6"><div className="flex justify-between text-xs text-[var(--muted)]"><span>Plan progress</span><span>{progress}%</span></div><div className="mt-2 h-2 rounded-full bg-[var(--panel-soft)]"><div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} /></div></div></div><div className="grid gap-4 lg:grid-cols-2">{plan.days.map((day) => { const complete = completedDays.includes(day.day); return <article key={day.day} className={`rounded-2xl border p-5 ${complete ? "border-emerald-500/30 bg-emerald-500/5" : "border-[var(--border)] bg-[var(--panel)]"}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Day {day.day}</p><h3 className="mt-2 text-lg font-semibold">{day.title}</h3><p className="mt-1 text-sm text-[var(--muted)]">{day.goal}</p></div><button type="button" onClick={() => toggleDay(day.day)} aria-label={`${complete ? "Uncomplete" : "Complete"} day ${day.day}`} className="text-emerald-600">{complete ? <CheckCircle2 size={22} /> : <span className="block h-5 w-5 rounded-full border-2 border-[var(--border)]" />}</button></div><div className="mt-4 space-y-2">{day.topics.slice(0, 4).map((topic) => <div key={topic.name} className="rounded-xl bg-[var(--panel-soft)] p-3"><div className="flex justify-between gap-3 text-sm"><span className="font-medium">{topic.name}</span><span className="text-xs text-[var(--muted)]">{topic.minutes} min</span></div><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{topic.description}</p></div>)}</div></article>; })}</div><button type="button" onClick={() => { setSaved(null); setCompletedDays([]); localStorage.removeItem("studyflow-planner-global"); }} className="text-sm text-[var(--muted)] hover:text-red-500">Create a new plan</button></section>}
  </div></AppShell>;
}
