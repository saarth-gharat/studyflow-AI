import { redirect } from "next/navigation";

export default async function QuizRedirect({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  redirect(`/learn/${encodeURIComponent(topic)}/quiz`);
}
