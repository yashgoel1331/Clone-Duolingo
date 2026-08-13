"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { refillHearts } from "@/lib/api/client";
import type { MeResponse, UserStats } from "@/lib/api/types";

type SupportShellProps = {
  me: MeResponse | null;
  title: string;
  subtitle: string;
  children: ReactNode;
};

function fallbackStats(): UserStats {
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

export function SupportShell({ children, me, subtitle, title }: SupportShellProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>(me?.stats ?? fallbackStats());
  const [refillingHearts, setRefillingHearts] = useState(false);

  const courseLevel = useMemo(() => Math.max(1, Math.floor(stats.total_xp / 100) + 1), [stats.total_xp]);
  const dailyGoalProgress = Math.min(stats.daily_xp, stats.daily_goal);

  const onRefillHearts = async () => {
    setRefillingHearts(true);
    try {
      const result = await refillHearts();
      setStats((previous) => ({
        ...previous,
        hearts: result.hearts,
        max_hearts: result.max_hearts,
        gems: result.gems,
      }));
      toast({
        variant: "success",
        message: result.refilled ? "Hearts refilled from practice." : "Hearts are already full.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not refill hearts.";
      toast({ variant: "error", message });
    } finally {
      setRefillingHearts(false);
    }
  };

  if (!me) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14">
        <ErrorState
          title="Could not load this page"
          description="Your learner profile is unavailable right now. Please return to Learn and retry."
        />
      </div>
    );
  }

  return (
    <AppShell
      stats={stats}
      courseLevel={courseLevel}
      dailyGoalProgress={dailyGoalProgress}
      onRefillHearts={onRefillHearts}
      refillingHearts={refillingHearts}
    >
      <header className="mb-5 rounded-3xl border-2 border-border/90 bg-card px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.9px] text-text-muted">{subtitle}</p>
        <h1 className="mt-1 text-3xl font-black tracking-[-0.3px] text-text">{title}</h1>
      </header>
      {children}
    </AppShell>
  );
}
