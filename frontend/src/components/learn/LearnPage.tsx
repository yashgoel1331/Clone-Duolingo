"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getMe, getPath, refillHearts } from "@/lib/api/client";
import type { MeResponse, PathResponse, PathSkill } from "@/lib/api/types";

import { LearnPath } from "./LearnPath";

type LearnDataState = {
  me: MeResponse | null;
  path: PathResponse | null;
  loading: boolean;
  error: string | null;
};

type LearnPageProps = {
  initialMe: MeResponse | null;
  initialPath: PathResponse | null;
  initialError: string | null;
};

function fallbackStats() {
  return {
    total_xp: 0,
    weekly_xp: 0,
    daily_xp: 0,
    daily_goal: 10,
    hearts: 0,
    max_hearts: 5,
    current_streak: 0,
    gems: 0,
  };
}

function lessonIdForSkill(skill: PathSkill): number | null {
  if (!skill.lessons.length) return null;
  if (skill.status === "completed") {
    return skill.lessons[skill.lessons.length - 1]?.id ?? null;
  }
  const completedEstimate = Math.floor((skill.progress_percent * skill.lessons.length) / 100);
  const lessonIndex = Math.min(skill.lessons.length - 1, Math.max(0, completedEstimate));
  return skill.lessons[lessonIndex]?.id ?? null;
}

export function LearnPage({ initialError, initialMe, initialPath }: LearnPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<LearnDataState>({
    me: initialMe,
    path: initialPath,
    loading: false,
    error: initialError,
  });
  const [startingSkillId, setStartingSkillId] = useState<number | null>(null);
  const [refillingHearts, setRefillingHearts] = useState(false);

  const load = useCallback(async () => {
    try {
      const [me, path] = await Promise.all([getMe(), getPath()]);
      setState({ me, path, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load your learning path.";
      setState({ me: null, path: null, loading: false, error: message });
    }
  }, []);

  const onStartLesson = useCallback(
    async (skill: PathSkill, lessonId: number | null = lessonIdForSkill(skill)) => {
      if (!lessonId) {
        toast({ variant: "error", message: "No lesson found for this skill yet." });
        return;
      }

      setStartingSkillId(skill.id);
      toast({ variant: "info", message: "Opening lesson..." });
      router.push(`/lesson/${lessonId}`);
      setStartingSkillId(null);
    },
    [router, toast],
  );

  const onRefillHearts = useCallback(async () => {
    setRefillingHearts(true);
    try {
      const refilled = await refillHearts();
      setState((previous) =>
        previous.me
          ? {
              ...previous,
              me: {
                ...previous.me,
                stats: {
                  ...previous.me.stats,
                  hearts: refilled.hearts,
                  max_hearts: refilled.max_hearts,
                  gems: refilled.gems,
                },
              },
            }
          : previous,
      );
      toast({
        variant: refilled.refilled ? "success" : "info",
        message: refilled.refilled
          ? `Hearts restored to ${refilled.hearts}. -${refilled.gems_spent} gems.`
          : `Hearts are already full. -${refilled.gems_spent} gems.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not refill hearts.";
      toast({ variant: "error", message });
    } finally {
      setRefillingHearts(false);
    }
  }, [toast]);

  const stats = state.me?.stats ?? state.path?.stats ?? fallbackStats();
  const courseLevel = useMemo(() => {
    if (!state.path) return 1;
    const completed = state.path.units.flatMap((unit) => unit.skills).filter(
      (skill) => skill.status === "completed",
    ).length;
    return Math.max(1, completed + 1);
  }, [state.path]);

  const dailyGoalProgress = Math.min(stats.daily_xp, stats.daily_goal);

  return (
    <AppShell
      stats={stats}
      courseLevel={courseLevel}
      dailyGoalProgress={dailyGoalProgress}
      onRefillHearts={onRefillHearts}
      refillingHearts={refillingHearts}
    >
      {state.loading ? (
        <div className="flex min-h-[55vh] items-center justify-center">
          <Spinner size="lg" className="text-blue" />
        </div>
      ) : state.error ? (
        <ErrorState
          title="Could not load the Learn page"
          description={state.error}
          retryLabel="Retry"
          onRetry={() => {
            setState((previous) => ({ ...previous, loading: true, error: null }));
            void load();
          }}
        />
      ) : state.path ? (
        <LearnPath path={state.path} onStartLesson={onStartLesson} startingSkillId={startingSkillId} />
      ) : (
        <ErrorState title="Path missing" description="No learning path was returned by the API." />
      )}
    </AppShell>
  );
}
