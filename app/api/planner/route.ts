import { NextRequest, NextResponse } from "next/server";

const MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

function isValidPlan(value: unknown): value is { title: string; description: string; subject: string; level: string; duration: number; hoursPerDay: number; goal: string; days: unknown[] } {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;
  return typeof plan.title === "string"
    && typeof plan.description === "string"
    && typeof plan.subject === "string"
    && typeof plan.level === "string"
    && typeof plan.duration === "number"
    && typeof plan.hoursPerDay === "number"
    && typeof plan.goal === "string"
    && Array.isArray(plan.days)
    && plan.days.length > 0
    && plan.days.every((day) => {
      if (!day || typeof day !== "object") return false;
      const item = day as Record<string, unknown>;
      return typeof item.day === "number" && typeof item.title === "string" && typeof item.goal === "string" && typeof item.estimatedHours === "number" && Array.isArray(item.topics) && Array.isArray(item.practice);
    });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subject = String(body.subject || "").trim();
    const level = String(body.level || "Beginner").trim();
    const duration = Number(body.duration || 30);
    const hoursPerDay = Number(body.hoursPerDay || 2);
    const goal = String(body.goal || "Learn the subject").trim();
    const targetDate = String(body.targetDate || "").trim();
    const preferredDays = Array.isArray(body.preferredDays) ? body.preferredDays.map((day: unknown) => String(day)).slice(0, 7) : [];

    if (!subject || !Number.isInteger(duration) || duration < 1 || duration > 180 || !Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 24) {
      return NextResponse.json(
        {
          error: "Subject is required.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add it to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const prompt = `
You are StudyFlow AI, an expert educational planner.

Create a personalized study plan for a student.

SUBJECT:
${subject}

STUDENT LEVEL:
${level}

STUDY DURATION:
${duration} days

AVAILABLE STUDY TIME:
${hoursPerDay} hours per day

STUDENT GOAL:
${goal}

TARGET DATE:
${targetDate || "Not specified"}

PREFERRED STUDY DAYS:
${preferredDays.length > 0 ? preferredDays.join(", ") : "Any day"}

IMPORTANT RULES:

1. The entire plan MUST be about "${subject}".
2. Do not include unrelated subjects.
3. Start from the student's selected level.
4. Progress from fundamentals to advanced concepts where appropriate.
5. Divide the plan across exactly ${duration} days.
6. Each day should have realistic tasks for approximately ${hoursPerDay} hours.
7. Include theory, examples, practice and revision where appropriate.
8. Include a small daily goal.
9. Include estimated study time for each task.
10. Include a weekly revision/test day when appropriate.
11. Do not make the plan unnecessarily difficult.
12. Make the roadmap useful for an actual student.

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "string",
  "description": "string",
  "subject": "string",
  "level": "string",
  "duration": number,
  "hoursPerDay": number,
  "goal": "string",
  "days": [
    {
      "day": number,
      "title": "string",
      "goal": "string",
      "estimatedHours": number,
      "topics": [
        {
          "name": "string",
          "description": "string",
          "minutes": number
        }
      ],
      "practice": [
        "string"
      ],
      "completed": false
    }
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini planner error:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Gemini failed to generate the study plan.",
        },
        {
          status: response.status,
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "The AI returned an empty study plan.",
        },
        { status: 500 }
      );
    }

    let plan;

    try {
      plan = JSON.parse(text);
    } catch {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        plan = JSON.parse(cleaned);
      } catch {
        console.error(
          "Could not parse planner JSON:",
          text
        );

        return NextResponse.json(
          {
            error:
              "The AI returned an invalid study plan format.",
          },
          { status: 500 }
        );
      }
    }

    if (!isValidPlan(plan)) {
      return NextResponse.json({ error: "The AI returned an invalid study plan structure." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Planner API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the study plan.",
      },
      { status: 500 }
    );
  }
}