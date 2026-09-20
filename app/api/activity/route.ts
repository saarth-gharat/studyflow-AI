import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

const activityTypes = new Set([
  "video_view",
  "note_generated",
  "quiz_started",
  "quiz_completed",
  "tutor_session",
  "learning_path_generated",
  "learning_path_topic_opened",
  "planner_created",
  "planner_day_completed",
  "doubt_asked",
  "flashcards_generated",
  "flashcards_completed",
  "revision_started",
  "revision_completed",
  "practice_started",
  "practice_question_answered",
  "practice_completed",
  "practice_abandoned",
  "practice_score_recorded",
  "coding_challenge_completed",
]);

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const { data, error } = await supabase
    .from("activity_history")
    .select("id,activity_type,subject,topic,resource_id,title,metadata,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Activity history load error:", error);
    return NextResponse.json({ success: false, error: "Learning history is not available yet." }, { status: 503 });
  }

  return NextResponse.json({ success: true, activities: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  try {
    const body = await request.json();
    const activityType = String(body?.activityType || "");
    const subject = String(body?.subject || "").trim();
    const title = String(body?.title || "").trim();

    if (!activityTypes.has(activityType) || !subject || !title) {
      return NextResponse.json({ success: false, error: "Activity type, subject, and title are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("activity_history")
      .insert({
        user_id: user.id,
        activity_type: activityType,
        subject,
        topic: body?.topic ? String(body.topic) : null,
        resource_id: body?.resourceId ? String(body.resourceId) : null,
        title,
        metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, activity: data });
  } catch (error) {
    console.error("Activity history write error:", error);
    return NextResponse.json({ success: false, error: "Learning history is not available yet." }, { status: 503 });
  }
}
