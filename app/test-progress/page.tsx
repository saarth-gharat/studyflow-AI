"use client";

import { useState } from "react";
import {
  getUserProgress,
  saveProgress,
} from "@/lib/supabase/progress";

export default function TestProgressPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createProgress() {
    try {
      setLoading(true);
      setMessage("");

      const result = await saveProgress(
        "Python",
        "notes_progress",
        100
      );

      console.log("Progress saved:", result);

      setMessage(
        "Success! Python notes progress was saved to Supabase."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadProgress() {
    try {
      setLoading(true);
      setMessage("");

      const result = await getUserProgress("Python");

      console.log("Progress loaded:", result);

      if (!result) {
        setMessage("No Python progress found.");
        return;
      }

      setMessage(
        `Python progress: Notes ${result.notes_progress}%`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8">
        <h1 className="text-2xl font-bold">
          StudyFlow Progress Test
        </h1>

        <p className="mt-2 text-gray-400">
          Test Supabase study progress before connecting the
          real learning features.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={createProgress}
            disabled={loading}
            className="rounded-xl bg-purple-600 px-5 py-3 font-medium hover:bg-purple-500 disabled:opacity-50"
          >
            Save Progress
          </button>

          <button
            onClick={loadProgress}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-medium hover:bg-[var(--panel-soft)] disabled:opacity-50"
          >
            Load Progress
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--text)]">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}