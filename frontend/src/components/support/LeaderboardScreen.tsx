"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LeaderboardResponse, MeResponse } from "@/lib/api/types";

import { SupportShell } from "./SupportShell";

type LeaderboardScreenProps = {
  initialMe: MeResponse | null;
  leaderboard: LeaderboardResponse | null;
};

export function LeaderboardScreen({ initialMe, leaderboard }: LeaderboardScreenProps) {
  return (
    <SupportShell me={initialMe} title="Leaderboard" subtitle="This week">
      <Card title="Top Learners">
        {!leaderboard || leaderboard.entries.length === 0 ? (
          <EmptyState
            title="No rankings yet"
            description="Complete a lesson and your weekly XP rank will appear here."
          />
        ) : (
          <ul className="space-y-2">
            {leaderboard.entries.map((entry) => (
              <li
                key={entry.user_id}
                className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 ${
                  entry.is_current_user
                    ? "border-blue bg-nav-active/70"
                    : "border-border bg-bg-secondary/40"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-sm font-black text-text">
                  #{entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-text">
                    {entry.display_name}
                    {entry.is_current_user ? " (You)" : ""}
                  </p>
                  <p className="text-xs font-bold text-text-muted">Weekly XP</p>
                </div>
                <p className="text-lg font-black text-gold">{entry.weekly_xp}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </SupportShell>
  );
}
