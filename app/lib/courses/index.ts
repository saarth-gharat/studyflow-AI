import { pythonCourse } from "./python";

export function getCourse(subject: string) {
  const normalized = subject.toLowerCase().trim();

  if (normalized === "python") {
    return pythonCourse;
  }

  return [];
}

export function getChapter(subject: string, chapterId: string) {
  const course = getCourse(subject);

  return course.find((chapter) => chapter.id === chapterId);
}