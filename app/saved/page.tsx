"use client";

import { useEffect, useState } from "react";
import { Bookmark, ExternalLink, FileText, Globe2, PlayCircle, Route, Trash2 } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

const resourceTypes = [
  { title: "Videos", description: "Saved YouTube lessons will appear here.", icon: PlayCircle },
  { title: "AI Notes", description: "Saved study guides will appear here.", icon: FileText },
  { title: "Learning paths", description: "Saved roadmaps will appear here.", icon: Route },
  { title: "Web resources", description: "Saved external references will appear here.", icon: Globe2 },
];

type SavedResource = {
  id: string;
  resource_type: string;
  resource_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  metadata: Record<string, unknown> | null;
};

export default function SavedPage() {
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResources() {
      try {
        const response = await fetch("/api/saved", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load saved resources.");
        setResources(data.resources ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load saved resources.");
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, []);

  async function removeResource(resource: SavedResource) {
    const response = await fetch(`/api/saved?resourceType=${encodeURIComponent(resource.resource_type)}&resourceId=${encodeURIComponent(resource.resource_id)}`, { method: "DELETE" });
    if (response.ok) setResources((current) => current.filter((item) => item.id !== resource.id));
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Personal library"
          title="Saved resources"
          description="Keep the lessons, notes, and paths you want to return to in one place."
        />
        <section className="grid gap-4 md:grid-cols-3">
          {resourceTypes.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-violet-600">
                <Icon size={18} />
              </div>
              <h2 className="mt-5 text-sm font-semibold text-[var(--text)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </section>
        {loading && <section aria-live="polite" className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-sm"><div className="h-5 w-48 animate-pulse rounded bg-[var(--panel-soft)]" /><div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--panel-soft)]" /></section>}
        {!loading && error && <section role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8"><h2 className="font-semibold text-red-600">Saved resources are unavailable</h2><p className="mt-2 text-sm text-red-600/80">{error}</p></section>}
        {!loading && !error && resources.length === 0 && <EmptyState icon={<Bookmark size={19} />} title="Your saved library is empty" description="Save a video, note, topic, or learning path and it will appear here." actionHref="/explore" actionLabel="Explore subjects" />}
        {!loading && !error && resources.length > 0 && <section className="grid gap-4 md:grid-cols-2"><div className="sr-only" aria-live="polite">{resources.length} saved resources</div>{resources.map((resource) => { const externalUrl = typeof resource.metadata?.url === "string" ? resource.metadata.url : null; const internalHref = resource.resource_type === "learning_path" ? `/learn/${encodeURIComponent(String(resource.metadata?.subject || resource.title.replace(" Learning Path", "")))}/path` : resource.resource_type === "video" ? `/learn/${encodeURIComponent(String(resource.metadata?.subject || "Python"))}/videos` : null; return <article key={resource.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">{resource.resource_type === "video" ? <PlayCircle size={18} className="text-violet-600" /> : resource.resource_type === "learning_path" ? <Route size={18} className="text-violet-600" /> : resource.resource_type === "topic" ? <Globe2 size={18} className="text-violet-600" /> : <FileText size={18} className="text-violet-600" />}</div><button type="button" onClick={() => removeResource(resource)} aria-label={`Remove ${resource.title} from saved resources`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"><Trash2 size={16} /></button></div><h2 className="mt-5 font-semibold text-[var(--text)]">{resource.title}</h2>{resource.description && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{resource.description}</p>}<p className="mt-4 text-xs capitalize text-[var(--muted)]">{resource.resource_type.replace("_", " ")}</p>{(externalUrl || internalHref) && <div className="mt-5">{externalUrl ? <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-violet-500">Open resource <ExternalLink size={14} /></a> : <Link href={internalHref as string} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-violet-500">Open resource <ExternalLink size={14} /></Link>}</div>}</article>; })}</section>}
      </div>
    </AppShell>
  );
}
