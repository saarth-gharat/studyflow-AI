"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function TutorPage() {
  const params = useParams();

  const subject = decodeURIComponent(
    String(params?.subject || "Subject")
  );

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `# 👋 Hi! I'm your StudyFlow AI Tutor.

I'm ready to help you learn **${subject}**.

Ask me anything about ${subject}.

You can ask follow-up questions naturally. I'll remember what we've discussed during this study session.

Let's start learning! 🚀`,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function askTutor() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedQuestion,
    };

    /*
     * Keep the conversation BEFORE adding the
     * new question.
     */

    const previousConversation = messages;

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          subject,
          question: trimmedQuestion,
          conversation: previousConversation,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            `Tutor API failed with status ${response.status}`
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `### ⚠️ Tutor Error

${error.message}

Please try again.`
              : `### ⚠️ Tutor Error

Something went wrong. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askTutor();
    }
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content: `# 👋 New Study Session

I'm ready to teach you **${subject}**.

Ask me your first question.`,
      },
    ]);

    setQuestion("");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
              STUDYFLOW AI
            </p>

            <h1 className="mt-1 text-lg font-bold text-[var(--text)]">
              AI Tutor
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 sm:block">
              ✨ {subject}
            </div>

            <button
              onClick={clearChat}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
            >
              New Chat
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-6xl px-6">
        {/* INTRO */}

        <section className="pb-6 pt-8">
          <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 text-2xl">
                🤖
              </div>

              <div>
                <p className="text-sm font-semibold text-violet-400">
                  PERSONAL AI TUTOR
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[var(--text)] md:text-3xl">
                  Learn {subject} with AI
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                  Ask questions naturally. Your tutor
                  remembers the conversation and uses
                  previous explanations to understand
                  follow-up questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHAT */}

        <section className="pb-40">
          <div className="space-y-6">
            {messages.map((message, index) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-3xl px-6 py-5 ${
                      isUser
                        ? "bg-violet-600 text-white"
                        : "border border-[var(--border)] bg-[var(--panel-soft)]"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                          🤖
                        </div>

                        <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                          StudyFlow AI
                        </span>
                      </div>
                    )}

                    <div
                      className={`whitespace-pre-wrap leading-8 ${
                        isUser
                          ? "text-white"
                          : "text-[var(--text)]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* LOADING */}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                      🤖
                    </div>

                    <div>
                      <p className="text-sm text-[var(--muted)]">
                        StudyFlow AI is thinking...
                      </p>

                      <div className="mt-2 flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                          style={{
                            animationDelay:
                              "150ms",
                          }}
                        />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                          style={{
                            animationDelay:
                              "300ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>
      </div>

      {/* INPUT */}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-3 shadow-2xl">
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything about ${subject}...`}
              rows={2}
              disabled={loading}
              className="w-full resize-none bg-transparent px-3 py-2 text-[var(--text)] outline-none placeholder:text-[var(--muted)] disabled:opacity-50"
            />

            <div className="mt-2 flex items-center justify-between px-2">
              <p className="text-xs text-[var(--muted)]">
                Enter to send • Shift + Enter for new
                line
              </p>

              <button
                onClick={askTutor}
                disabled={
                  loading ||
                  !question.trim()
                }
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Thinking..."
                  : "Ask AI →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}