"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

type Video = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt?: string;
  url: string;
  embedUrl: string;
};

type ApiResponse = {
  subject?: string;
  videos?: Video[];
  error?: string;
};

export default function VideosPage() {
  const params = useParams();

  const subject = decodeURIComponent(
    String(params?.subject || "Python")
  );

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/resources?subject=${encodeURIComponent(subject)}`,
        {
          cache: "no-store",
        }
      );

      const text = await response.text();

      let data: ApiResponse;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "The server returned an invalid response. Check /api/resources."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to load videos (${response.status})`
        );
      }

      if (!data.videos || !Array.isArray(data.videos)) {
        throw new Error("No videos were returned by the API.");
      }

      setVideos(data.videos);

      if (data.videos.length > 0) {
        setSelectedVideo(data.videos[0]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load videos."
      );
    } finally {
      setLoading(false);
    }

  }, [subject]);

  function selectVideo(video: Video) {
    setSelectedVideo(video);
    void fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType: "video_view",
        subject,
        resourceId: video.id,
        title: video.title,
      }),
    }).catch(() => undefined);
  }

  async function toggleSaved() {
    if (!selectedVideo || saving) return;

    setSaving(true);
    try {
      const resourceUrl = `/api/saved?resourceType=video&resourceId=${encodeURIComponent(selectedVideo.id)}`;
      const response = await fetch(saved ? resourceUrl : "/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: saved ? undefined : { "Content-Type": "application/json" },
        body: saved ? undefined : JSON.stringify({
          resourceType: "video",
          resourceId: selectedVideo.id,
          title: selectedVideo.title,
          description: selectedVideo.description,
          thumbnailUrl: selectedVideo.thumbnail,
          metadata: { channel: selectedVideo.channel, url: selectedVideo.url, subject },
        }),
      });

      if (response.ok) setSaved((current) => !current);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadVideos);
  }, [loadVideos]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href={`/learn/${encodeURIComponent(subject)}`}
            className="text-lg font-bold tracking-tight text-[var(--text)]"
          >
            ← StudyFlow
          </Link>

          <div className="hidden text-sm text-[var(--muted)] md:block">
            Learning <span className="text-[var(--text)]">{subject}</span>
          </div>

          <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            🎥 Videos
          </div>
        </div>
      </header>

      {/* PAGE HEADER */}

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-400">
          VIDEO LEARNING
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
          Learn{" "}
          <span className="text-violet-400">
            {subject}
          </span>{" "}
          through videos
        </h1>

        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Study {subject} using curated YouTube lessons.
          Select a video below and watch it directly inside
          StudyFlow.
        </p>
      </section>

      {/* ERROR */}

      {error && (
        <section className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="font-bold text-red-400">
              Could not load videos
            </h2>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>

            <button
              onClick={loadVideos}
              className="mt-4 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* LOADING */}

      {loading && (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-violet-500" />

              <p className="mt-4 text-[var(--muted)]">
                Finding the best {subject} videos...
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MAIN VIDEO */}

      {!loading && !error && selectedVideo && (
        <section className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            {/* PLAYER */}

            <div>
              <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-black shadow-2xl">
                <div className="aspect-video w-full">
                  <iframe
                    key={selectedVideo.id}
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  {selectedVideo.title}
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  {selectedVideo.channel}
                </p>

                <button
                  type="button"
                  onClick={toggleSaved}
                  disabled={saving}
                  className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--panel)] disabled:opacity-50"
                >
                  {saving ? "Saving..." : saved ? "🔖 Saved" : "🔖 Save"}
                </button>

                <p className="mt-4 leading-7 text-[var(--muted)]">
                  {selectedVideo.description}
                </p>
              </div>
            </div>

            {/* VIDEO LIST */}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Recommended Videos
                </h2>

                <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)]">
                  {videos.length} videos
                </span>
              </div>

              <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">
                {videos.map((video, index) => {
                  const active =
                    selectedVideo.id === video.id;

                  return (
                    <button
                      key={`${video.id}-${index}`}
                      onClick={() => selectVideo(video)}
                      className={`group flex w-full gap-3 rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-violet-500/40 bg-violet-500/10"
                          : "border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--border)] hover:bg-[var(--panel)]"
                      }`}
                    >
                      {/* THUMBNAIL */}

                      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-black">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          sizes="128px"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-sm">
                            ▶
                          </span>
                        </div>
                      </div>

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`line-clamp-2 text-sm font-semibold ${
                            active
                              ? "text-violet-300"
                              : "text-[var(--text)]"
                          }`}
                        >
                          {video.title}
                        </h3>

                        <p className="mt-2 truncate text-xs text-[var(--muted)]">
                          {video.channel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* NO VIDEOS */}

      {!loading &&
        !error &&
        videos.length === 0 && (
          <section className="mx-auto max-w-7xl px-6 py-10">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-12 text-center">
              <div className="text-5xl">🎥</div>

              <h2 className="mt-5 text-2xl font-bold text-[var(--text)]">
                No videos found
              </h2>

              <p className="mt-3 text-[var(--muted)]">
                We couldn&apos;t find videos for {subject}.
              </p>

              <button
                onClick={loadVideos}
                className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
              >
                Search Again
              </button>
            </div>
          </section>
        )}

      {/* FOOTER NAVIGATION */}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-7">
          <h2 className="text-xl font-bold text-[var(--text)]">
            Continue learning {subject}
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/learn/${encodeURIComponent(subject)}/notes`}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--panel)]"
            >
              📝 AI Notes
            </Link>

            <Link
              href={`/learn/${encodeURIComponent(subject)}/quiz`}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--panel)]"
            >
              🧠 AI Quiz
            </Link>

            <Link
              href={`/learn/${encodeURIComponent(subject)}/tutor`}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--panel)]"
            >
              🤖 AI Tutor
            </Link>

            <Link
              href={`/learn/${encodeURIComponent(subject)}`}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}