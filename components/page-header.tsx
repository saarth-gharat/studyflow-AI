import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{eyebrow}</span>}<h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>}</div>{actions && <div className="shrink-0">{actions}</div>}</div>;
}
