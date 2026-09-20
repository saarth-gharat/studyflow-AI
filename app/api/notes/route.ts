import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subject = String(body?.subject || "").trim();

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject is required",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 1. CONNECT TO SUPABASE
     * ---------------------------------------------------------
     */

    const supabase = await createServerSupabaseClient();

    /*
     * ---------------------------------------------------------
     * 2. GET CURRENTLY LOGGED-IN USER
     * ---------------------------------------------------------
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("SUPABASE USER ERROR:", userError);
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to generate study notes.",
        },
        { status: 401 }
      );
    }

    console.log("Logged in user:", user.id);
    console.log("Requested subject:", subject);

    /*
     * ---------------------------------------------------------
     * 3. CHECK IF NOTES ALREADY EXIST IN SUPABASE
     * ---------------------------------------------------------
     */

    const { data: existingNote, error: existingError } =
      await supabase
        .from("study_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject", subject)
        .maybeSingle();

    if (existingError) {
      console.error(
        "SUPABASE EXISTING NOTES ERROR:",
        existingError
      );
    }

    /*
     * If notes already exist, return them.
     *
     * This prevents Gemini from generating the same notes
     * every time the user opens the page.
     */

    if (existingNote) {
      console.log("Returning saved notes from Supabase.");

      return NextResponse.json({
        success: true,
        source: "supabase",
        notes: existingNote.content,
      });
    }

    /*
     * ---------------------------------------------------------
     * 4. GEMINI API KEY
     * ---------------------------------------------------------
     */

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is missing in .env.local",
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. GEMINI MODEL
     * ---------------------------------------------------------
     */

    const model =
      process.env.GEMINI_MODEL || "gemini-3.6-flash";

    /*
     * ---------------------------------------------------------
     * 6. PROMPT
     * ---------------------------------------------------------
     */

    const prompt = `
You are StudyFlow AI, an expert teacher.

Create complete study notes for:

SUBJECT: ${subject}

The notes MUST be ONLY about ${subject}.

The student wants to learn this subject from beginner to advanced level.

Create:

1. A subject description
2. Multiple chapters
3. Topics inside every chapter
4. Detailed explanations
5. Examples
6. Important points
7. Quick revision points
8. Important exam questions
9. Key terms

For programming subjects, include programming examples when useful.

For theoretical subjects, include practical examples.

Do NOT talk about unrelated subjects.

Return ONLY valid JSON in exactly this structure:

{
  "subject": "${subject}",
  "description": "description of the subject",
  "chapters": [
    {
      "title": "Chapter name",
      "overview": "Chapter overview",
      "topics": [
        {
          "title": "Topic name",
          "explanation": "Detailed explanation",
          "example": "Example",
          "important": [
            "Important point",
            "Important point"
          ]
        }
      ]
    }
  ],
  "quickRevision": [
    "Revision point 1",
    "Revision point 2"
  ],
  "importantQuestions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5",
    "Question 6",
    "Question 7",
    "Question 8",
    "Question 9",
    "Question 10"
  ],
  "keyTerms": [
    {
      "term": "Term",
      "meaning": "Meaning"
    }
  ]
}

Create at least 6 chapters for a normal academic subject.

Create at least 4 topics inside each chapter.

Create at least 10 important questions.

Create at least 10 key terms.

Keep the explanations useful for actual studying.
`;

    /*
     * ---------------------------------------------------------
     * 7. CALL GEMINI
     * ---------------------------------------------------------
     */

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          model,
          input: prompt,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "GEMINI NOTES RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    /*
     * ---------------------------------------------------------
     * 8. HANDLE GEMINI ERROR
     * ---------------------------------------------------------
     */

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.error?.message ||
            `Gemini API error: ${response.status}`,
        },
        {
          status: response.status,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 9. EXTRACT GEMINI TEXT
     * ---------------------------------------------------------
     */

    let text = "";

    if (data?.output_text) {
      text = data.output_text;
    }

    if (!text && Array.isArray(data?.steps)) {
      for (const step of data.steps) {
        if (
          step?.type === "model_output" &&
          Array.isArray(step?.content)
        ) {
          for (const content of step.content) {
            if (
              content?.type === "text" &&
              typeof content?.text === "string"
            ) {
              text += content.text;
            }
          }
        }
      }
    }

    /*
     * ---------------------------------------------------------
     * 10. CHECK GEMINI TEXT
     * ---------------------------------------------------------
     */

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini returned no text.",
          rawResponse: data,
        },
        {
          status: 500,
        }
      );
    }

    console.log("GEMINI NOTES TEXT:", text);

    /*
     * ---------------------------------------------------------
     * 11. REMOVE MARKDOWN CODE FENCES
     * ---------------------------------------------------------
     */

    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    /*
     * ---------------------------------------------------------
     * 12. PARSE JSON
     * ---------------------------------------------------------
     */

    let notes;

    try {
      notes = JSON.parse(text);
    } catch (error) {
      console.error(
        "NOTES JSON PARSE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Gemini returned invalid JSON.",
          rawText: text,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 13. MAKE RESPONSE SAFE
     * ---------------------------------------------------------
     */

    const safeNotes = {
      subject: notes?.subject || subject,

      description:
        notes?.description ||
        `Complete study notes for ${subject}.`,

      chapters: Array.isArray(notes?.chapters)
        ? notes.chapters
        : [],

      quickRevision: Array.isArray(
        notes?.quickRevision
      )
        ? notes.quickRevision
        : [],

      importantQuestions: Array.isArray(
        notes?.importantQuestions
      )
        ? notes.importantQuestions
        : [],

      keyTerms: Array.isArray(notes?.keyTerms)
        ? notes.keyTerms
        : [],
    };

    /*
     * ---------------------------------------------------------
     * 14. CHECK CHAPTERS
     * ---------------------------------------------------------
     */

    if (safeNotes.chapters.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini generated the response but no chapters were found.",
          rawNotes: notes,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 15. SAVE NOTES TO SUPABASE
     * ---------------------------------------------------------
     */

    const { data: savedNote, error: saveError } =
      await supabase
        .from("study_notes")
        .insert({
          user_id: user.id,
          subject: subject,
          title: `AI Study Notes - ${subject}`,
          content: safeNotes,
        })
        .select()
        .single();

    if (saveError) {
      console.error(
        "SUPABASE SAVE NOTES ERROR:",
        saveError
      );

      /*
       * We don't stop the application here.
       *
       * Even if Supabase saving fails, the user can still
       * receive the generated notes.
       */

      return NextResponse.json({
        success: true,
        source: "gemini",
        saved: false,
        notes: safeNotes,
        warning:
          "Notes generated successfully but could not be saved to Supabase.",
      });
    }

    console.log(
      "NOTES SAVED TO SUPABASE:",
      savedNote?.id
    );

    /*
     * ---------------------------------------------------------
     * 16. RETURN NOTES TO FRONTEND
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      source: "gemini",
      saved: true,
      notes: safeNotes,
    });
  } catch (error) {
    console.error(
      "NOTES API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Notes API error",
      },
      {
        status: 500,
      }
    );
  }
}
