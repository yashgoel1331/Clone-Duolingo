import { LearnPage } from "@/components/learn/LearnPage";
import { getMe, getPath } from "@/lib/api/client";

export default async function Home() {
  let initialMe = null;
  let initialPath = null;
  let initialError: string | null = null;

  try {
    [initialMe, initialPath] = await Promise.all([getMe(), getPath()]);
  } catch (error) {
    initialError = error instanceof Error ? error.message : "Failed to load the Learn page.";
  }

  return <LearnPage initialMe={initialMe} initialPath={initialPath} initialError={initialError} />;
}
