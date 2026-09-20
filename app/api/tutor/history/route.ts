import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const subject =
      request.nextUrl.searchParams.get(
        "subject"
      );

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to load tutor history.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("tutor_conversations")
      .select("id,subject,title,created_at,updated_at")
      .eq("user_id", user.id)
      .eq("subject", subject)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      conversations: data,
    });
  } catch (error) {
    console.error(
      "TUTOR HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}