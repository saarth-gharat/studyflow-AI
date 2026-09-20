import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/authenticated";

type Flashcard = { question: string; answer: string; topic: string };

function isFlashcard(value: unknown): value is Flashcard {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<Flashcard>;
  return typeof card.question === "string" && Boolean(card.question.trim())
    && typeof card.answer === "string" && Boolean(card.answer.trim())
    && typeof card.topic === "string" && Boolean(card.topic.trim());
}

export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: "You must be logged in to generate flashcards." }, { status: 401 });

  try {
    const body = await request.json();
    const subject = String(body?.subject || "").trim();
    const topic = String(body?.topic || "").trim();
    const count = Math.min(20, Math.max(3, Number(body?.count || 10)));

    if (!subject || !topic) {
      return NextResponse.json({ success: false, error: "Subject and topic are required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "AI generation is not configured." }, { status: 500 });

    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const prompt = `You are StudyFlow AI, an expert learning assistant. Create exactly ${count} useful flashcards about ${subject}, focused on ${topic}. Return only valid JSON in this shape: {"cards":[{"question":"string","answer":"string","topic":"string"}]}. Keep answers concise but educational. Do not include markdown or extra keys.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, responseMimeType: "application/json" } }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ success: false, error: "The AI could not generate flashcards right now." }, { status: response.status });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) return NextResponse.json({ success: false, error: "The AI returned an empty flashcard set." }, { status: 502 });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ success: false, error: "The AI returned an invalid flashcard format. Please try again." }, { status: 502 });
    }

    const cards = Array.isArray((parsed as { cards?: unknown })?.cards)
      ? (parsed as { cards: unknown[] }).cards.filter(isFlashcard).slice(0, count)
      : [];
    if (cards.length < 3) return NextResponse.json({ success: false, error: "The AI returned too few usable flashcards. Please try again." }, { status: 502 });

    return NextResponse.json({ success: true, subject, topic, cards });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to generate flashcards right now." }, { status: 500 });
  }
}
