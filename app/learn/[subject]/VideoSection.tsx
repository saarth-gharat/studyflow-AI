"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Video = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  url: string;
  embedUrl: string;
};

type Props = {
  subject: string;
};

export default function VideoSection({ subject }: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [playerError, setPlayerError] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/resources?subject=${encodeURIComponent(subject)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();

        const receivedVideos: Video[] = data.videos || [];

        setVideos(receivedVideos);

        if (receivedVideos.length > 0) {
          setSelectedVideo(receivedVideos[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load learning videos.");
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [subject]);

  function selectVideo(video: Video) {
    setSelectedVideo(video);
    setCompleted(false);
    setPlayerError(false);

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function toggleSaved() {
    if (!selectedVideo || saving) return;

    setSaving(true);
    try {
      const url = `/api/saved?resourceType=video&resourceId=${encodeURIComponent(selectedVideo.id)}`;
      const response = await fetch(saved ? url : "/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: saved ? undefined : { "Content-Type": "application/json" },
        body: saved
          ? undefined
          : JSON.stringify({
              resourceType: "video",
              resourceId: selectedVideo.id,
              title: selectedVideo.title,
              description: selectedVideo.description,
              thumbnailUrl: selectedVideo.thumbnail,
              metadata: { channel: selectedVideo.channel, url: selectedVideo.url },
            }),
      });

      if (!response.ok) return;
      setSaved((current) => !current);
    } finally {
      setSaving(false);
    }
  }

  /*
   * Create a clean YouTube embed URL.
   *
   * We use youtube-nocookie.com because it is
   * generally more reliable for embedded players
   * and improves privacy.
   */

  function getEmbedUrl(video: Video) {
  return `https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(
    window.location.origin
  )}&widget_referrer=${encodeURIComponent(
    window.location.href
  )}`;
}

  if (loading) {
    return (
      <section className="mt-12">
        <div className="animate-pulse">
          <div className="aspect-video rounded-3xl bg-[var(--panel-soft)]" />

          <div className="mt-6 h-7 w-2/3 rounded bg-[var(--panel-soft)]" />

          <div className="mt-3 h-4 w-1/3 rounded bg-[var(--panel-soft)]" />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-[var(--border)]"
              >
                <div className="aspect-video bg-[var(--panel-soft)]" />

                <div className="space-y-3 p-5">
                  <div className="h-5 rounded bg-[var(--panel-soft)]" />
                  <div className="h-4 w-2/3 rounded bg-[var(--panel-soft)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-12 rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
        <h2 className="text-lg font-semibold text-red-400">
          Unable to load videos
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!selectedVideo) {
    return (
      <section className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center">
        <div className="text-4xl">🎬</div>

        <h2 className="mt-4 text-xl font-semibold">
          No videos found
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          We couldn&apos;t find learning videos for {subject}.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">

      {/* ===================================== */}
      {/* VIDEO PLAYER                         */}
      {/* ===================================== */}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">

        <div className="relative aspect-video w-full">

          {!playerError ? (
            <iframe
  key={selectedVideo.id}
  src={getEmbedUrl(selectedVideo)}
  title={selectedVideo.title}
  className="absolute inset-0 h-full w-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
  referrerPolicy="strict-origin-when-cross-origin"
/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)] p-6 text-center">

              <div className="max-w-md">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-2xl">
                  ⚠️
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">
                  This video can&apos;t be played here
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  YouTube has restricted playback of this video
                  in the embedded player.
                </p>

                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex rounded-xl bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition hover:opacity-90"
                >
                  Watch on YouTube →
                </a>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* ===================================== */}
      {/* VIDEO INFORMATION                     */}
      {/* ===================================== */}

      <div className="mt-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="max-w-4xl">

            <p className="text-sm font-medium text-violet-400">
              NOW LEARNING
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
              {selectedVideo.title}
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {selectedVideo.channel}
            </p>

          </div>

          <div className="flex shrink-0 gap-2">

            <button
              onClick={() => setCompleted(!completed)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                completed
                  ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-[var(--text)] text-[var(--bg)] hover:opacity-90"
              }`}
            >
              {completed ? "✓ Completed" : "Mark complete"}
            </button>

            <button
              onClick={toggleSaved}
              disabled={saving}
              className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                saved
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                  : "border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:bg-[var(--panel-soft)] disabled:opacity-50"
              }`}
            >
              {saving ? "Saving..." : saved ? "🔖 Saved" : "🔖 Save"}
            </button>

          </div>

        </div>

        {selectedVideo.description && (
          <p className="mt-5 max-w-4xl text-sm leading-7 text-[var(--muted)]">
            {selectedVideo.description}
          </p>
        )}

      </div>

      {/* ===================================== */}
      {/* VIDEO LIBRARY                         */}
      {/* ===================================== */}

      <div className="mt-14">

        <div className="mb-6 flex items-end justify-between">

          <div>
            <p className="text-sm font-medium text-violet-400">
              VIDEO LIBRARY
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[var(--text)]">
              Continue learning
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Choose another lesson without leaving StudyFlow.
            </p>
          </div>

          <span className="hidden rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)] sm:block">
            {videos.length} lessons
          </span>

        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {videos.map((video, index) => {

            const isSelected =
              selectedVideo.id === video.id;

            return (
              <button
                key={video.id}
                onClick={() => selectVideo(video)}
                className={`group overflow-hidden rounded-2xl border text-left transition duration-300 ${
                  isSelected
                    ? "border-violet-500/40 bg-violet-500/[0.06]"
                    : "border-[var(--border)] bg-[var(--panel)] hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[var(--panel-soft)]"
                }`}
              >

                <div className="relative aspect-video overflow-hidden bg-black">

                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/30">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition ${
                        isSelected
                          ? "bg-violet-500 text-white"
                          : "bg-[var(--text)] text-[var(--bg)] opacity-90"
                      }`}
                    >
                      ▶
                    </div>

                  </div>

                  <div className="absolute left-3 top-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur">
                    Lesson {index + 1}
                  </div>

                </div>

                <div className="p-5">

                  <h4 className="line-clamp-2 text-base font-semibold leading-6 text-[var(--text)]">
                    {video.title}
                  </h4>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {video.channel}
                  </p>

                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-xs text-[var(--muted)]">
                      YouTube
                    </span>

                    {isSelected && (
                      <span className="text-xs font-medium text-violet-400">
                        Playing
                      </span>
                    )}

                  </div>

                </div>

              </button>
            );
          })}

        </div>

      </div>

    </section>
  );
}