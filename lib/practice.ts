export const practiceModes = ["recommended", "multiple_choice", "problem_solving", "coding", "writing", "scenario", "mixed"] as const;
export const practiceDifficulties = ["beginner", "intermediate", "advanced"] as const;

export type PracticeMode = (typeof practiceModes)[number];
export type PracticeDifficulty = (typeof practiceDifficulties)[number];

export type PracticeQuestion = {
  id: number;
  mode: Exclude<PracticeMode, "recommended" | "mixed">;
  question: string;
  options?: string[];
  answer?: string;
  numericAnswer?: number;
  starterCode?: string;
  hint?: string;
  explanation: string;
  topic: string;
};

export type PracticeSet = {
  subject: string;
  topic: string;
  mode: PracticeMode;
  difficulty: PracticeDifficulty;
  questions: PracticeQuestion[];
};

export function recommendedModes(subject: string): PracticeMode[] {
  const normalized = subject.toLowerCase();
  if (/python|javascript|typescript|java|c\+\+|programming|coding|software/.test(normalized)) return ["coding", "problem_solving", "multiple_choice"];
  if (/sql|database/.test(normalized)) return ["problem_solving", "multiple_choice", "short_answer" as PracticeMode];
  if (/math|calculus|physics|accounting|finance/.test(normalized)) return ["problem_solving", "multiple_choice"];
  if (/english|language|literature|writing/.test(normalized)) return ["writing", "multiple_choice", "problem_solving"];
  if (/history|geography|biology|chemistry|psychology|sociology|philosophy|law|business|marketing|cybersecurity|network/.test(normalized)) return ["multiple_choice", "scenario", "problem_solving"];
  return ["multiple_choice", "scenario", "problem_solving"];
}

export function displayMode(mode: PracticeMode) {
  return mode.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
