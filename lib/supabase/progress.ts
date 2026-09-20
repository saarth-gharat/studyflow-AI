import { createClient } from "./client";

export type ProgressType =
  | "videos_progress"
  | "notes_progress"
  | "quiz_progress"
  | "tutor_progress";

export async function getUserProgress(subject: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("study_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject", subject)
    .maybeSingle();

  if (error) {
    console.error("Failed to load progress:", error);
    throw new Error("Failed to load study progress.");
  }

  return data;
}

export async function saveProgress(
  subject: string,
  progressType: ProgressType,
  progress: number
) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const safeProgress = Math.max(
    0,
    Math.min(100, Math.round(progress))
  );

  const { data: existing, error: existingError } = await supabase
    .from("study_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("subject", subject)
    .maybeSingle();

  if (existingError) {
    console.error("Failed to check progress:", existingError);
    throw new Error("Failed to check study progress.");
  }

  // Existing progress record → update it
  if (existing) {
    const { data, error } = await supabase
      .from("study_progress")
      .update({
        [progressType]: safeProgress,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update progress:", error);
      throw new Error("Failed to update study progress.");
    }

    return data;
  }

  // No progress record → create one
  const { data, error } = await supabase
    .from("study_progress")
    .insert({
      user_id: user.id,
      subject,
      videos_progress:
        progressType === "videos_progress" ? safeProgress : 0,
      notes_progress:
        progressType === "notes_progress" ? safeProgress : 0,
      quiz_progress:
        progressType === "quiz_progress" ? safeProgress : 0,
      tutor_progress:
        progressType === "tutor_progress" ? safeProgress : 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create progress:", error);
    throw new Error("Failed to create study progress.");
  }

  return data;
}