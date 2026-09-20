import {
  BookOpen,
  ExternalLink,
  FileText,
  PlayCircle,
} from "lucide-react";

interface ResourceCardProps {
  type: "video" | "notes" | "book" | "article";
  title: string;
  description: string;
  duration?: string;
  source?: string;
}

export function ResourceCard({
  type,
  title,
  description,
  duration,
  source,
}: ResourceCardProps) {
  const icons = {
    video: PlayCircle,
    notes: FileText,
    book: BookOpen,
    article: FileText,
  };

  const Icon = icons[type];

  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 transition hover:border-violet-500/40 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--panel-soft)]">
          <Icon size={17} />
        </div>

        <button aria-label={`Open ${title}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]">
          <ExternalLink size={15} />
        </button>
      </div>

      <div className="mt-5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {type}
        </span>

        <h3 className="mt-1 text-sm font-semibold">{title}</h3>

        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>{source || "StudyFlow Library"}</span>

        {duration && <span>{duration}</span>}
      </div>
    </div>
  );
}