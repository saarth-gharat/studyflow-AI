import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subject = String(body?.subject || "").trim();

    const messages: Message[] = Array.isArray(
      body?.messages
    )
      ? body.messages
      : [];

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is required.",
        },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No conversation to save.",
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
          error: "You must be logged in to save a conversation.",
        },
        { status: 401 }
      );
    }

    const firstUserMessage =
      messages.find(
        (message) => message.role === "user"
      )?.content || "Study Session";

    const title =
      firstUserMessage.length > 60
        ? firstUserMessage.slice(0, 60) + "..."
        : firstUserMessage;

    const { data, error } = await supabase
      .from("tutor_conversations")
      .insert({
        user_id: user.id,
        subject,
        title,
        messages,
      })
      .select()
      .single();

    if (error) {
      console.error("SUPABASE SAVE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save conversation.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: data,
    });
  } catch (error) {
    console.error(
      "SAVE TUTOR ERROR:",
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