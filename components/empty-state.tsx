import Link from "next/link";
import { ReactNode } from "react";

export function EmptyState({ icon, title, description, actionHref, actionLabel }: { icon: ReactNode; title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-sm">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-violet-600">{icon}</div>
    <h2 className="mt-4 text-lg font-semibold text-[var(--text)]">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>
    {actionHref && actionLabel && <Link href={actionHref} className="mt-5 inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500">{actionLabel}</Link>}
  </section>;
}
