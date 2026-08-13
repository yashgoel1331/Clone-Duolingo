import { notFound } from "next/navigation";

import { LessonSession } from "@/components/lesson/LessonSession";

type LessonPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const parsedId = Number(lessonId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    notFound();
  }

  return <LessonSession lessonId={parsedId} />;
}
