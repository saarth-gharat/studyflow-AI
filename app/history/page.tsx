"use client";

import { useEffect, useState } from "react";
import { Activity, BookOpen, MessageCircle, NotebookPen, PlayCircle, Route } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

const activityTypes = [
  { title: "Topics viewed", description: "Topics you open will be listed here.", icon: BookOpen },
  { title: "Notes generated", description: "Your generated notes activity will be listed here.", icon: NotebookPen },
  { title: "Tutor conversations", description: "Tutor sessions will be listed here.", icon: MessageCircle },
];

type ActivityRecord = {
  id: string;
  activity_type: string;
  subject: string;
  topic: string | null;
  title: string;
  created_at: string;
};

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/activity", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load learning history.");
        setActivities(data.activities ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load learning history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  function iconForActivity(type: string) {
    if (type === "video_view") return <PlayCircle size={17} />;
    if (type === "learning_path_generated") return <Route size={17} />;
    if (type === "tutor_session") return <MessageCircle size={17} />;
    return <BookOpen size={17} />;
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Personal library"
          title="Learning history"
          description="Pick up the thread from the subjects and tools you have used."
        />
        <section className="grid gap-4 md:grid-cols-3">
          {activityTypes.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-violet-600">
                <Icon size={18} />
              </div>
              <h2 className="mt-5 text-sm font-semibold text-[var(--text)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </section>
        {loading && <section aria-live="polite" className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-sm"><div className="h-5 w-48 animate-pulse rounded bg-[var(--panel-soft)]" /><div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--panel-soft)]" /></section>}
        {!loading && error && <section role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8"><h2 className="font-semibold text-red-600">Learning history is unavailable</h2><p className="mt-2 text-sm text-red-600/80">{error}</p></section>}
        {!loading && !error && activities.length === 0 && <EmptyState icon={<Activity size={19} />} title="Your learning activity will appear here" description="Open a topic or use a learning tool and meaningful activity will appear here." actionHref="/explore" actionLabel="Start learning" />}
        {!loading && !error && activities.length > 0 && <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-sm"><div className="divide-y divide-[var(--border)]">{activities.map((activity) => <div key={activity.id} className="flex gap-4 px-5 py-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-violet-600">{iconForActivity(activity.activity_type)}</div><div className="min-w-0"><p className="font-medium text-[var(--text)]">{activity.title}</p><p className="mt-1 text-sm text-[var(--muted)]">{activity.subject}{activity.topic ? ` · ${activity.topic}` : ""}</p><time className="mt-2 block text-xs text-[var(--muted)]" dateTime={activity.created_at}>{new Date(activity.created_at).toLocaleString()}</time></div></div>)}</div></section>}
      </div>
    </AppShell>
  );
}
