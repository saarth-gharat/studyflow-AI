"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Topic = {
  title: string;
  explanation: string;
  example?: string;
  important?: string[];
};

type Chapter = {
  title: string;
  overview: string;
  topics: Topic[];
};

type KeyTerm = {
  term: string;
  meaning: string;
};

type Notes = {
  subject: string;
  description: string;
  chapters: Chapter[];
  quickRevision: string[];
  importantQuestions: string[];
  keyTerms: KeyTerm[];
};

export default function NotesPage() {
  const params = useParams();

  const subject = decodeURIComponent(
    String(params?.subject || "Subject")
  );

  const [notes, setNotes] = useState<Notes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activityRecorded = useRef(false);
  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.error ||
              `Notes API failed with status ${response.status}`
          );
        }

        if (!activityRecorded.current) {
          activityRecorded.current = true;
          void fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityType: "note_generated",
              subject,
              title: `${subject} notes generated`,
            }),
          }).catch(() => undefined);
        }
        if (!data.notes) {
          throw new Error(
            "The AI did not return any notes."
          );
        }

        setNotes({
          subject: data.notes.subject || subject,

          description:
            data.notes.description ||
            `AI-generated notes for ${subject}.`,

          chapters: Array.isArray(data.notes.chapters)
            ? data.notes.chapters
            : [],

          quickRevision: Array.isArray(
            data.notes.quickRevision
          )
            ? data.notes.quickRevision
            : [],

          importantQuestions: Array.isArray(
            data.notes.importantQuestions
          )
            ? data.notes.importantQuestions
            : [],

          keyTerms: Array.isArray(data.notes.keyTerms)
            ? data.notes.keyTerms
            : [],
        });
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate notes."
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [subject]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              STUDYFLOW AI
            </p>

            <h1 className="text-4xl font-bold md:text-6xl">
              Generating{" "}
              <span className="text-violet-400">
                {subject}
              </span>{" "}
              Notes
            </h1>

            <p className="mt-4 max-w-2xl text-[var(--muted)]">
              StudyFlow AI is creating a complete study guide
              specifically for {subject}.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)]"
              />
            ))}
          </div>

          <div className="mt-8 text-sm text-[var(--muted)]">
            🤖 AI is preparing your notes...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Notes Error
            </p>

            <h1 className="mt-3 text-2xl font-bold">
              Failed to generate notes
            </h1>

            <p className="mt-4 text-[var(--muted)]">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!notes) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* HEADER */}

      <header className="border-b border-[var(--border)] bg-[var(--bg)]/95">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            STUDYFLOW AI
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text)]">
              {notes.subject} — AI Notes
            </h2>

            <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-300">
              ✨ AI Generated
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16">
        <div className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          🤖 AI Generated Study Guide
        </div>

        <h1 className="mt-7 text-5xl font-black tracking-tight text-[var(--text)] md:text-7xl">
          Master{" "}
          <span className="text-violet-400">
            {notes.subject}
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          {notes.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--text)]">
            📚 {notes.chapters.length} Chapters
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--text)]">
            📝 {notes.importantQuestions.length} Questions
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--text)]">
            🔑 {notes.keyTerms.length} Key Terms
          </div>
        </div>
      </section>

      {/* COURSE CONTENT */}

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* SIDEBAR */}

          <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
              Course Contents
            </p>

            <div className="mt-5 space-y-2">
              {notes.chapters.map((chapter, index) => (
                <a
                  key={index}
                  href={`#chapter-${index}`}
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-violet-500/10 hover:text-violet-300"
                >
                  {index + 1}. {chapter.title}
                </a>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}

          <div className="space-y-10">
            {notes.chapters.map((chapter, chapterIndex) => (
              <section
                key={chapterIndex}
                id={`chapter-${chapterIndex}`}
                className="scroll-mt-8 rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-7 md:p-10"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-lg font-bold text-violet-400">
                    {chapterIndex + 1}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                      Chapter {chapterIndex + 1}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">
                      {chapter.title}
                    </h2>

                    <p className="mt-3 leading-7 text-[var(--muted)]">
                      {chapter.overview}
                    </p>
                  </div>
                </div>

                <div className="mt-10 space-y-8">
                  {Array.isArray(chapter.topics) &&
                    chapter.topics.map(
                      (topic, topicIndex) => (
                        <article
                          key={topicIndex}
                          className="border-t border-[var(--border)] pt-7"
                        >
                          <h3 className="text-xl font-bold text-[var(--text)]">
                            {topicIndex + 1}.{" "}
                            {topic.title}
                          </h3>

                          <p className="mt-4 whitespace-pre-line leading-8 text-[var(--muted)]">
                            {topic.explanation}
                          </p>

                          {topic.example && (
                            <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                              <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                                Example
                              </p>

                              <p className="mt-3 whitespace-pre-line leading-7 text-[var(--muted)]">
                                {topic.example}
                              </p>
                            </div>
                          )}

                          {Array.isArray(
                            topic.important
                          ) &&
                            topic.important.length > 0 && (
                              <div className="mt-5">
                                <p className="text-sm font-bold text-emerald-400">
                                  Important Points
                                </p>

                                <ul className="mt-3 space-y-2">
                                  {topic.important.map(
                                    (point, pointIndex) => (
                                      <li
                                        key={pointIndex}
                                        className="flex gap-3 text-[var(--muted)]"
                                      >
                                        <span className="text-emerald-400">
                                          ✓
                                        </span>

                                        <span>
                                          {point}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </article>
                      )
                    )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK REVISION */}

      {notes.quickRevision.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-8 md:p-10">
            <p className="text-sm font-semibold text-violet-400">
              Quick Revision
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Remember these
            </h2>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {notes.quickRevision.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-black/20 p-4 text-gray-300"
                  >
                    <span className="mr-3 font-bold text-violet-400">
                      {index + 1}.
                    </span>

                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* IMPORTANT QUESTIONS */}

      {notes.importantQuestions.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-8 md:p-10">
            <p className="text-sm font-semibold text-yellow-400">
              Exam Preparation
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">
              Important Questions
            </h2>

            <div className="mt-7 space-y-3">
              {notes.importantQuestions.map(
                (question, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-5"
                  >
                    <span className="mr-3 font-bold text-yellow-400">
                      Q{index + 1}.
                    </span>

                    <span className="text-[var(--text)]">
                      {question}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* KEY TERMS */}

      {notes.keyTerms.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 md:p-10">
            <p className="text-sm font-semibold text-emerald-400">
              Vocabulary
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">
              Key Terms
            </h2>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {notes.keyTerms.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-5"
                  >
                    <h3 className="font-bold text-emerald-300">
                      {item.term}
                    </h3>

                    <p className="mt-2 leading-7 text-[var(--muted)]">
                      {item.meaning}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}

      <footer className="border-t border-[var(--border)] py-10 text-center">
        <p className="text-sm text-[var(--muted)]">
          Generated by StudyFlow AI
        </p>

        <p className="mt-2 text-xs text-[var(--muted)]">
          AI-generated content should be reviewed with your
          course material.
        </p>
      </footer>
    </main>
  );
}