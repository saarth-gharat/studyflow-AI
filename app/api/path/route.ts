import { NextRequest, NextResponse } from "next/server";

type PathTopic = { title: string; description: string; order: number };

function extractText(data: unknown) {
  const response = data as { output_text?: unknown; steps?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string" && response.output_text.trim()) return response.output_text;
  return response.steps?.flatMap((step) => step.type === "model_output" ? step.content ?? [] : [])
    .filter((content) => content.type === "text" && typeof content.text === "string")
    .map((content) => content.text ?? "").join("") ?? "";
}

function parsePath(text: string): PathTopic[] | null {
  try {
    const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()) as { topics?: unknown };
    if (!Array.isArray(parsed.topics) || parsed.topics.length < 4 || parsed.topics.length > 15) return null;
    const seen = new Set<string>();
    const topics = parsed.topics.map((topic, index) => {
      const value = topic as Partial<PathTopic>;
      const title = typeof value.title === "string" ? value.title.trim() : "";
      const description = typeof value.description === "string" ? value.description.trim() : "";
      if (!title || !description || title.length > 100 || description.length > 280) throw new Error("invalid topic");
      const key = title.toLocaleLowerCase();
      if (seen.has(key)) throw new Error("duplicate topic");
      seen.add(key);
      return { title, description, order: index + 1 };
    });
    return topics;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = String(body?.subject ?? "").trim();
    if (!subject || subject.length > 100) return NextResponse.json({ success: false, error: "Subject is required." }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "Learning path generation is unavailable." }, { status: 500 });

    const prompt = `You are StudyFlow AI, an expert curriculum designer. Create a concise, logical beginner-to-advanced learning path for the requested subject: ${subject}.

Adapt the topics to this specific subject. Use an educational progression, avoid duplicates, and include 6 to 12 topics. Each description must be one concise sentence. Return ONLY valid JSON in this exact structure:
{"subject":"${subject}","topics":[{"title":"Topic title","description":"Concise description","order":1}]}`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ model: process.env.GEMINI_MODEL || "gemini-3.6-flash", input: prompt }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ success: false, error: "Unable to create a learning path right now." }, { status: response.status });

    const topics = parsePath(extractText(data));
    if (!topics) return NextResponse.json({ success: false, error: "Unable to create a learning path right now." }, { status: 502 });
    return NextResponse.json({ success: true, subject, topics });
  } catch (error) {
    console.error("LEARNING PATH API ERROR:", error);
    return NextResponse.json({ success: false, error: "Unable to create a learning path right now." }, { status: 500 });
  }
}
