import { NextRequest, NextResponse } from "next/server";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subject = String(body?.subject || "").trim();
    const question = String(body?.question || "").trim();

    const conversation: ConversationMessage[] =
      Array.isArray(body?.conversation)
        ? body.conversation
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

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "Question is required.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const model =
      process.env.GEMINI_MODEL || "gemini-3.6-flash";

    /*
     * Convert the previous conversation into readable
     * context for Gemini.
     */

    const conversationContext =
      conversation.length > 0
        ? conversation
            .map((message) => {
              const speaker =
                message.role === "user"
                  ? "STUDENT"
                  : "STUDYFLOW AI";

              return `${speaker}:\n${message.content}`;
            })
            .join("\n\n")
        : "No previous conversation.";

    const prompt = `
You are StudyFlow AI Tutor.

The student is currently studying:

SUBJECT:
${subject}

You must act as a personal teacher for this subject.

Here is the previous conversation:

---------------- CONVERSATION ----------------

${conversationContext}

-------------- END CONVERSATION --------------

The student's NEW question is:

"${question}"

IMPORTANT INSTRUCTIONS:

1. Continue the conversation naturally.
2. Remember what was discussed earlier.
3. Understand references such as:
   - "it"
   - "this"
   - "that"
   - "the above"
   - "give me an example"
   - "explain that again"
   - "why?"
   - "how?"
4. If the student asks "give me an example", determine what concept they are referring to from the previous conversation.
5. Do not make the student repeat information that already exists in the conversation.
6. Stay focused on ${subject}.
7. If the student asks something unrelated to ${subject}, politely explain that the current tutor is focused on ${subject}.
8. Teach like a patient human teacher.
9. Use simple language when the student is confused.
10. Give deeper explanations when the student asks for more detail.
11. Use examples whenever useful.
12. For programming subjects, provide correct and readable code examples.
13. For mathematical concepts, explain the calculation step-by-step.
14. For theoretical subjects, use practical examples.
15. Do not invent facts.
16. Do not return JSON.
17. Return normal Markdown.

RESPONSE STYLE:

Use appropriate headings such as:

### Explanation

### Example

### Important Points

### Example Code

### Quick Check

You do NOT need to use every heading for every answer.

Do not repeat the entire previous conversation.

Answer the student's NEW question while using the previous conversation as context.
`;

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
      "GEMINI TUTOR RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.error?.message ||
            `Gemini API failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    let answer = "";

    if (
      typeof data?.output_text === "string" &&
      data.output_text.trim()
    ) {
      answer = data.output_text;
    }

    if (!answer && Array.isArray(data?.steps)) {
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
              answer += content.text;
            }
          }
        }
      }
    }

    if (!answer.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini returned an empty answer.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subject,
      answer: answer.trim(),
    });
  } catch (error) {
    console.error("TUTOR API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong with the AI Tutor.",
      },
      { status: 500 }
    );
  }
}