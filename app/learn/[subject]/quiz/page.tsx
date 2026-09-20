"use client";

import { use, useEffect, useRef, useState } from "react";

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  topic: string;
};

type QuizResponse = {
  subject: string;
  questions: Question[];
  error?: string;
  code?: string;
};

export default function QuizPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: rawSubject } = use(params);

  const subject = decodeURIComponent(rawSubject);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completedAnswers, setCompletedAnswers] = useState<Record<number, number> | null>(null);

  const [finished, setFinished] = useState(false);
  const attemptSaved = useRef(false);
  const requestedSubject = useRef<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (requestedSubject.current === subject) return;
      requestedSubject.current = subject;

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            numberOfQuestions: 10,
            difficulty: "medium",
          }),
        });

        const data: QuizResponse = await response.json();

        if (!response.ok) {
          if (data.code === "AI_TEMPORARILY_UNAVAILABLE") {
            throw new Error(
              "Quiz generation is temporarily busy. Please try again in a moment."
            );
          }

          throw new Error("StudyFlow could not generate this quiz. Please try again.");
        }

        if (!data.questions || data.questions.length === 0) {
          throw new Error("The AI returned no questions.");
        }

        setQuestions(data.questions);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [subject]);

  function selectAnswer(index: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: index,
    }));
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer(null);
    } else {
      const finalAnswers = {
        ...answers,
        ...(selectedAnswer === null ? {} : { [currentQuestion]: selectedAnswer }),
      };
      setAnswers(finalAnswers);
      setCompletedAnswers(finalAnswers);
      setFinished(true);
      if (!attemptSaved.current) {
        attemptSaved.current = true;
        const completedScore = questions.reduce(
          (total, current, index) => total + (finalAnswers[index] === current.answer ? 1 : 0),
          0
        );
        void fetch("/api/quiz-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            score: completedScore,
            totalQuestions: questions.length,
            percentage: Math.round((completedScore / questions.length) * 100),
            answers: finalAnswers,
            questions,
          }),
        }).catch(() => undefined);
        void fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityType: "quiz_completed",
            subject,
            title: `${subject} quiz completed`,
          }),
        }).catch(() => undefined);
      }
    }
  }

  function restartQuiz() {
    window.location.reload();
  }

  const score = questions.reduce((total, question, index) => {
    return (
      total +
      ((completedAnswers ?? answers)[index] === question.answer ? 1 : 0)
    );
  }, 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
        <div className="mx-auto max-w-4xl">

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
            {subject}
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Creating your quiz...
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            StudyFlow AI is generating questions specifically about{" "}
            <span className="font-semibold text-indigo-400">
              {subject}
            </span>
            .
          </p>

          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-8">

            <div className="h-6 w-40 animate-pulse rounded bg-[var(--border)]" />

            <div className="mt-8 h-8 w-full animate-pulse rounded bg-[var(--border)]" />

            <div className="mt-8 space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-2xl bg-[var(--border)]"
                />
              ))}
            </div>

          </div>

        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-12 text-[var(--text)]">

        <div className="mx-auto max-w-2xl">

          <div className="rounded-3xl border border-red-500/20 bg-[var(--panel-soft)] p-10">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
              ⚠️
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[var(--text)]">
              Quiz generation failed
            </h1>

            <p className="mt-4 text-[var(--muted)]">
              StudyFlow couldn&apos;t generate the{" "}
              <span className="font-semibold text-indigo-400">
                {subject}
              </span>{" "}
              quiz.
            </p>

            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                Error details
              </p>

              <p className="mt-2 break-words font-mono text-sm text-red-300">
                {error}
              </p>

            </div>

            <button
              onClick={restartQuiz}
              className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    let message = "Keep practicing!";

    if (percentage >= 90) {
      message = "Outstanding! You have a strong understanding.";
    } else if (percentage >= 80) {
      message = "Excellent work!";
    } else if (percentage >= 60) {
      message = "Good job! Keep improving.";
    } else {
      message = "Review the topics and try again.";
    }

    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-12 text-[var(--text)]">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-10 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 text-4xl">
              🎯
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Quiz Complete
            </p>

            <h1 className="mt-3 text-4xl font-bold text-[var(--text)]">
              {subject}
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              {message}
            </p>

            <div className="mx-auto mt-10 flex h-44 w-44 items-center justify-center rounded-full border-8 border-indigo-500/20">

              <div>
                <p className="text-5xl font-bold text-indigo-400">
                  {percentage}%
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Score
                </p>
              </div>

            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <p className="text-3xl font-bold text-emerald-400">
                  {score}
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Correct
                </p>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                <p className="text-3xl font-bold text-red-400">
                  {questions.length - score}
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Incorrect
                </p>
              </div>

            </div>

            <button
              onClick={restartQuiz}
              className="mt-10 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-500"
            >
              Take Quiz Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  const question = questions[currentQuestion];

  const progress = Math.round(
    ((currentQuestion + 1) / questions.length) * 100
  );

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-10 text-[var(--text)]">

      <div className="mx-auto max-w-4xl">

        <div className="mb-8">

          <div className="flex items-start justify-between gap-6">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                {subject}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[var(--text)]">
                Knowledge Check
              </h1>

              <p className="mt-2 text-[var(--muted)]">
                Questions generated specifically for {subject}.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-semibold text-[var(--text)]">
              {currentQuestion + 1} / {questions.length}
            </div>

          </div>

          <div className="mt-7">

            <div className="mb-2 flex justify-between text-xs font-medium text-[var(--muted)]">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">

              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-7 shadow-2xl md:p-10">

          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            {question.topic}
          </span>

          <h2 className="mt-7 text-2xl font-bold leading-relaxed text-[var(--text)] md:text-3xl">
            {question.question}
          </h2>

          <div className="mt-8 space-y-4">

            {question.options.map((option, index) => {

              const isSelected =
                selectedAnswer === index;

              const isCorrect =
                index === question.answer;

              let optionClass =
                "border-[var(--border)] bg-[var(--bg)] hover:border-indigo-500 hover:bg-indigo-500/5";

              if (selectedAnswer !== null) {

                if (isCorrect) {
                  optionClass =
                    "border-emerald-500/50 bg-emerald-500/10";
                } else if (isSelected) {
                  optionClass =
                    "border-red-500/50 bg-red-500/10";
                } else {
                  optionClass =
                    "border-[var(--border)] bg-[var(--bg)] opacity-50";
                }

              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${optionClass}`}
                >

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-soft)] text-sm font-bold text-[var(--text)]">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="font-medium text-[var(--text)]">
                    {option}
                  </span>

                </button>
              );
            })}

          </div>

          {selectedAnswer !== null && (

            <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">

              <p
                className={`font-bold ${
                  selectedAnswer === question.answer
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {selectedAnswer === question.answer
                  ? "✓ Correct!"
                  : "✕ Incorrect"}
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {question.explanation}
              </p>

            </div>

          )}

          <div className="mt-8 flex justify-end">

            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className="rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentQuestion === questions.length - 1
                ? "Finish Quiz"
                : "Next Question →"}
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}