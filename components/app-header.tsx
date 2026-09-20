"use client";

import {
  Menu,
  Search,
  Sparkles,
} from "lucide-react";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && document.activeElement === document.body)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function search(event: React.FormEvent) {
    event.preventDefault();
    if (subject.trim()) router.push(`/learn/${encodeURIComponent(subject.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)] lg:hidden transition-colors"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>

          <form onSubmit={search} className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 sm:flex sm:w-72">
            <Search size={16} className="text-[var(--muted)]" />

            <input
              ref={inputRef}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Search anything..."
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            />

            <kbd className="rounded border border-[var(--border)] bg-[var(--panel)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
              /
            </kbd>
          </form>

          <div className="flex items-center gap-2 text-[var(--text)] sm:hidden">
            <Sparkles size={17} />
            <span className="text-sm font-semibold">StudyFlow AI</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
