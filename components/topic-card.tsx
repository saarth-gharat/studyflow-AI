import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";

interface TopicCardProps {
  title: string;
  description: string;
  level: string;
  duration: string;
  progress?: number;
  href?: string;
}

export function TopicCard({
  title,
  description,
  level,
  duration,
  progress = 0,
  href = "#",
}: TopicCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel-soft)]">
          <BookOpen size={18} />
        </div>

        <ArrowUpRight
          size={17}
          className="text-[var(--muted)] transition group-hover:text-[var(--text)]"
        />
      </div>

      <h3 className="mt-6 text-base font-semibold tracking-tight">
        {title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-4 text-xs text-[var(--muted)]">
        <span>{level}</span>

        <span className="flex items-center gap-1">
          <Clock3 size={13} />
          {duration}
        </span>
      </div>

      {progress > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-[11px] text-[var(--muted)]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel-soft)]">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}