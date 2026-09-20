"use client";

import { AppShell } from "@/components/app-shell";
import { useTheme, type Theme } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load your profile.");
        const name = data.profile?.full_name ?? "";
        setEmail(data.profile?.email ?? "");
        setFullName(name);
        setEditingName(name);
      } catch (loadError) {
        setSaveError(loadError instanceof Error ? loadError.message : "Unable to load your profile.");
      } finally {
        setProfileLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSaveProfile() {
    if (!editingName.trim()) {
      setSaveError("Full name cannot be empty");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: editingName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Failed to update profile");
        return;
      }

      setFullName(data.profile.full_name);
      setSaveMessage("Profile updated successfully");
      setIsEditing(false);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditingName(fullName);
    setIsEditing(false);
    setSaveError("");
    setSaveMessage("");
  }

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-5">
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em]">Settings</h1>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <h2 className="text-base font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Choose how StudyFlow looks on this device.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["light", "dark", "system"] as Theme[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-xl border px-3.5 py-2 text-sm font-medium capitalize transition ${
                  theme === option ? "border-violet-500 bg-violet-500 text-white" : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-violet-500/30"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <h2 className="text-base font-semibold">Profile</h2>
          
          {saveMessage && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-sm text-emerald-600">{saveMessage}</p>
            </div>
          )}

          {saveError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          {profileLoading && <p aria-live="polite" className="mt-4 text-sm text-[var(--muted)]">Loading profile...</p>}

          {!profileLoading && <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
                {(fullName || email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{fullName || "Learner"}</p>
                <p className="truncate text-xs text-[var(--muted)]">{email || "No email available"}</p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-sm font-medium text-violet-600 hover:bg-violet-500/20"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-[var(--text)]">
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text)]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-[var(--muted)] outline-none cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">Email cannot be changed here. Contact support to update your email address.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--panel)] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <h2 className="text-base font-semibold">Account actions</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{email ? `Signed in as ${email}` : "You are not signed in."}</p>
          <button type="button" onClick={logout} className="mt-4 inline-flex items-center rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20">
            Log out
          </button>
        </section>
      </div>
    </AppShell>
  );
}
