"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  subject: string;
};

type Topic = {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  level: string;
};

const pythonTopics: Topic[] = [
  {
    id: "introduction",
    number: 1,
    title: "Introduction to Python",
    description: "Understand Python and write your first program.",
    duration: "45 min",
    level: "Beginner",
  },
  {
    id: "fundamentals",
    number: 2,
    title: "Python Fundamentals",
    description: "Variables, data types, syntax and type conversion.",
    duration: "60 min",
    level: "Beginner",
  },
  {
    id: "operators",
    number: 3,
    title: "Operators",
    description: "Arithmetic, comparison and logical operations.",
    duration: "50 min",
    level: "Beginner",
  },
  {
    id: "strings",
    number: 4,
    title: "Strings",
    description: "Work with text, string methods and formatting.",
    duration: "60 min",
    level: "Beginner",
  },
  {
    id: "lists",
    number: 5,
    title: "Lists",
    description: "Learn indexing, slicing, methods and comprehensions.",
    duration: "60 min",
    level: "Beginner",
  },
  {
    id: "tuples",
    number: 6,
    title: "Tuples",
    description: "Understand immutable collections.",
    duration: "30 min",
    level: "Beginner",
  },
  {
    id: "sets",
    number: 7,
    title: "Sets",
    description: "Learn unique collections and set operations.",
    duration: "35 min",
    level: "Beginner",
  },
  {
    id: "dictionaries",
    number: 8,
    title: "Dictionaries",
    description: "Store and retrieve data using key-value pairs.",
    duration: "50 min",
    level: "Beginner",
  },
  {
    id: "conditions",
    number: 9,
    title: "Conditional Statements",
    description: "Make decisions using if, elif and else.",
    duration: "40 min",
    level: "Beginner",
  },
  {
    id: "loops",
    number: 10,
    title: "Loops",
    description: "Repeat operations using for and while loops.",
    duration: "50 min",
    level: "Beginner",
  },
  {
    id: "functions",
    number: 11,
    title: "Functions",
    description: "Create reusable blocks of code.",
    duration: "70 min",
    level: "Intermediate",
  },
  {
    id: "recursion",
    number: 12,
    title: "Recursion",
    description: "Understand recursive problem solving.",
    duration: "45 min",
    level: "Intermediate",
  },
  {
    id: "modules",
    number: 13,
    title: "Modules and Packages",
    description: "Organize Python applications into reusable modules.",
    duration: "45 min",
    level: "Intermediate",
  },
  {
    id: "file-handling",
    number: 14,
    title: "File Handling",
    description: "Read and write files with Python.",
    duration: "50 min",
    level: "Intermediate",
  },
  {
    id: "exceptions",
    number: 15,
    title: "Exception Handling",
    description: "Handle runtime errors safely.",
    duration: "50 min",
    level: "Intermediate",
  },
  {
    id: "oop",
    number: 16,
    title: "Object-Oriented Programming",
    description: "Classes, objects, inheritance and polymorphism.",
    duration: "90 min",
    level: "Intermediate",
  },
  {
    id: "iterators-generators",
    number: 17,
    title: "Iterators and Generators",
    description: "Learn lazy iteration and generators.",
    duration: "60 min",
    level: "Advanced",
  },
  {
    id: "decorators",
    number: 18,
    title: "Decorators",
    description: "Modify and extend function behavior.",
    duration: "60 min",
    level: "Advanced",
  },
  {
    id: "regex",
    number: 19,
    title: "Regular Expressions",
    description: "Pattern matching and text processing.",
    duration: "60 min",
    level: "Advanced",
  },
  {
    id: "pip-environments",
    number: 20,
    title: "pip and Virtual Environments",
    description: "Manage Python packages and environments.",
    duration: "45 min",
    level: "Intermediate",
  },
  {
    id: "apis",
    number: 21,
    title: "Working with APIs",
    description: "Connect Python applications to external services.",
    duration: "60 min",
    level: "Intermediate",
  },
  {
    id: "numpy",
    number: 22,
    title: "NumPy",
    description: "Learn numerical computing with NumPy.",
    duration: "90 min",
    level: "Intermediate",
  },
  {
    id: "pandas",
    number: 23,
    title: "Pandas",
    description: "Analyze and manipulate structured data.",
    duration: "90 min",
    level: "Intermediate",
  },
  {
    id: "visualization",
    number: 24,
    title: "Data Visualization",
    description: "Create charts and communicate data insights.",
    duration: "75 min",
    level: "Intermediate",
  },
  {
    id: "python-sql",
    number: 25,
    title: "Python with SQL",
    description: "Connect Python applications with databases.",
    duration: "90 min",
    level: "Advanced",
  },
  {
    id: "projects",
    number: 26,
    title: "Python Projects",
    description: "Build practical projects to strengthen your skills.",
    duration: "120 min",
    level: "Advanced",
  },
  {
    id: "interview",
    number: 27,
    title: "Python Interview Preparation",
    description: "Prepare for Python technical interviews.",
    duration: "90 min",
    level: "Advanced",
  },
];

function getTopics(subject: string): Topic[] {
  if (subject.toLowerCase().trim() === "python") {
    return pythonTopics;
  }

  return [
    {
      id: "introduction",
      number: 1,
      title: `Introduction to ${subject}`,
      description: `Learn the fundamentals of ${subject}.`,
      duration: "30 min",
      level: "Beginner",
    },
    {
      id: "fundamentals",
      number: 2,
      title: "Fundamentals",
      description: `Understand the core concepts of ${subject}.`,
      duration: "45 min",
      level: "Beginner",
    },
    {
      id: "intermediate",
      number: 3,
      title: "Intermediate Concepts",
      description: `Explore practical ${subject} concepts.`,
      duration: "60 min",
      level: "Intermediate",
    },
    {
      id: "advanced",
      number: 4,
      title: "Advanced Concepts",
      description: `Learn advanced topics in ${subject}.`,
      duration: "75 min",
      level: "Advanced",
    },
  ];
}

export default function LearningRoadmap({ subject }: Props) {
  const topics = getTopics(subject);

  const [completed, setCompleted] = useState<string[]>([]);

  const progress = Math.round(
    (completed.length / topics.length) * 100
  );

  function toggleTopic(id: string) {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
    <section className="mt-20">

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-medium tracking-widest text-violet-400">
            LEARNING ROADMAP
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Complete {subject} course
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Follow the structured path from fundamentals to advanced
            concepts.
          </p>

        </div>

        <div className="min-w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">

          <div className="flex justify-between">

            <span className="text-xs text-[var(--muted)]">
              PROGRESS
            </span>

            <span className="text-sm font-semibold">
              {progress}%
            </span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--panel-soft)]">

            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <p className="mt-2 text-xs text-[var(--muted)]">
            {completed.length} / {topics.length} completed
          </p>

        </div>

      </div>

      <div className="mt-10 space-y-4">

        {topics.map((topic) => {

          const isCompleted = completed.includes(topic.id);

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border p-5 transition ${
                isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                  : "border-[var(--border)] bg-[var(--panel)] hover:border-violet-500/30"
              }`}
            >

              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm ${
                    isCompleted
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-violet-400"
                  }`}
                >
                  {isCompleted ? "✓" : topic.number}
                </button>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-3 md:flex-row md:justify-between">

                    <div>

                      <h3 className="font-semibold">
                        {topic.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {topic.description}
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <span className="h-fit rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)]">
                        {topic.level}
                      </span>

                      <span className="h-fit rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)]">
                        {topic.duration}
                      </span>

                    </div>

                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">

                    <Link
                      href="#videos"
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
                    >
                      🎬 Video
                    </Link>

                    <Link
                      href={`/learn/${encodeURIComponent(subject)}/notes/${topic.id}`}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
                    >
                      📝 Notes
                    </Link>

                    <Link
                      href={`/learn/${encodeURIComponent(subject)}/quiz?chapter=${topic.id}`}
                      className="rounded-lg border border-violet-500/20 bg-violet-500/[0.05] px-3 py-2 text-xs text-violet-400 hover:bg-violet-500/10"
                    >
                      🧠 Quiz
                    </Link>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}