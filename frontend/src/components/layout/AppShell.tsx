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
        <div className="min-w-0 flex-1 pl-3 pr-0 pb-24 md:pl-5 md:pr-0 lg:pl-6 lg:pr-0 lg:pb-0 xl:pl-6 xl:pr-0 2xl:pl-8 2xl:pr-0">
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_338px] xl:gap-6">
            <main id="learn-path" className="min-w-0 pt-2 md:pt-4">
              <div className="mb-4 flex justify-center lg:hidden">
                <span className="inline-flex px-3 text-[35px] font-black leading-none tracking-[-1.2px] text-green">
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
