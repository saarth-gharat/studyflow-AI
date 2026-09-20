import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";
import { practiceDifficulties, practiceModes, type PracticeQuestion, type PracticeSet } from "@/lib/practice";

function validQuestion(value: unknown): value is PracticeQuestion {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PracticeQuestion>;
  return typeof item.id === "number" && typeof item.mode === "string" && typeof item.question === "string" && typeof item.explanation === "string" && typeof item.topic === "string";
}

function parseJson(text: string) {
  return JSON.parse(text.replace(/```json|```/g, "").trim()) as unknown;
}

export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in to create a practice set." }, { status: 401 });
  try {
    const body = await request.json();
    const subject = String(body?.subject || "").trim();
    const topic = String(body?.topic || "").trim();
    const difficulty = practiceDifficulties.includes(body?.difficulty) ? body.difficulty : "beginner";
    const requestedMode = practiceModes.includes(body?.mode) ? body.mode : "recommended";
    const count = Math.min(10, Math.max(3, Number(body?.count || 5)));
    if (!subject || !topic) return NextResponse.json({ success: false, error: "Subject and topic are required." }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "AI practice generation is not configured." }, { status: 500 });
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const prompt = `You are StudyFlow AI's universal practice designer. Create exactly ${count} practice questions for subject "${subject}" and topic "${topic}" at ${difficulty} difficulty. Requested practice mode: ${requestedMode}. Adapt the mode to the subject. Programming may use coding questions, mathematics/physics may use problem_solving with numericAnswer, humanities/science may use multiple_choice or scenario, and English may use writing. Return only JSON: {"subject":"${subject}","topic":"${topic}","mode":"${requestedMode}","difficulty":"${difficulty}","questions":[{"id":1,"mode":"multiple_choice|problem_solving|coding|writing|scenario","question":"string","options":["string"],"answer":"string","numericAnswer":0,"starterCode":"string","hint":"string","explanation":"string","topic":"string"}]}. For multiple_choice include exactly four options and answer equal to the correct option. For coding, never claim execution and include starterCode and expected behavior in the explanation. Keep every question directly about the requested topic.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, responseMimeType: "application/json" } }) });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ success: false, error: "The AI could not create practice right now." }, { status: response.status });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") return NextResponse.json({ success: false, error: "The AI returned an empty practice set." }, { status: 502 });
    let parsed: unknown;
    try { parsed = parseJson(text); } catch { return NextResponse.json({ success: false, error: "The AI returned malformed practice data. Please try again." }, { status: 502 }); }
    const raw = parsed as Partial<PracticeSet>;
    const questions = Array.isArray(raw.questions) ? raw.questions.filter(validQuestion).slice(0, count) : [];
    if (questions.length < 3) return NextResponse.json({ success: false, error: "The AI returned too few usable questions. Please try again." }, { status: 502 });
    return NextResponse.json({ success: true, practice: { subject, topic, difficulty, mode: requestedMode, questions } satisfies PracticeSet });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to create practice right now." }, { status: 500 });
  }
}
