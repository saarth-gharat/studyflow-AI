"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Bookmark, Clock3, Route } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

type LearningPath = { id: string; subject: string; title: string; description: string | null; learning_path_topics?: { id: string }[] };

export default function MyLearningPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPaths() {
      try {
        const response = await fetch("/api/learning-paths", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Learning paths are unavailable yet.");
        setPaths(data.paths ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Learning paths are unavailable yet.");
      } finally {
        setLoading(false);
      }
    }

    loadPaths();
  }, []);

  return <AppShell><div className="space-y-8"><PageHeader eyebrow="Workspace" title="My learning" description="Your learning activity, paths, and saved resources will appear here as you use StudyFlow." />
    {loading && <section aria-live="polite" className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-sm"><div className="h-5 w-48 animate-pulse rounded bg-[var(--panel-soft)]" /><div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--panel-soft)]" /></section>}
    {!loading && error && <section role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8"><h2 className="font-semibold text-red-600">Learning paths are unavailable</h2><p className="mt-2 text-sm text-red-600/80">{error}</p></section>}
    {!loading && !error && paths.length > 0 && <section className="grid gap-4 md:grid-cols-2">{paths.map((path) => <article key={path.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-violet-600"><Route size={18} /></div><p className="mt-5 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{path.subject}</p><h2 className="mt-2 font-semibold text-[var(--text)]">{path.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{path.description}</p><p className="mt-4 text-xs text-[var(--muted)]">{path.learning_path_topics?.length ?? 0} topics</p><Link href={`/learn/${encodeURIComponent(path.subject)}/path`} className="mt-5 inline-flex rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-violet-500">Open path</Link></article>)}</section>}
    {!loading && !error && paths.length === 0 && <div className="grid gap-5 lg:grid-cols-2"><EmptyState icon={<BookOpen size={19} />} title="You haven't started learning yet." description="Choose a subject to create a focused learning workspace with videos, notes, quizzes, a tutor, and an AI path." actionHref="/explore" actionLabel="Explore subjects" /><EmptyState icon={<Route size={19} />} title="No learning paths yet." description="Generate and save a subject-specific roadmap when you are ready to organize your learning." actionHref="/explore" actionLabel="Create a learning path" /></div>}
    <div className="grid gap-5 lg:grid-cols-2"><EmptyState icon={<Clock3 size={19} />} title="No recent activity." description="The topics and tools you open will be shown here once activity tracking is available." /><EmptyState icon={<Bookmark size={19} />} title="No saved resources yet." description="Saved videos, notes, and topics will appear in your personal library." /></div>
  </div></AppShell>;
}
