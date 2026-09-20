import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

type PathTopic = { title: string; description: string; order: number };

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in to save a learning path." }, { status: 401 });

  try {
    const body = await request.json();
    const subject = String(body?.subject || "").trim();
    const topics: PathTopic[] = Array.isArray(body?.topics) ? body.topics : [];

    if (!subject || topics.length === 0 || topics.some((topic) => !topic?.title)) {
      return NextResponse.json({ success: false, error: "A subject and valid path topics are required." }, { status: 400 });
    }

    const { data: path, error: pathError } = await supabase
      .from("learning_paths")
      .insert({
        user_id: user.id,
        subject,
        title: `${subject} Learning Path`,
        description: `A personalized learning path for ${subject}.`,
      })
      .select("id,subject,title,description,created_at,updated_at")
      .single();

    if (pathError) throw pathError;

    const { error: topicsError } = await supabase.from("learning_path_topics").insert(
      topics.map((topic, index) => ({
        learning_path_id: path.id,
        order_index: Number(topic.order) || index + 1,
        stage: index < topics.length / 3 ? "beginner" : index < (topics.length * 2) / 3 ? "intermediate" : "advanced",
        title: String(topic.title),
        description: String(topic.description || ""),
      }))
    );

    if (topicsError) throw topicsError;

    const { error: savedError } = await supabase
      .from("saved_resources")
      .upsert({
        user_id: user.id,
        resource_type: "learning_path",
        resource_id: path.id,
        title: path.title,
        description: path.description,
        metadata: { subject: path.subject },
      }, { onConflict: "user_id,resource_type,resource_id" });

    if (savedError) throw savedError;

    return NextResponse.json({ success: true, path });
  } catch (error) {
    console.error("Learning path save error:", error);
    return NextResponse.json({ success: false, error: "Learning path persistence is not available yet." }, { status: 503 });
  }
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const { data, error } = await supabase
    .from("learning_paths")
    .select("id,subject,title,description,created_at,updated_at,learning_path_topics(id,order_index,stage,title,description)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Learning paths load error:", error);
    return NextResponse.json({ success: false, error: "Learning paths are not available yet." }, { status: 503 });
  }

  return NextResponse.json({ success: true, paths: data ?? [] });
}
