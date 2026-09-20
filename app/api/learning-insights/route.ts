import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

type Activity = {
  id: string;
  activity_type: string;
  subject: string;
  topic: string | null;
  resource_id: string | null;
  title: string;
  created_at: string;
};

type Attempt = {
  id: string;
  subject: string;
  topic: string | null;
  percentage: number;
  completed_at: string;
};

type Path = {
  id: string;
  subject: string;
  title: string;
  learning_path_topics?: { id: string; title: string; description: string | null; order_index: number }[];
};

function encodedSubject(subject: string) {
  return encodeURIComponent(subject);
}

function destinationFor(activity: Activity) {
  const subject = encodedSubject(activity.subject);
  if (activity.activity_type === "video_view") return `/learn/${subject}/videos`;
  if (activity.activity_type === "note_generated") return `/learn/${subject}/notes`;
  if (activity.activity_type === "quiz_completed") return `/learn/${subject}/quiz`;
  if (activity.activity_type === "tutor_session" || activity.activity_type === "doubt_asked") return activity.activity_type === "doubt_asked" ? "/doubts" : `/learn/${subject}/tutor`;
  if (activity.activity_type === "flashcards_generated" || activity.activity_type === "flashcards_completed") return `/flashcards?subject=${subject}&topic=${encodeURIComponent(activity.topic || "")}`;
  if (activity.activity_type === "practice_started" || activity.activity_type === "practice_completed") return `/practice?subject=${subject}&topic=${encodeURIComponent(activity.topic || "")}`;
  if (activity.activity_type === "planner_created" || activity.activity_type === "planner_day_completed") return "/planner";
  return `/learn/${subject}`;
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const [activityResult, attemptsResult, pathsResult] = await Promise.all([
    supabase.from("activity_history").select("id,activity_type,subject,topic,resource_id,title,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
    supabase.from("quiz_attempts").select("id,subject,topic,percentage,completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(50),
    supabase.from("learning_paths").select("id,subject,title,learning_path_topics(id,title,description,order_index)").eq("user_id", user.id).eq("status", "active").order("updated_at", { ascending: false }),
  ]);

  if (activityResult.error || attemptsResult.error || pathsResult.error) {
    console.error("Learning insights load error:", activityResult.error || attemptsResult.error || pathsResult.error);
    return NextResponse.json({ success: false, error: "Learning recommendations are unavailable right now." }, { status: 503 });
  }

  const activities = (activityResult.data ?? []) as Activity[];
  const attempts = (attemptsResult.data ?? []) as Attempt[];
  const paths = (pathsResult.data ?? []) as Path[];
  const openedTopics = new Set(activities.filter((activity) => activity.activity_type === "learning_path_topic_opened" && activity.topic).map((activity) => `${activity.subject.toLowerCase()}:${activity.topic?.toLowerCase()}`));

  let continuation: { subject: string; topic?: string; title: string; description: string; progress: number | null; lastActivity?: string; href: string; activityType?: string } | null = null;
  const pathTopic = paths.flatMap((path) => (path.learning_path_topics ?? []).map((topic) => ({ path, topic }))).find(({ path, topic }) => !openedTopics.has(`${path.subject.toLowerCase()}:${topic.title.toLowerCase()}`));
  if (pathTopic) {
    continuation = {
      subject: pathTopic.path.subject,
      topic: pathTopic.topic.title,
      title: pathTopic.topic.title,
      description: `Next in your ${pathTopic.path.title}.`,
      progress: null,
      href: `/learn/${encodedSubject(pathTopic.path.subject)}/path?topic=${encodeURIComponent(pathTopic.topic.title)}`,
      activityType: "learning_path_topic_opened",
    };
  } else {
    const recent = activities.find((activity) => ["video_view", "note_generated", "quiz_completed", "tutor_session", "doubt_asked", "flashcards_generated", "flashcards_completed", "practice_started", "practice_completed"].includes(activity.activity_type));
    if (recent) {
      const relevantAttempt = attempts.find((attempt) => attempt.subject === recent.subject && (!recent.topic || attempt.topic === recent.topic));
      continuation = {
        subject: recent.subject,
        topic: recent.topic || undefined,
        title: recent.topic || recent.title,
        description: "Continue where you last left off.",
        progress: relevantAttempt?.percentage ?? null,
        lastActivity: recent.title,
        href: destinationFor(recent),
        activityType: recent.activity_type,
      };
    }
  }

  let companion: { title: string; message: string; reason: string; primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryHref?: string; kind: string } | null = null;
  const lowAttempt = attempts.find((attempt) => attempt.percentage < 60);
  if (lowAttempt) {
    const topic = lowAttempt.topic || lowAttempt.subject;
    companion = { title: "A focused review could help", message: `Your latest ${topic} quiz score was ${lowAttempt.percentage}%.`, reason: "Review the concept, then practice it again.", primaryLabel: "Start 10-min revision", primaryHref: `/revision/${encodedSubject(lowAttempt.subject)}/${encodeURIComponent(topic)}`, secondaryLabel: "Practice flashcards", secondaryHref: `/flashcards?subject=${encodedSubject(lowAttempt.subject)}&topic=${encodeURIComponent(topic)}`, kind: "quiz_review" };
  } else if (pathTopic) {
    companion = { title: "Continue your learning path", message: `You have an unfinished topic in ${pathTopic.path.title}.`, reason: `Next up: ${pathTopic.topic.title}.`, primaryLabel: "Continue path", primaryHref: `/learn/${encodedSubject(pathTopic.path.subject)}/path?topic=${encodeURIComponent(pathTopic.topic.title)}`, kind: "path" };
  } else {
    const recent = activities.find((activity) => ["note_generated", "video_view", "flashcards_generated", "quiz_completed", "practice_completed"].includes(activity.activity_type));
    if (recent) {
      const topic = recent.topic || recent.subject;
      const nextAction = recent.activity_type === "quiz_completed" ? { label: "Review flashcards", href: `/flashcards?subject=${encodedSubject(recent.subject)}&topic=${encodeURIComponent(topic)}` } : recent.activity_type === "flashcards_generated" ? { label: "Take a quiz", href: `/learn/${encodedSubject(recent.subject)}/quiz` } : { label: "Practice again", href: `/practice?subject=${encodedSubject(recent.subject)}&topic=${encodeURIComponent(topic)}` };
      companion = { title: "A useful next step", message: `You recently worked on ${topic}.`, reason: "Keep the momentum with a short practice session.", primaryLabel: nextAction.label, primaryHref: nextAction.href, kind: "recent_activity" };
    }
  }

  return NextResponse.json({ success: true, continuation, companion });
}
