import { NextResponse } from "next/server";
import { GeminiRequestError, generateGeminiContent } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const subject = body.subject;
    const numberOfQuestions = body.numberOfQuestions || 10;
    const difficulty = body.difficulty || "medium";

    if (!subject) {
      return NextResponse.json(
        {
          error: "Subject was not provided.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing. Check your .env.local file.",
        },
        {
          status: 500,
        }
      );
    }

    const prompt = `
You are StudyFlow AI's educational quiz generator.

The student is currently studying:

"${subject}"

Generate exactly ${numberOfQuestions} multiple-choice questions.

Difficulty:
${difficulty}

IMPORTANT:

EVERY question MUST be directly related to "${subject}".

Do NOT create questions about:

- study habits
- learning techniques
- motivation
- generic education
- how to learn the subject

Instead, test actual knowledge of the subject.

For example:

Python:
variables, data types, functions, loops, classes,
objects, lists, tuples, dictionaries, sets,
exceptions, modules, file handling, decorators,
generators and Python libraries.

SQL:
SELECT, WHERE, JOIN, GROUP BY, HAVING,
subqueries, constraints, indexes,
normalization and transactions.

Operating Systems:
processes, threads, CPU scheduling,
deadlocks, memory management, paging,
virtual memory, file systems and synchronization.

Computer Networks:
OSI model, TCP/IP, TCP, UDP, IP addressing,
subnetting, routing, DNS, HTTP and network security.

Cybersecurity:
authentication, encryption, hashing,
malware, vulnerabilities, access control,
OWASP and security principles.

Java:
classes, objects, inheritance, polymorphism,
interfaces, exceptions, collections and JVM.

For any other subject, identify the actual academic
concepts belonging to that subject and create questions
about those concepts.

Each question must contain:

- exactly four options
- exactly one correct answer
- an explanation
- a specific topic

Return ONLY valid JSON.

Use this structure:

{
  "subject": "${subject}",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0,
      "explanation": "Explain why the answer is correct.",
      "topic": "Specific topic"
    }
  ]
}

Rules:

1. answer must be 0, 1, 2 or 3.
2. Exactly four options per question.
3. Only one option can be correct.
4. Questions must be factually accurate.
5. Questions must directly relate to ${subject}.
6. Avoid duplicate questions.
7. Try to test different concepts.
8. Explanations should be educational but concise.
9. Do not use Markdown.
10. Do not use code fences.
11. Do not add text before or after the JSON.
`;

    const geminiData = await generateGeminiContent({
      apiKey,
      prompt,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const generatedText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        {
          error:
            "Gemini did not return any quiz content.",
        },
        {
          status: 500,
        }
      );
    }

    let quiz;

    try {
      quiz = JSON.parse(generatedText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Gemini returned malformed quiz data. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !quiz.questions ||
      !Array.isArray(quiz.questions) ||
      quiz.questions.some(
        (question: unknown) =>
          !question ||
          typeof question !== "object" ||
          !Array.isArray((question as { options?: unknown }).options) ||
          (question as { options: unknown[] }).options.length !== 4 ||
          typeof (question as { question?: unknown }).question !== "string" ||
          ![0, 1, 2, 3].includes((question as { answer?: unknown }).answer as number) ||
          typeof (question as { explanation?: unknown }).explanation !== "string" ||
          typeof (question as { topic?: unknown }).topic !== "string"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini generated a response without questions.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      subject: subject,
      questions: quiz.questions,
    });

  } catch (error) {
    if (error instanceof GeminiRequestError) {
      if (error.retryable) {
        return NextResponse.json(
          {
            error:
              "Quiz generation is temporarily unavailable. Please try again in a moment.",
            code: "AI_TEMPORARILY_UNAVAILABLE",
            retryable: true,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: "Quiz generation failed. Please try again.",
          code: "AI_GENERATION_FAILED",
          retryable: false,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: "Quiz generation failed. Please try again.",
        code: "QUIZ_GENERATION_FAILED",
        retryable: false,
      },
      {
        status: 500,
      }
    );
  }
}