import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: queryError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, created_at, updated_at")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: userData.user.email,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name } = body;

    // Validate input
    if (full_name !== undefined && typeof full_name !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid full_name" },
        { status: 400 }
      );
    }

    if (full_name !== undefined && full_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Full name cannot be empty" },
        { status: 400 }
      );
    }

    // Only allow updating full_name
    const updateData: { full_name?: string } = {};
    if (full_name !== undefined) {
      updateData.full_name = full_name.trim();
    }

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userData.user.id)
      .select("id, full_name, avatar_url, created_at, updated_at")
      .maybeSingle();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: userData.user.email,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
