"use client";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Brain, Compass, FileText, FlaskConical, FolderOpen, Globe2, Layers3, MessageSquareText, PlayCircle, Sparkles, Target, CalendarDays, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = { full_name: string | null; avatar_url: string | null };
type LearningInsights = {
  continuation: { subject: string; topic?: string; title: string; description: string; progress: number | null; lastActivity?: string; href: string } | null;
  companion: { title: string; message: string; reason: string; primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryHref?: string } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/auth/login");
        return;
      }

      setEmail(userData.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile(data ?? null);
      setLoading(false);
    }

    void loadDashboard();
  }, [router]);

  useEffect(() => {
    fetch("/api/learning-insights", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load learning recommendations.");
        setInsights(data);
      })
      .catch((loadError) => setInsightsError(loadError instanceof Error ? loadError.message : "Unable to load learning recommendations."))
      .finally(() => setInsightsLoading(false));
  }, []);

  const name = profile?.full_name?.trim() || email.split("@")[0] || "Welcome back";

  const tools = [
    { title: "Videos", description: "Learn from curated YouTube content.", icon: PlayCircle, href: "/explore" },
    { title: "AI Notes", description: "Generate clear study notes.", icon: FileText, href: "/explore" },
    { title: "AI Quiz", description: "Practice with subject-specific questions.", icon: Target, href: "/explore" },
    { title: "AI Tutor", description: "Ask anything about your subject.", icon: MessageSquareText, href: "/explore" },
    { title: "Learning Paths", description: "Follow a structured roadmap.", icon: FolderOpen, href: "/learning" },
    { title: "Web Resources", description: "Learn from trusted websites.", icon: Globe2, href: "/learn/Python/resources" },
    { title: "Study Planner", description: "Turn a goal into a schedule.", icon: CalendarDays, href: "/planner" },
    { title: "Ask StudyFlow", description: "Get unstuck with a clear explanation.", icon: Brain, href: "/doubts" },
    { title: "Flashcards", description: "Revise with active recall.", icon: Layers3, href: "/flashcards" },
    { title: "Analytics", description: "Review real learning activity.", icon: BarChart3, href: "/progress" },
    { title: "Practice Lab", description: "Practice any subject.", icon: FlaskConical, href: "/practice" },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500" />
          <p className="mt-4 text-sm font-medium text-[var(--muted)]">Loading your learning workspace…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Good to see you 👋</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">{name === "Welcome back" ? "Welcome back" : `${name}`}. Continue your learning journey.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-600">
              <Sparkles size={16} />
              Learning workspace
            </div>
          </div>
        </section>

        {insightsLoading && <section aria-live="polite" className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><div className="h-4 w-40 animate-pulse rounded bg-[var(--panel-soft)]" /><div className="mt-4 h-6 w-64 animate-pulse rounded bg-[var(--panel-soft)]" /></section>}
        {!insightsLoading && insightsError && <section role="alert" className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5"><p className="text-sm text-red-600">{insightsError}</p></section>}
        {!insightsLoading && !insightsError && insights?.continuation && <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-[var(--panel)] to-[var(--panel)] p-6 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Continue learning</p><h2 className="mt-2 text-2xl font-semibold">{insights.continuation.subject}{insights.continuation.topic ? ` · ${insights.continuation.topic}` : ""}</h2><p className="mt-2 text-sm text-[var(--muted)]">{insights.continuation.description}</p>{insights.continuation.lastActivity && <p className="mt-3 text-xs text-[var(--muted)]">Last activity: {insights.continuation.lastActivity}</p>}{insights.continuation.progress !== null && <div className="mt-4 max-w-sm"><div className="flex justify-between text-xs text-[var(--muted)]"><span>Latest recorded quiz score</span><span>{insights.continuation.progress}%</span></div><div className="mt-2 h-2 rounded-full bg-[var(--panel-soft)]"><div className="h-full rounded-full bg-violet-500" style={{ width: `${insights.continuation.progress}%` }} /></div></div>}</div><button type="button" onClick={() => router.push(insights.continuation?.href || "/explore")} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500">Continue</button></div></section>}
        {!insightsLoading && !insightsError && insights?.companion && <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><Sparkles size={16} className="text-violet-600" /><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">AI learning companion</p></div><h2 className="mt-3 text-xl font-semibold">{insights.companion.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{insights.companion.message}</p><p className="mt-2 text-sm leading-6 text-[var(--text)]">{insights.companion.reason}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => router.push(insights.companion?.primaryHref || "/explore")} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">{insights.companion.primaryLabel}</button>{insights.companion.secondaryHref && insights.companion.secondaryLabel && <button type="button" onClick={() => router.push(insights.companion?.secondaryHref || "/explore")} className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2.5 text-sm font-medium text-[var(--text)]">{insights.companion.secondaryLabel}</button>}</div></div></section>}
        {!insightsLoading && !insightsError && insights && !insights.continuation && !insights.companion && <EmptyState icon={<Compass size={18} />} title="Start learning to unlock recommendations" description="Your next-step suggestions will appear after you create real learning activity." actionHref="/explore" actionLabel="Explore subjects" />}

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Quick start</p>
              <h2 className="mt-2 text-xl font-semibold">What do you want to learn?</h2>
            </div>
            <button type="button" onClick={() => router.push("/explore")} className="inline-flex items-center justify-center rounded-xl bg-[var(--text)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:opacity-90">Explore subjects</button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map(({ title, description, icon: Icon, href }) => (
            <button key={title} type="button" onClick={() => router.push(href)} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-500/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                <Icon size={18} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-violet-600">Open tool →</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <EmptyState icon={<BookOpen size={18} />} title="No learning activity yet." description="Open a subject, watch a video, or generate notes to start building your learning activity." actionHref="/explore" actionLabel="Explore Learning" />
          <EmptyState icon={<Compass size={18} />} title="No saved resources yet." description="Save videos, notes, and paths you want to revisit later." actionHref="/saved" actionLabel="View saved" />
        </div>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Profile</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
              {(profile?.full_name || email || "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-semibold">{profile?.full_name || "Learner"}</p>
              <p className="text-sm text-[var(--muted)]">{email || "No profile email available"}</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
