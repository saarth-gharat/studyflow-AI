import { createServerSupabaseClient } from "./server";

export async function saveStudyNotes(
  subject: string,
  title: string,
  content: unknown
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("study_notes")
    .insert({
      user_id: user.id,
      subject,
      title,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save study notes:", error);
    throw new Error("Failed to save study notes.");
  }

  return data;
}

export async function getLatestStudyNotes(subject: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("study_notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject", subject)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load study notes:", error);
    throw new Error("Failed to load study notes.");
  }

  return data;
}