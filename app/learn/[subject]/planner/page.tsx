"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Topic = {
  name: string;
  description: string;
  minutes: number;
};

type StudyDay = {
  day: number;
  title: string;
  goal: string;
  estimatedHours: number;
  topics: Topic[];
  practice: string[];
  completed: boolean;
};

type StudyPlan = {
  title: string;
  description: string;
  subject: string;
  level: string;
  duration: number;
  hoursPerDay: number;
  goal: string;
  days: StudyDay[];
};

export default function PlannerPage() {
  const params = useParams();

  const subject = decodeURIComponent(
    String(params.subject || "")
  );

  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState(30);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [goal, setGoal] = useState("");

  const [plan, setPlan] = useState<StudyPlan | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [completedDays, setCompletedDays] = useState<
    number[]
  >([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const saved = localStorage.getItem(
        `studyflow-planner-${subject}`
      );

      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);

        if (parsed.plan) setPlan(parsed.plan);
        if (parsed.completedDays) setCompletedDays(parsed.completedDays);
      } catch {
        console.log("No saved planner data.");
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [subject]);

  function saveProgress(
    currentPlan: StudyPlan | null,
    currentCompletedDays: number[]
  ) {
    localStorage.setItem(
      `studyflow-planner-${subject}`,
      JSON.stringify({
        plan: currentPlan,
        completedDays: currentCompletedDays,
      })
    );
  }

  async function generatePlan() {
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          level,
          duration,
          hoursPerDay,
          goal:
            goal.trim() ||
            `Learn ${subject} from ${level} level`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate study plan."
        );
      }

      if (!data.plan) {
        throw new Error(
          "The AI did not return a study plan."
        );
      }

      setPlan(data.plan);

      setCompletedDays([]);

      saveProgress(data.plan, []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(dayNumber: number) {
    let updated: number[];

    if (completedDays.includes(dayNumber)) {
      updated = completedDays.filter(
        (day) => day !== dayNumber
      );
    } else {
      updated = [...completedDays, dayNumber];
    }

    setCompletedDays(updated);

    saveProgress(plan, updated);
  }

  function getProgress() {
    if (!plan || plan.days.length === 0) {
      return 0;
    }

    return Math.round(
      (completedDays.length / plan.days.length) * 100
    );
  }

  return (
    <main className="min-h-screen bg-[#07080d] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#07080d]/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>

            <p className="text-xs font-bold tracking-[0.3em] text-violet-400">
              STUDYFLOW AI
            </p>

            <h1 className="mt-1 text-sm font-semibold">
              AI Study Planner
            </h1>

          </div>

          <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-300">
            📅 Personalized Learning
          </div>

        </div>

      </header>


      {/* MAIN */}

      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* TITLE */}

        <div className="max-w-3xl">

          <div className="mb-5 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            ✨ AI Generated Roadmap
          </div>

          <h2 className="text-4xl font-black tracking-tight md:text-6xl">

            Master{" "}

            <span className="text-violet-400">
              {subject}
            </span>

          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Tell StudyFlow how you want to learn and
            AI will create a personalized study roadmap
            for you.
          </p>

        </div>


        {/* SETUP CARD */}

        {!plan && (

          <div className="mt-12 max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-7 md:p-9">

            <div className="grid gap-7 md:grid-cols-2">

              {/* LEVEL */}

              <div>

                <label className="mb-3 block text-sm font-semibold text-[var(--text)]">
                  Your level
                </label>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-[var(--text)] outline-none focus:border-violet-500"
                >

                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>

                </select>

              </div>


              {/* DURATION */}

              <div>

                <label className="mb-3 block text-sm font-semibold text-[var(--text)]">
                  Study duration
                </label>

                <select
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-[var(--text)] outline-none focus:border-violet-500"
                >

                  <option value={7}>
                    7 days
                  </option>

                  <option value={14}>
                    14 days
                  </option>

                  <option value={30}>
                    30 days
                  </option>

                  <option value={60}>
                    60 days
                  </option>

                  <option value={90}>
                    90 days
                  </option>

                </select>

              </div>


              {/* HOURS */}

              <div>

                <label className="mb-3 block text-sm font-semibold text-[var(--text)]">
                  Study time per day
                </label>

                <select
                  value={hoursPerDay}
                  onChange={(e) =>
                    setHoursPerDay(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-[var(--text)] outline-none focus:border-violet-500"
                >

                  <option value={1}>
                    1 hour
                  </option>

                  <option value={2}>
                    2 hours
                  </option>

                  <option value={3}>
                    3 hours
                  </option>

                  <option value={4}>
                    4 hours
                  </option>

                  <option value={5}>
                    5+ hours
                  </option>

                </select>

              </div>


              {/* GOAL */}

              <div>

                <label className="mb-3 block text-sm font-semibold text-[var(--text)]">
                  Your goal
                </label>

                <input
                  value={goal}
                  onChange={(e) =>
                    setGoal(e.target.value)
                  }
                  placeholder={`Example: Learn ${subject} for my exams`}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-violet-500"
                />

              </div>

            </div>


            {/* BUTTON */}

            <button
              type="button"
              onClick={generatePlan}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <span>
                  ✨ AI is building your roadmap...
                </span>
              ) : (
                <span>
                  🚀 Generate My Study Plan
                </span>
              )}

            </button>


            {/* ERROR */}

            {error && (

              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                ⚠️ {error}
              </div>

            )}

          </div>

        )}


        {/* PLAN */}

        {plan && (

          <div className="mt-12">

            {/* PLAN HEADER */}

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-7 md:p-9">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                      {plan.level}
                    </span>

                    <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)]">
                      {plan.duration} days
                    </span>

                    <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)]">
                      {plan.hoursPerDay}h / day
                    </span>

                  </div>

                  <h3 className="mt-4 text-3xl font-bold">
                    {plan.title}
                  </h3>

                  <p className="mt-3 max-w-2xl leading-7 text-gray-500">
                    {plan.description}
                  </p>

                </div>


                {/* PROGRESS */}

                <div className="min-w-[180px]">

                  <div className="flex justify-between text-sm">

                    <span className="text-[var(--muted)]">
                      Progress
                    </span>

                    <span className="font-semibold text-violet-400">
                      {getProgress()}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--panel-soft)]">

                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-500"
                      style={{
                        width: `${getProgress()}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {completedDays.length} of{" "}
                    {plan.days.length} days completed
                  </p>

                </div>

              </div>

            </div>


            {/* DAYS */}

            <div className="mt-8 space-y-5">

              {plan.days.map((day) => {

                const completed =
                  completedDays.includes(day.day);

                return (

                  <div
                    key={day.day}
                    className={`rounded-3xl border p-6 transition ${
                      completed
                        ? "border-green-500/20 bg-green-500/[0.03]"
                        : "border-[var(--border)] bg-[var(--panel)]"
                    }`}
                  >

                    {/* DAY TOP */}

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      <div className="flex gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
                            completed
                              ? "bg-green-500/10 text-green-400"
                              : "bg-violet-500/10 text-violet-400"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : day.day}
                        </div>

                        <div>

                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                            DAY {day.day}
                          </p>

                          <h4 className="mt-1 text-xl font-bold">
                            {day.title}
                          </h4>

                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {day.goal}
                          </p>

                        </div>

                      </div>


                      <div className="text-sm text-[var(--muted)]">
                        ⏱️ {day.estimatedHours} hours
                      </div>

                    </div>


                    {/* TOPICS */}

                    <div className="mt-6 grid gap-3 md:grid-cols-2">

                      {day.topics.map(
                        (topic, index) => (

                          <div
                            key={index}
                            className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <h5 className="font-semibold">
                                {topic.name}
                              </h5>

                              <span className="shrink-0 text-xs text-violet-400">
                                {topic.minutes} min
                              </span>

                            </div>

                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                              {topic.description}
                            </p>

                          </div>

                        )
                      )}

                    </div>


                    {/* PRACTICE */}

                    {day.practice &&
                      day.practice.length > 0 && (

                        <div className="mt-6">

                          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                            Practice
                          </p>

                          <div className="space-y-2">

                            {day.practice.map(
                              (item, index) => (

                                <div
                                  key={index}
                                  className="flex gap-3 text-sm text-[var(--muted)]"
                                >

                                  <span className="text-violet-400">
                                    →
                                  </span>

                                  <span>
                                    {item}
                                  </span>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )}


                    {/* COMPLETE */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleDay(day.day)
                      }
                      className={`mt-6 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        completed
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-[var(--panel-soft)] text-[var(--text)] hover:bg-violet-500/10 hover:text-violet-300"
                      }`}
                    >

                      {completed
                        ? "✓ Day Completed"
                        : "Mark Day Complete"}

                    </button>

                  </div>

                );
              })}

            </div>


            {/* RESET */}

            <div className="mt-10 text-center">

              <button
                type="button"
                onClick={() => {
                  setPlan(null);
                  setCompletedDays([]);

                  localStorage.removeItem(
                    `studyflow-planner-${subject}`
                  );
                }}
                className="text-sm text-[var(--muted)] transition hover:text-red-400"
              >
                ↻ Create a new study plan
              </button>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}