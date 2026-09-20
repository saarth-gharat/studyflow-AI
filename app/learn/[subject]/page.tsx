"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const learningCards = [
  {
    title: "Videos",
    description:
      "Watch curated YouTube lessons and learn from experienced instructors.",
    icon: "🎥",
    href: "videos",
    label: "Watch Lessons",
  },
  {
    title: "AI Notes",
    description:
      "Generate detailed study notes specifically for the subject you're learning.",
    icon: "📝",
    href: "notes",
    label: "Open Notes",
  },
  {
    title: "AI Quiz",
    description:
      "Test your knowledge with AI-generated questions based on your subject.",
    icon: "🧠",
    href: "quiz",
    label: "Take Quiz",
  },
  {
    title: "AI Tutor",
    description:
      "Ask questions and have a conversation with your personal AI teacher.",
    icon: "🤖",
    href: "tutor",
    label: "Ask AI",
  },
  {
    title: "Web Resources",
    description:
      "Open trusted documentation, tutorials, courses, and practice material.",
    icon: "🌐",
    href: "resources",
    label: "Explore Resources",
  },
  {
    title: "Flashcards",
    description: "Turn a topic into active recall practice.",
    icon: "🃏",
    href: "/flashcards",
    label: "Review Cards",
  },
];

const roadmap = [
  {
    number: "01",
    title: "Understand the Basics",
    description:
      "Build a strong foundation before moving into advanced concepts.",
  },
  {
    number: "02",
    title: "Learn Core Concepts",
    description:
      "Study the most important concepts and understand how they work.",
  },
  {
    number: "03",
    title: "Practice",
    description:
      "Use examples, exercises and quizzes to test your understanding.",
  },
  {
    number: "04",
    title: "Build Projects",
    description:
      "Apply what you learned by solving practical problems.",
  },
  {
    number: "05",
    title: "Master the Subject",
    description:
      "Review difficult concepts and move toward advanced topics.",
  },
];

export default function SubjectDashboard() {
  const params = useParams();

  const subject = decodeURIComponent(
    String(params?.subject || "Subject")
  );

  return (
    <AppShell>
      <div className="space-y-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-violet-500/10 via-[var(--panel)] to-[var(--panel)] p-8 md:p-12">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-600">
              <span>🚀</span>
              Your personalized learning space
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl md:text-6xl">
              Learn{" "}
              <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                {subject}
              </span>
              <br />
              smarter, not harder.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Everything you need to learn {subject} is
              available in one place — videos, AI notes,
              quizzes and your personal AI tutor.
            </p>
          </div>
        </section>

        {/* LEARNING TOOLS */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
              Learning Tools
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">
              Everything in one place
            </h2>

            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Choose how you want to learn {subject}.
            </p>
          </div>

          <Link
            href={`/learn/${encodeURIComponent(subject)}/path`}
            className="group relative mb-5 block overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 via-[var(--panel)] to-[var(--panel)] p-7 transition hover:border-violet-400/50"
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">AI LEARNING PATH</p>
                <h3 className="mt-2 text-2xl font-bold text-[var(--text)]">Your personalized roadmap</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Get a structured {subject} progression from beginner fundamentals to advanced practice.</p>
              </div>
              <span className="inline-flex w-fit rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-violet-500">Explore Learning Path →</span>
            </div>
          </Link>

          {/* FOUR MAIN CARDS */}
          <div className="grid gap-5 md:grid-cols-2">
            {learningCards.map((card) => (
              <Link
                key={card.title}
                href={card.href.startsWith("/") ? card.href : `/learn/${encodeURIComponent(subject)}/${card.href}`}
                className="group rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-7 transition duration-300 hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-3xl transition group-hover:bg-violet-500/20">
                    {card.icon}
                  </div>

                  <span className="text-xl text-[var(--muted)] transition group-hover:text-violet-600">
                    →
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-[var(--text)]">
                  {card.title}
                </h3>

                <p className="mt-3 max-w-lg leading-7 text-[var(--muted)]">
                  {card.description}
                </p>

                <div className="mt-6 text-sm font-semibold text-violet-600">
                  {card.label} →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ROADMAP */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)]/50 p-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
              LEARNING ROADMAP
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">
              Your path to mastering {subject}
            </h2>

            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Follow a simple learning flow instead of
              jumping randomly between topics.
            </p>
          </div>

          <div className="grid gap-4">
            {roadmap.map((step, index) => (
              <div
                key={step.number}
                className="group flex items-start gap-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition hover:border-violet-500/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 font-bold text-violet-600">
                  {step.number}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-[var(--text)]">
                      {step.title}
                    </h3>

                    {index === 0 && (
                      <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600">
                        Start here
                      </span>
                    )}
                  </div>

                  <p className="mt-2 leading-6 text-[var(--muted)]">
                    {step.description}
                  </p>
                </div>

                <div className="hidden text-[var(--muted)] transition group-hover:text-violet-600 sm:block">
                  →
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI TUTOR CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent p-8 md:p-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-3xl">
              🤖
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
              YOUR AI TEACHER
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[var(--text)] md:text-4xl">
              Stuck on something?
            </h2>

            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              Ask StudyFlow AI to explain difficult
              concepts, give examples, help with
              problems or guide you through {subject}.
            </p>

            <Link
              href={`/learn/${encodeURIComponent(subject)}/tutor`}
              className="mt-7 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Start Learning with AI →
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
