import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const [activityResult, attemptsResult, progressResult] = await Promise.all([
    supabase.from("activity_history").select("id,activity_type,subject,topic,title,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200),
    supabase.from("quiz_attempts").select("id,subject,topic,score,total_questions,percentage,completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(100),
    supabase.from("study_progress").select("subject,videos_progress,notes_progress,quiz_progress,tutor_progress").eq("user_id", user.id).order("subject"),
  ]);

  if (activityResult.error || attemptsResult.error || progressResult.error) {
    console.error("Analytics load error:", activityResult.error || attemptsResult.error || progressResult.error);
    return NextResponse.json({ success: false, error: "Learning analytics are not available yet." }, { status: 503 });
  }

  const activities = activityResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const activityCounts = activities.reduce<Record<string, number>>((counts, activity) => {
    counts[activity.activity_type] = (counts[activity.activity_type] || 0) + 1;
    return counts;
  }, {});
  const today = new Date();
  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toISOString().slice(0, 10),
      count: activities.filter((activity) => {
        const created = new Date(activity.created_at);
        return created >= date && created < next;
      }).length,
    };
  });

  return NextResponse.json({
    success: true,
    metrics: {
      activityTotal: activities.length,
      videosWatched: activityCounts.video_view || 0,
      notesGenerated: activityCounts.note_generated || 0,
      quizzesCompleted: activityCounts.quiz_completed || 0,
      flashcardsReviewed: activityCounts.flashcards_completed || 0,
      doubtsAsked: activityCounts.doubt_asked || 0,
      plansCreated: activityCounts.planner_created || 0,
      learningPathsCreated: activityCounts.learning_path_generated || 0,
      practiceSessions: activityCounts.practice_completed || 0,
      practiceQuestions: activityCounts.practice_question_answered || 0,
      codingChallengesCompleted: activityCounts.coding_challenge_completed || 0,
      averageQuizScore: attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length) : null,
      bestQuizScore: attempts.length ? Math.max(...attempts.map((attempt) => attempt.percentage)) : null,
    },
    dailyActivity,
    activities: activities.slice(0, 20),
    attempts: attempts.slice(0, 10),
    progress: progressResult.data ?? [],
  });
}
