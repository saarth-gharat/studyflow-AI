import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

const resourceTypes = new Set(["video", "note", "learning_path", "topic"]);

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const { data, error } = await supabase
    .from("saved_resources")
    .select("id,resource_type,resource_id,title,description,thumbnail_url,metadata,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Saved resources load error:", error);
    return NextResponse.json({ success: false, error: "Saved resources are not available yet." }, { status: 503 });
  }

  return NextResponse.json({ success: true, resources: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  try {
    const body = await request.json();
    const resourceType = String(body?.resourceType || "");
    const resourceId = String(body?.resourceId || "").trim();
    const title = String(body?.title || "").trim();

    if (!resourceTypes.has(resourceType) || !resourceId || !title) {
      return NextResponse.json({ success: false, error: "Resource type, ID, and title are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_resources")
      .upsert({
        user_id: user.id,
        resource_type: resourceType,
        resource_id: resourceId,
        title,
        description: body?.description ? String(body.description) : null,
        thumbnail_url: body?.thumbnailUrl ? String(body.thumbnailUrl) : null,
        metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
      }, { onConflict: "user_id,resource_type,resource_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, resource: data });
  } catch (error) {
    console.error("Saved resource error:", error);
    return NextResponse.json({ success: false, error: "Unable to save this resource." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in." }, { status: 401 });

  const resourceType = request.nextUrl.searchParams.get("resourceType") || "";
  const resourceId = request.nextUrl.searchParams.get("resourceId") || "";
  if (!resourceTypes.has(resourceType) || !resourceId) {
    return NextResponse.json({ success: false, error: "Resource type and ID are required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_resources")
    .delete()
    .eq("user_id", user.id)
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId);

  if (error) {
    console.error("Saved resource delete error:", error);
    return NextResponse.json({ success: false, error: "Unable to remove this resource." }, { status: 503 });
  }

  return NextResponse.json({ success: true });
}
