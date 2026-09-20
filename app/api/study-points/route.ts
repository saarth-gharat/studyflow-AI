import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

const pointValues: Record<string, number> = {
  video_view: 10,
  note_generated: 10,
  quiz_completed: 15,
  practice_completed: 15,
  flashcards_completed: 10,
  revision_completed: 10,
  planner_day_completed: 10,
  learning_path_topic_opened: 10,
};

const taskDefinitions = [
  { key: "learning", label: "Learning activity", points: 10, types: ["video_view", "note_generated", "learning_path_topic_opened", "planner_day_completed"] },
  { key: "quiz", label: "Complete a quiz", points: 15, types: ["quiz_completed"] },
  { key: "practice", label: "Practice a topic", points: 15, types: ["practice_completed", "flashcards_completed", "revision_completed"] },
];

function localDayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function isDuplicateActivity(activity: { activity_type: string; subject: string; topic: string | null; title: string; created_at: string }, previous: typeof activity) {
  return activity.activity_type === previous.activity_type
    && activity.subject === previous.subject
    && activity.topic === previous.topic
    && activity.title === previous.title
    && Math.abs(new Date(activity.created_at).getTime() - new Date(previous.created_at).getTime()) < 5000;
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const { data, error } = await supabase
    .from("activity_history")
    .select("id,activity_type,subject,topic,title,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1000);

  if (error) {
    console.error("Study points load error:", error);
    return NextResponse.json({ success: false, error: "Study points are unavailable right now." }, { status: 503 });
  }

  const activities = (data ?? []).filter((activity, index, all) => {
    if (!pointValues[activity.activity_type]) return false;
    return !all.slice(0, index).some((previous) => isDuplicateActivity(activity, previous));
  });
  const { start, end } = localDayBounds();
  const todayActivities = activities.filter((activity) => {
    const created = new Date(activity.created_at);
    return created >= start && created < end;
  });
  const pointsFor = (items: typeof activities) => items.reduce((total, activity) => total + pointValues[activity.activity_type], 0);
  const todayTypes = new Set(todayActivities.map((activity) => activity.activity_type));

  return NextResponse.json({
    success: true,
    totalPoints: pointsFor(activities),
    todayPoints: pointsFor(todayActivities),
    dailyGoal: 35,
    tasks: taskDefinitions.map((task) => ({
      ...task,
      completed: task.types.some((type) => todayTypes.has(type)),
    })),
  });
}