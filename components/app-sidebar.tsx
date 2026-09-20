"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  Clock3,
  Compass,
  FolderOpen,
  CalendarDays,
  Brain,
  Layers3,
  FlaskConical,
  Home,
  LogOut,
  MessageSquareText,
  Globe2,
  Settings,
  Sparkles,
  Target,
  Video,
  ArrowRight,
  Check,
  Circle,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type StudyPoints = {
  totalPoints: number;
  todayPoints: number;
  dailyGoal: number;
  tasks: { key: string; label: string; points: number; completed: boolean }[];
};

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Explore", href: "/explore", icon: Compass },
      { name: "Study Planner", href: "/planner", icon: CalendarDays },
      { name: "Ask StudyFlow", href: "/doubts", icon: Brain },
      { name: "Practice Lab", href: "/practice", icon: FlaskConical },
    ],
  },
  {
    label: "Learn",
    items: [
      { name: "Videos", href: "/learn/Python/videos", icon: Video },
      { name: "AI Notes", href: "/learn/Python/notes", icon: BookOpen },
      { name: "AI Quiz", href: "/learn/Python/quiz", icon: Target },
      { name: "AI Tutor", href: "/learn/Python/tutor", icon: MessageSquareText },
      { name: "Learning Paths", href: "/learning", icon: FolderOpen },
      { name: "Flashcards", href: "/flashcards", icon: Layers3 },
      { name: "Web Resources", href: "/learn/Python/resources", icon: Globe2 },
    ],
  },
  {
    label: "My Learning",
    items: [
      { name: "Saved", href: "/saved", icon: Bookmark },
      { name: "History", href: "/history", icon: Clock3 },
      { name: "Progress", href: "/progress", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
];

export function AppSidebar({ mobileOpen = false, onClose = () => {} }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null }>({ full_name: null, email: null });
  const [prompt, setPrompt] = useState("");
  const [studyPoints, setStudyPoints] = useState<StudyPoints | null>(null);
  const subjectContext = pathname.match(/^\/learn\/([^/]+)/)?.[1] ? decodeURIComponent(pathname.match(/^\/learn\/([^/]+)/)?.[1] || "") : "";

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userData.user.id)
        .maybeSingle();
      setProfile({
        full_name: data?.full_name ?? null,
        email: userData.user.email ?? null,
      });
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    fetch("/api/study-points", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.success) setStudyPoints(data);
      })
      .catch(() => undefined);
  }, [pathname]);

  function submitPrompt(event: React.FormEvent) {
    event.preventDefault();
    const clean = prompt.trim();
    if (!clean) return;
    const looksLikeQuestion = /^(explain|teach|help|what|why|how|quiz me)/i.test(clean) || clean.endsWith("?") || clean.split(/\s+/).length > 4;
    if (looksLikeQuestion) {
      const subject = subjectContext || "General learning";
      router.push(`/doubts?subject=${encodeURIComponent(subject)}&question=${encodeURIComponent(clean)}`);
    } else {
      router.push(`/learn/${encodeURIComponent(clean)}`);
    }
    setPrompt("");
    onClose();
  }

  function handleSuggestion(suggestion: string) {
    if (suggestion === "Learn something new") router.push("/explore");
    else if (suggestion === "Quiz me" && subjectContext) router.push(`/learn/${encodeURIComponent(subjectContext)}/quiz`);
    else router.push(`/doubts?subject=${encodeURIComponent(subjectContext || "General learning")}&question=${encodeURIComponent("Explain a useful concept to me")}`);
    onClose();
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    onClose();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      {mobileOpen && <button aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-30 bg-zinc-950/35 backdrop-blur-[1px] lg:hidden" />}
      <aside className={`sidebar-surface fixed inset-y-0 left-0 z-40 w-72 border-r border-[var(--border)] bg-[var(--panel)] transition-transform duration-200 ease-out lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex h-20 items-center border-b border-[var(--border)] px-5">
            <Link onClick={onClose} href="/" className="flex items-center gap-3 font-semibold tracking-tight text-[var(--text)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm shadow-violet-500/25">
                <Sparkles size={15} />
              </div>
              <div>
                <div className="text-base">StudyFlow <span className="text-violet-500">AI</span></div>
              </div>
            </Link>
          </div>

          <div className="border-b border-[var(--border)] px-3 py-4">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-600"><Sparkles size={14} /> What do you want to learn?</div>
              <form onSubmit={submitPrompt} className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={subjectContext ? `Ask about ${subjectContext}` : "Ask anything..."} aria-label="What do you want to learn?" className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)]" />
                <button type="submit" aria-label="Start learning" className="text-violet-600 transition hover:translate-x-0.5 disabled:opacity-40" disabled={!prompt.trim()}><ArrowRight size={15} /></button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Learn something new", "Explain a topic", "Quiz me"].map((suggestion) => <button key={suggestion} type="button" onClick={() => handleSuggestion(suggestion)} className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--muted)] transition hover:border-violet-500/30 hover:text-violet-600">{suggestion}</button>)}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-7 last:mb-0">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {group.label}
                </p>

                <nav className="mt-3 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-[var(--accent-soft)] text-violet-600 shadow-sm"
                            : "text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
                        }`}
                      >
                        <Icon size={17} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}

            <section className="mx-1 mt-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-3">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Today</p><span className="flex items-center gap-1 text-xs font-semibold text-violet-600"><Star size={12} fill="currentColor" /> {studyPoints?.todayPoints ?? 0} / {studyPoints?.dailyGoal ?? 35}</span></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${Math.min(((studyPoints?.todayPoints ?? 0) / (studyPoints?.dailyGoal ?? 35)) * 100, 100)}%` }} /></div>
              <div className="mt-3 space-y-2">
                {(studyPoints?.tasks ?? [{ key: "loading", label: "Loading today’s tasks", points: 0, completed: false }]).map((task) => <div key={task.key} className="flex items-center gap-2 text-xs"><span className={task.completed ? "text-emerald-500" : "text-[var(--muted)]"}>{task.completed ? <Check size={13} /> : <Circle size={11} />}</span><span className={task.completed ? "text-[var(--muted)] line-through" : "text-[var(--text)]"}>{task.label}</span><span className="ml-auto text-[10px] text-[var(--muted)]">+{task.points}</span></div>)}
              </div>
            </section>
          </div>

          <div className="border-t border-[var(--border)] p-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white">
                    {(profile.full_name || profile.email || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">{profile.full_name || "Learner"}</p>
                    <p className="truncate text-[11px] text-[var(--muted)]">{profile.email || "No email available"}</p>
                  </div>
                </div>
                <button type="button" onClick={handleLogout} aria-label="Log out" className="text-[var(--muted)] transition hover:text-[var(--text)]">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
