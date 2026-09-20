import Link from "next/link";
import { getChapter, getCourse } from "@/app/lib/courses";

type PageProps = {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
};

export default async function ChapterPage({ params }: PageProps) {
  const { subject, chapter } = await params;

  const decodedSubject = decodeURIComponent(subject);

  const course = getCourse(decodedSubject);

  const currentChapter = getChapter(
    decodedSubject,
    chapter
  );

  if (!currentChapter) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-20 text-[var(--text)]">

        <div className="mx-auto max-w-3xl">

          <h1 className="text-3xl font-bold">
            Chapter not found
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            We couldn&apos;t find this chapter.
          </p>

          <Link
            href={`/learn/${encodeURIComponent(decodedSubject)}/notes`}
            className="mt-6 inline-block rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium"
          >
            Back to course
          </Link>

        </div>

      </main>
    );
  }

  const currentIndex = course.findIndex(
    (item) => item.id === currentChapter.id
  );

  const previousChapter =
    currentIndex > 0 ? course[currentIndex - 1] : null;

  const nextChapter =
    currentIndex < course.length - 1
      ? course[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      <header className="border-b border-[var(--border)]">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-lg font-semibold"
          >
            StudyFlow
          </Link>

          <Link
            href={`/learn/${encodeURIComponent(decodedSubject)}/notes`}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
          >
            ← All chapters
          </Link>

        </div>

      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Chapter header */}

        <div className="mb-12">

          <div className="flex flex-wrap items-center gap-3">

            <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-400">
              Chapter {String(currentChapter.number).padStart(2, "0")}
            </span>

            <span className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
              {currentChapter.level}
            </span>

            <span className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
              {currentChapter.duration}
            </span>

          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {currentChapter.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
            {currentChapter.description}
          </p>

        </div>

        {/* Lessons */}

        <div className="space-y-12">

          {currentChapter.lessons.map((lesson, index) => (

            <article key={lesson.id}>

              <div className="flex gap-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-soft)] text-xs font-semibold text-[var(--muted)]">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="text-2xl font-semibold text-[var(--text)]">
                    {lesson.title}
                  </h2>

                  <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                    {lesson.explanation}
                  </p>

                  {/* Key concepts */}

                  <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-6">

                    <h3 className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                      Key Concepts
                    </h3>

                    <ul className="mt-5 space-y-3">

                      {lesson.keyPoints.map((point) => (

                        <li
                          key={point}
                            className="flex gap-3 text-sm leading-6 text-[var(--muted)]"
                        >

                          <span className="text-violet-400">
                            ✓
                          </span>

                          <span>
                            {point}
                          </span>

                        </li>

                      ))}

                    </ul>

                  </div>

                  {/* Examples */}

                  {lesson.examples &&
                    lesson.examples.length > 0 && (

                    <div className="mt-7 space-y-5">

                      {lesson.examples.map((example) => (

                        <div key={example.title}>

                          <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
                            {example.title}
                          </h3>

                          <pre className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 text-sm leading-7 text-[var(--text)]">
                            <code>{example.code}</code>
                          </pre>

                          {example.explanation && (
                            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                              {example.explanation}
                            </p>
                          )}

                        </div>

                      ))}

                    </div>

                  )}

                  {/* Tips */}

                  {lesson.tips &&
                    lesson.tips.length > 0 && (

                    <div className="mt-7 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-6">

                      <h3 className="text-sm font-semibold text-amber-400">
                        💡 Study Tips
                      </h3>

                      <ul className="mt-4 space-y-2">

                        {lesson.tips.map((tip) => (

                          <li
                            key={tip}
                            className="text-sm leading-6 text-[var(--muted)]"
                          >
                            • {tip}
                          </li>

                        ))}

                      </ul>

                    </div>

                  )}

                </div>

              </div>

            </article>

          ))}

        </div>

        {/* Chapter actions */}

        <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              CHAPTER COMPLETE?
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Test what you learned
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Take the chapter quiz and check your understanding.
            </p>

          </div>

          <Link
            href={`/learn/${encodeURIComponent(decodedSubject)}/quiz?chapter=${currentChapter.id}`}
            className="mt-5 inline-flex rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
          >
            Start Chapter Quiz →
          </Link>

        </div>

        {/* Previous / next */}

        <div className="mt-8 grid gap-4 md:grid-cols-2">

          {previousChapter ? (

            <Link
              href={`/learn/${encodeURIComponent(decodedSubject)}/notes/${previousChapter.id}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 transition hover:bg-[var(--panel)]"
            >

              <p className="text-xs text-[var(--muted)]">
                PREVIOUS
              </p>

              <p className="mt-2 font-medium text-[var(--text)]">
                ← {previousChapter.title}
              </p>

            </Link>

          ) : (
            <div />
          )}

          {nextChapter && (

            <Link
              href={`/learn/${encodeURIComponent(decodedSubject)}/notes/${nextChapter.id}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 text-right transition hover:bg-[var(--panel)]"
            >

              <p className="text-xs text-[var(--muted)]">
                NEXT
              </p>

              <p className="mt-2 font-medium text-[var(--text)]">
                {nextChapter.title} →
              </p>

            </Link>

          )}

        </div>

      </div>

    </main>
  );
}