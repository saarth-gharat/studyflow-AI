import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in to save a quiz attempt." }, { status: 401 });

  try {
    const body = await request.json();
    const subject = String(body?.subject || "").trim();
    const score = Number(body?.score);
    const totalQuestions = Number(body?.totalQuestions);
    const percentage = Number(body?.percentage);

    if (!subject || !Number.isInteger(score) || !Number.isInteger(totalQuestions) || totalQuestions <= 0 || !Number.isInteger(percentage) || percentage < 0 || percentage > 100 || score < 0 || score > totalQuestions) {
      return NextResponse.json({ success: false, error: "Invalid quiz attempt." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        subject,
        topic: body?.topic ? String(body.topic) : null,
        score,
        total_questions: totalQuestions,
        percentage,
        answers: body?.answers && typeof body.answers === "object" ? body.answers : {},
        questions_snapshot: Array.isArray(body?.questions) ? body.questions : [],
        started_at: body?.startedAt || null,
        completed_at: new Date().toISOString(),
      })
      .select("id,subject,score,total_questions,percentage,completed_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, attempt: data });
  } catch (error) {
    console.error("Quiz attempt save error:", error);
    return NextResponse.json({ success: false, error: "Quiz history is not available yet." }, { status: 503 });
  }
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id,subject,topic,score,total_questions,percentage,completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Quiz attempts load error:", error);
    return NextResponse.json({ success: false, error: "Quiz history is not available yet." }, { status: 503 });
  }

  return NextResponse.json({ success: true, attempts: data ?? [] });
}
