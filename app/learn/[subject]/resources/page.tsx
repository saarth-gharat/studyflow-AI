"use client";

import {
  Bookmark,
  Check,
  ExternalLink,
  Globe2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  normalizeResourceSubject,
  resourceCategories,
  resourceDifficulties,
  resourcesForSubject,
  resourceTypes,
  type LearningResource,
} from "@/lib/resources";

type SavedResource = {
  resource_type: string;
  resource_id: string;
};

function resourceId(subject: string, resource: LearningResource) {
  return `${normalizeResourceSubject(subject)}:${resource.url}`;
}

function isSafeResourceUrl(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

function badgeClass(kind: "violet" | "neutral" | "green") {
  if (kind === "green") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  if (kind === "neutral") return "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)]";
  return "border-violet-500/20 bg-violet-500/10 text-violet-600";
}

function ResourceCard({
  resource,
  subject,
  saved,
  saving,
  onToggleSaved,
  onPreview,
  featured = false,
}: {
  resource: LearningResource;
  subject: string;
  saved: boolean;
  saving: boolean;
  onToggleSaved: (resource: LearningResource) => void;
  onPreview: (resource: LearningResource) => void;
  featured?: boolean;
}) {
  const safeUrl = isSafeResourceUrl(resource.url);

  return (
    <article data-subject={subject} className={`group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg ${featured ? "ring-1 ring-violet-500/20" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-xs font-bold text-violet-600" aria-hidden="true">
            {resource.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)]">{resource.provider}</p>
            <p className="text-xs text-[var(--muted)]">{resource.type}</p>
          </div>
        </div>
        {featured && <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-600">Featured</span>}
      </div>

      <button type="button" onClick={() => onPreview(resource)} className="mt-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--panel)]">
        <h3 className="text-lg font-semibold text-[var(--text)]">{resource.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{resource.description}</p>
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeClass("violet")}`}>{resource.category}</span>
        {resource.difficulty && <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeClass("neutral")}`}>{resource.difficulty}</span>}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <button type="button" onClick={() => onToggleSaved(resource)} disabled={saving} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${saved ? badgeClass("green") : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)] hover:border-violet-500/40"}`}>
          {saved ? <Check size={14} /> : <Bookmark size={14} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
        {safeUrl ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500">Open <ExternalLink size={14} /></a> : <span className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600">Link unavailable</span>}
      </div>
    </article>
  );
}

export default function WebResourcesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subject = decodeURIComponent(String(params?.subject || "Subject"));
  const subjectResources = useMemo(() => resourcesForSubject(subject), [subject]);
  const initialTopic = searchParams.get("topic") || "";
  const initialCategory = searchParams.get("category");
  const [query, setQuery] = useState(initialTopic);
  const [category, setCategory] = useState<(typeof resourceCategories)[number]>(resourceCategories.includes(initialCategory as (typeof resourceCategories)[number]) ? (initialCategory as (typeof resourceCategories)[number]) : "All");
  const [difficulty, setDifficulty] = useState<(typeof resourceDifficulties)[number]>("All");
  const [type, setType] = useState<(typeof resourceTypes)[number]>("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saveLoading, setSaveLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);

  useEffect(() => {
    async function loadSavedResources() {
      try {
        const response = await fetch("/api/saved", { cache: "no-store" });
        if (response.status === 401) return;
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load saved resource state.");
        const ids = (data.resources as SavedResource[])
          .filter((item) => item.resource_type === "topic")
          .map((item) => item.resource_id);
        setSavedIds(new Set(ids));
      } catch (loadError) {
        setSaveError(loadError instanceof Error ? loadError.message : "Saved state is unavailable right now.");
      } finally {
        setSaveLoading(false);
      }
    }

    void loadSavedResources();
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return subjectResources.filter((resource) => {
      const searchable = [resource.provider, resource.title, resource.description, resource.category, resource.type, subject, ...resource.subjects].join(" ").toLowerCase();
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (category === "All" || resource.category === category)
        && (difficulty === "All" || resource.difficulty === difficulty)
        && (type === "All" || resource.type === type);
    });
  }, [category, difficulty, query, subject, subjectResources, type]);

  const featuredResources = useMemo(() => subjectResources.filter((resource) => resource.featured).slice(0, 4), [subjectResources]);

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setDifficulty("All");
    setType("All");
  }

  async function toggleSaved(resource: LearningResource) {
    const id = resourceId(subject, resource);
    setSavingId(id);
    setSaveError("");
    try {
      const isSaved = savedIds.has(id);
      const response = await fetch(isSaved ? `/api/saved?resourceType=topic&resourceId=${encodeURIComponent(id)}` : "/api/saved", {
        method: isSaved ? "DELETE" : "POST",
        headers: isSaved ? undefined : { "Content-Type": "application/json" },
        body: isSaved ? undefined : JSON.stringify({
          resourceType: "topic",
          resourceId: id,
          title: resource.title,
          description: resource.description,
          metadata: {
            url: resource.url,
            source: resource.provider,
            category: resource.category,
            type: resource.type,
            difficulty: resource.difficulty || null,
            subject,
            topic: query.trim() || null,
          },
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error || "Unable to update saved resources.");
      setSavedIds((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(id); else next.add(id);
        return next;
      });
    } catch (saveLoadError) {
      setSaveError(saveLoadError instanceof Error ? saveLoadError.message : "Unable to update saved resources.");
    } finally {
      setSavingId(null);
    }
  }

  const hasFilters = Boolean(query.trim()) || category !== "All" || difficulty !== "All" || type !== "All";

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader eyebrow="Learn from the web" title={`Trusted resources for ${subject}`} description="Browse verified documentation, courses, practice platforms, and project ideas that complement your StudyFlow workspace." />

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label htmlFor="resource-search" className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
              <Search size={17} className="text-[var(--muted)]" />
              <input id="resource-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learning resources..." className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]" />
            </label>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Globe2 size={15} /> Verified external links</div>
          </div>

          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Resource categories">
            {resourceCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${category === item ? "border-violet-500 bg-violet-500 text-white" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)] hover:border-violet-500/40 hover:text-[var(--text)]"}`}>{item}</button>)}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-medium text-[var(--muted)]">Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)} className="mt-2 min-h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus:border-violet-500">{resourceDifficulties.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-xs font-medium text-[var(--muted)]">Resource type<select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="mt-2 min-h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus:border-violet-500">{resourceTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="flex items-end"><button type="button" onClick={clearFilters} disabled={!hasFilters} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-sm font-medium text-[var(--text)] hover:border-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"><SlidersHorizontal size={15} /> Clear filters</button></div>
          </div>
        </section>

        {featuredResources.length > 0 && !hasFilters && <section className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Popular starting points</p><h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Featured resources</h2><p className="mt-1 text-sm text-[var(--muted)]">A few strong places to begin with {subject}.</p></div><div className="grid gap-4 lg:grid-cols-4">{featuredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} subject={subject} saved={savedIds.has(resourceId(subject, resource))} saving={savingId === resourceId(subject, resource)} onToggleSaved={toggleSaved} onPreview={setSelectedResource} featured />)}</div></section>}

        <section className="space-y-4" aria-live="polite">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Resource library</p><h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">{hasFilters ? "Matching resources" : "All resources"}</h2></div><p className="text-sm text-[var(--muted)]">Showing {filteredResources.length} of {subjectResources.length} resources</p></div>
          {saveLoading && <p className="text-xs text-[var(--muted)]">Checking your saved resources...</p>}
          {saveError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{saveError}</p>}
          {filteredResources.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} subject={subject} saved={savedIds.has(resourceId(subject, resource))} saving={savingId === resourceId(subject, resource)} onToggleSaved={toggleSaved} onPreview={setSelectedResource} />)}</div>}
          {filteredResources.length === 0 && <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-sm"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-violet-600"><Search size={19} /></div><h3 className="mt-4 text-lg font-semibold text-[var(--text)]">No resources found</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Try another search or remove a filter to see more trusted learning resources.</p><button type="button" onClick={clearFilters} className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500">Clear filters</button></section>}
        </section>

        <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Bookmark size={14} /> Saved resources are available from My Learning.</div>
      </div>

      {selectedResource && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelectedResource(null)}><section role="dialog" aria-modal="true" aria-labelledby="resource-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">{selectedResource.provider}</p><h2 id="resource-dialog-title" className="mt-2 text-2xl font-semibold text-[var(--text)]">{selectedResource.title}</h2></div><button type="button" onClick={() => setSelectedResource(null)} aria-label="Close resource details" className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"><X size={18} /></button></div><p className="mt-5 text-sm leading-7 text-[var(--muted)]">{selectedResource.description}</p><div className="mt-5 flex flex-wrap gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass("violet")}`}>{selectedResource.category}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass("neutral")}`}>{selectedResource.type}</span>{selectedResource.difficulty && <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass("neutral")}`}>{selectedResource.difficulty}</span>}</div><div className="mt-6 rounded-2xl bg-[var(--panel-soft)] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Why it is useful</p><p className="mt-2 text-sm leading-6 text-[var(--text)]">Use this {selectedResource.type.toLowerCase()} from {selectedResource.provider} as a focused complement to your {subject} learning workspace.</p></div><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => void toggleSaved(selectedResource)} disabled={savingId === resourceId(subject, selectedResource)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] disabled:opacity-60">{savedIds.has(resourceId(subject, selectedResource)) ? <Check size={14} /> : <Bookmark size={14} />}{savedIds.has(resourceId(subject, selectedResource)) ? "Saved" : "Save resource"}</button>{isSafeResourceUrl(selectedResource.url) && <a href={selectedResource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-violet-500">Open resource <ExternalLink size={14} /></a>}</div></section></div>}
    </AppShell>
  );
}
