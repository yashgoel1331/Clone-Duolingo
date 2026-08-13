"use client";

import type { ReactNode } from "react";

import type { UserStats } from "@/lib/api/types";

import { BottomNav } from "./BottomNav";
import { RightRail } from "./RightRail";
import { Sidebar } from "./Sidebar";
import { TopStats } from "@/components/layout/TopStats";

type AppShellProps = {
  children: ReactNode;
  stats: UserStats;
  courseLevel: number;
  dailyGoalProgress: number;
  onRefillHearts: () => Promise<void>;
  refillingHearts: boolean;
};

export function AppShell({
  children,
  courseLevel,
  dailyGoalProgress,
  onRefillHearts,
  refillingHearts,
  stats,
}: AppShellProps) {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-bg">
      <div className="flex w-full">
        <Sidebar />
        <div className="min-w-0 flex-1 px-3 pb-24 md:px-5 lg:px-6 lg:pb-0 xl:px-8">
          <div className="mx-auto grid w-full max-w-[1232px] grid-cols-1 gap-6 xl:grid-cols-[minmax(0,680px)_332px] xl:gap-8">
            <main id="learn-path" className="min-w-0 pt-2 md:pt-4">
              <div className="mb-4 flex justify-center lg:hidden">
                <span className="inline-flex px-3 text-[32px] font-black leading-none tracking-[-2px] text-green">
                  duolingo
                </span>
              </div>
              <div className="mb-3 xl:hidden">
                <TopStats stats={stats} courseLevel={courseLevel} />
              </div>
              {children}
            </main>
            <RightRail
              stats={stats}
              courseLevel={courseLevel}
              dailyGoalProgress={dailyGoalProgress}
              onRefillHearts={onRefillHearts}
              refillingHearts={refillingHearts}
            />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
