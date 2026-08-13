"use client";

import { Zap } from "lucide-react";

import {
  ChestIcon,
  SleepingAnimalIllustration,
  WingedCreatureIllustration,
} from "@/components/icons";
import type { UserStats } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

import { TopStats } from "./TopStats";

type RightRailProps = {
  stats: UserStats;
  courseLevel: number;
  dailyGoalProgress: number;
  onRefillHearts: () => Promise<void>;
  refillingHearts: boolean;
};

export function RightRail({
  courseLevel,
  dailyGoalProgress,
  onRefillHearts,
  refillingHearts,
  stats,
}: RightRailProps) {
  return (
    <aside className="min-w-0 pb-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:pb-10">
      <div className="sticky top-0 z-20 hidden bg-bg pb-2 pt-3 xl:block">
        <TopStats stats={stats} courseLevel={courseLevel} />
      </div>

      <div className="flex flex-col gap-3 pt-1 xl:pt-3">
        <Card className="hidden xl:block">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-text">Try Super for free</h2>
              <p className="mt-2 text-sm font-bold leading-5 text-[#91a3ab]">
                No ads, personalized practice, and unlimited Legendary!
              </p>
            </div>
            <WingedCreatureIllustration className="h-24 w-24 shrink-0" />
          </div>
          <p className="mt-4 rounded-xl border-2 border-border/80 bg-bg-secondary/40 px-3 py-2 text-center text-xs font-black uppercase tracking-wide text-text-muted">
            Coming soon
          </p>
        </Card>

        <Card
          className="hidden md:block"
          title="Silver League"
          action={
            <span className="text-xs font-black uppercase tracking-wide text-text-muted">
              Coming soon
            </span>
          }
        >
          <div className="flex items-center gap-3">
            <SleepingAnimalIllustration className="h-20 w-24 shrink-0" />
            <p className="text-sm font-bold leading-5 text-[#91a3ab]">
              Complete a lesson to join this week&apos;s leaderboard.
            </p>
          </div>
        </Card>

        <Card
          title="Daily Quests"
          action={
            <span className="text-xs font-black uppercase tracking-wide text-text-muted">
              Coming soon
            </span>
          }
        >
          <div id="quests" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15">
              <Zap aria-hidden className="fill-gold text-gold" size={27} strokeWidth={3.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-text">Earn 10 XP</span>
                <span className="text-xs font-black text-text-muted">
                  {dailyGoalProgress} / {stats.daily_goal}
                </span>
              </div>
              <ProgressBar
                value={dailyGoalProgress}
                max={stats.daily_goal}
                tone="gold"
                label="Daily quest progress"
                trailingIcon={<ChestIcon className="h-7 w-7" />}
              />
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold text-[#91a3ab]">
            Hearts refill over time, or instantly with practice.
          </p>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            loading={refillingHearts}
            className="mt-3"
            onClick={() => {
              void onRefillHearts();
            }}
          >
            Practice / refill hearts
          </Button>
        </Card>

        <footer className="hidden flex-wrap gap-x-3 gap-y-2 px-3 py-3 text-[10px] font-black uppercase tracking-wide text-text-muted md:flex">
          {["About", "Blog", "Store", "Efficacy", "Careers", "Investors", "Terms", "Privacy"].map(
            (item) => (
              <span key={item} className="cursor-default">
                {item}
              </span>
            ),
          )}
        </footer>
      </div>
    </aside>
  );
}
