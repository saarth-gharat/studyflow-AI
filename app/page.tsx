"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, Compass, PlayCircle, Sparkles, Target, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const subjects = ["Python", "JavaScript", "Data Structures", "Cybersecurity", "Machine Learning"];

export default function HomePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("Python");

  function exploreSubject() {
    const clean = subject.trim();
    if (clean) router.push(`/learn/${encodeURIComponent(clean)}`);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm shadow-violet-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-base font-semibold">StudyFlow <span className="text-violet-500">AI</span></div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">Learn smarter</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
            <a href="#features" className="transition hover:text-[var(--text)]">Features</a>
            <a href="#tools" className="transition hover:text-[var(--text)]">Tools</a>
            <a href="#how-it-works" className="transition hover:text-[var(--text)]">How it works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)] sm:inline-flex">Log in</Link>
            <Link href="/auth/signup" className="inline-flex items-center rounded-xl bg-[var(--text)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:opacity-90">Start learning</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-600">
              <Sparkles size={15} />
              AI-powered learning companion
            </div>

            <h1 className="mt-8 text-5xl font-black tracking-[-0.06em] text-[var(--text)] sm:text-6xl lg:text-7xl">
              Study smarter.
              <span className="block bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">Learn faster.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Your AI-powered learning companion for videos, notes, quizzes, learning paths, and personalized tutoring.
            </p>

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-violet-500/20 bg-[var(--panel)] p-2 shadow-lg shadow-violet-500/10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
                  <Compass size={17} className="text-[var(--muted)]" />
                  <input
                    aria-label="Subject search"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") exploreSubject();
                    }}
                    placeholder="What do you want to learn?"
                    className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                  />
                </div>
                <button type="button" onClick={exploreSubject} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--text)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition hover:opacity-90">
                  Start Learning
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--muted)]">
                <span>Popular:</span>
                {subjects.map((name) => (
                  <button key={name} type="button" onClick={() => router.push(`/learn/${encodeURIComponent(name)}`)} className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 transition hover:border-violet-500/30 hover:text-violet-600">
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--muted)]">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Videos</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Notes</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Quizzes</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Tutor</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Everything you need to learn with clarity</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: PlayCircle, title: "Curated videos", description: "Learn from focused YouTube resources matched to your subject." },
            { icon: BookOpenText, title: "AI notes", description: "Turn complex topics into structured, readable study guides." },
            { icon: Target, title: "Practice quizzes", description: "Test understanding and keep progress visible as you learn." },
            { icon: Wand2, title: "AI tutor", description: "Ask questions and get explanations tailored to the topic." },
          ].map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-500/30">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <Icon size={18} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="tools" className="border-y border-[var(--border)] bg-[var(--panel)]/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-3 sm:px-6 lg:px-8">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">A learning flow designed for focus</h2>
          </div>
          <div className="space-y-4">
            {[
              "Pick a subject or explore a topic you want to learn.",
              "Use the right learning tool for your stage—video, notes, quiz, or tutor.",
              "Keep going with a roadmap, saved content, and your learning history.",
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-600">{index + 1}</div>
                <p className="text-sm leading-6 text-[var(--muted)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Why StudyFlow</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Built for real learning momentum</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">StudyFlow blends AI guidance with personal progress so you can move from discovery to practice to mastery in one place.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/signup" className="inline-flex items-center rounded-xl bg-[var(--text)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">Create account</Link>
            <Link href="/explore" className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3 text-sm font-semibold">Explore subjects</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--muted)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="font-semibold text-[var(--text)]">StudyFlow AI</div>
          <div>Keep learning. Stay curious.</div>
        </div>
      </footer>
    </main>
  );
}
