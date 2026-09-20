"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile({
        name: data?.full_name ?? userData.user.email?.split("@")[0] ?? "Learner",
        email: userData.user.email ?? "",
      });
    }

    void loadProfile();
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const initials = profile.email ? profile.email.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Open user menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white shadow-sm shadow-violet-500/25"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 text-[var(--text)] shadow-xl">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">{profile.email || "Guest"}</p>
          </div>

          <Link onClick={() => setOpen(false)} href="/settings" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--panel-soft)]">
            <UserRound size={15} /> Profile
          </Link>
          <Link onClick={() => setOpen(false)} href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--panel-soft)]">
            <Settings size={15} /> Settings
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--panel-soft)]">
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
