import Link from "next/link";
import { Brain, FileText, GitBranch, PlayCircle, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

const tools = [
  { name: "Videos", description: "Watch curated YouTube lessons for your subject.", icon: PlayCircle },
  { name: "AI Notes", description: "Generate a structured study guide for what you are learning.", icon: FileText },
  { name: "AI Quiz", description: "Practice with questions tailored to your subject.", icon: Brain },
  { name: "AI Tutor", description: "Ask follow-up questions and learn with a subject-aware tutor.", icon: Sparkles },
  { name: "AI Learning Path", description: "Create a logical, beginner-to-advanced roadmap.", icon: GitBranch },
];

export default function ToolsPage() {
  return <AppShell><div><PageHeader eyebrow="StudyFlow AI" title="AI tools" description="Select a subject first, then use the right AI tool for the way you want to learn." actions={<Link href="/explore" className="inline-flex rounded-lg bg-[var(--text)] px-4 py-2.5 text-sm font-medium text-[var(--bg)]">Choose a subject</Link>} />
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(({ name, description, icon: Icon }) => <article key={name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel-soft)]"><Icon size={18} /></div><h2 className="mt-5 font-semibold">{name}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p><Link href="/explore" className="mt-5 inline-flex text-sm font-medium text-violet-600 hover:text-violet-500">Choose subject →</Link></article>)}</div>
  </div></AppShell>;
}
