"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Topic = { title: string; description: string; order: number };
type SavedTopic = { title: string; description: string | null; order_index: number };
type SavedPath = { subject: string; learning_path_topics?: SavedTopic[] };

export default function LearningPathPage() {
  const params = useParams();
  const subject = decodeURIComponent(String(params?.subject || "Subject"));
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function loadSavedPath() {
      try {
        const response = await fetch("/api/learning-paths", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) return;
        const savedPath = (data.paths as SavedPath[] | undefined)?.find(
          (path) => path.subject.toLowerCase() === subject.toLowerCase(),
        );
        if (!savedPath?.learning_path_topics?.length) return;
        setTopics(savedPath.learning_path_topics.map((topic) => ({
          title: topic.title,
          description: topic.description || "",
          order: topic.order_index,
        })));
        setSaved(true);
      } catch {
        // The generation state remains available when persistence is unavailable.
      }
    }

    void loadSavedPath();
  }, [subject]);

  async function generatePath() {
    setLoading(true);
    setError("");
    setSaveError("");
    setSaved(false);
    try {
      const response = await fetch("/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.topics)) throw new Error("generation failed");
      setTopics(data.topics);
      void fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: "learning_path_generated",
          subject,
          title: `${subject} learning path generated`,
        }),
      }).catch(() => undefined);
    } catch {
      setError("Unable to create your learning path right now.");
    } finally {
      setLoading(false);
    }
  }

  async function savePath() {
    if (!topics.length || saving || saved) return;
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topics }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        setSaveError(data?.error || "Unable to save this learning path.");
        return;
      }
      setSaved(true);
    } catch {
      setSaveError("Unable to save this learning path. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
          <Link href={`/learn/${encodeURIComponent(subject)}`} className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            Back to {subject}
          </Link>
          <button type="button" onClick={generatePath} disabled={loading} className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50">
            {topics.length ? "Regenerate path" : "Generate path"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">AI learning path</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">Your {subject} learning path</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">Generate a structured, subject-specific roadmap and open the learning tools for each step.</p>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-6">
        {!loading && !topics.length && !error && (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-8 text-center">
            <h2 className="text-xl font-bold text-[var(--text)]">Build your personalized roadmap</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">StudyFlow will organize {subject} from fundamentals to advanced practice.</p>
            <button type="button" onClick={generatePath} className="mt-7 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500">Build learning path</button>
          </div>
        )}

        {loading && <div aria-live="polite" className="space-y-5"><p className="mb-6 text-center text-sm text-violet-300">Building your learning path...</p>{[1, 2, 3, 4].map((item) => <div key={item} className="animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-7"><div className="h-4 w-16 rounded bg-[var(--border)]" /><div className="mt-5 h-6 w-1/2 rounded bg-[var(--border)]" /><div className="mt-4 h-4 w-3/4 rounded bg-[var(--border)]" /></div>)}</div>}

        {error && <div role="alert" className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center"><h2 className="text-xl font-bold text-red-300">{error}</h2><button type="button" onClick={generatePath} className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500">Try again</button></div>}

        {!loading && topics.length > 0 && (
          <div>
            <div className="mb-6 flex flex-col items-end gap-2">
              <button type="button" onClick={savePath} disabled={saving || saved} className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 disabled:opacity-60">{saving ? "Saving..." : saved ? "Path saved" : "Save learning path"}</button>
              {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
            </div>

            <div className="space-y-5">
              {topics.map((topic, index) => {
                const topicSubject = `${subject} ${topic.title}`;
                return (
                  <article key={`${topic.order}-${topic.title}`} className="relative rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-6 sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">Step {String(index + 1).padStart(2, "0")}</span>
                        <h2 className="mt-4 text-xl font-bold text-[var(--text)]">{topic.title}</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{topic.description}</p>
                      </div>
                      <Link href={`/learn/${encodeURIComponent(topicSubject)}`} className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500">Start learning</Link>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5 text-xs">
                      <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel)]" href={`/learn/${encodeURIComponent(topicSubject)}/videos`}>Videos</Link>
                      <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel)]" href={`/learn/${encodeURIComponent(topicSubject)}/notes`}>AI notes</Link>
                      <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel)]" href={`/learn/${encodeURIComponent(topicSubject)}/quiz`}>AI quiz</Link>
                      <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel)]" href={`/learn/${encodeURIComponent(topicSubject)}/tutor`}>AI tutor</Link>
                      <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel)]" href={`/practice?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic.title)}`}>Practice</Link>
                      <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel)]" href={`/learn/${encodeURIComponent(topicSubject)}/resources?topic=${encodeURIComponent(topic.title)}`}>Web resources</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
