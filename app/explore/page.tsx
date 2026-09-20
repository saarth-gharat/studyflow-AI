"use client";

import { AppShell } from "@/components/app-shell";
import { Compass, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const topics = [
  { title: "Python", description: "Programming fundamentals, scripts, logic, and practical projects.", badge: "Beginner" },
  { title: "Data Structures", description: "Arrays, trees, graphs, queues, and algorithmic thinking.", badge: "Core" },
  { title: "JavaScript", description: "Modern frontend logic, DOM APIs, and browser fundamentals.", badge: "Popular" },
  { title: "Cybersecurity", description: "Security models, networking, and defensive fundamentals.", badge: "Intermediate" },
  { title: "Database Management", description: "Modeling, queries, and performance-focused data design.", badge: "Core" },
  { title: "Machine Learning", description: "Models, pipelines, evaluation, and applied AI concepts.", badge: "Advanced" },
];

export default function ExplorePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const clean = subject.trim();
    if (clean) router.push(`/learn/${encodeURIComponent(clean)}`);
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">Explore</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Find something new to learn.</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Search a subject and transform it into a focused learning workspace.</p>
        </section>

        <form onSubmit={submitSearch} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
              <Search size={17} className="text-[var(--muted)]" />
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Search a subject..."
                className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-[var(--text)] px-4 py-3 text-sm font-semibold text-[var(--bg)] transition hover:opacity-90">Explore</button>
          </div>
        </form>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={15} className="text-violet-600" />
            <h2 className="text-lg font-semibold">Popular subjects</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <button key={topic.title} type="button" onClick={() => router.push(`/learn/${encodeURIComponent(topic.title)}`)} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-500/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                    <Compass size={16} />
                  </div>
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-violet-600">{topic.badge}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{topic.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{topic.description}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
