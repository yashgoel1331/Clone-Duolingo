"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { MeResponse, ProfileResponse } from "@/lib/api/types";

import { buildProfileAchievements } from "./profile-achievements";
import { SupportShell } from "./SupportShell";

type ProfileScreenProps = {
  initialMe: MeResponse | null;
  profile: ProfileResponse | null;
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-bg-secondary/40 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-text">{value}</p>
    </div>
  );
}

export function ProfileScreen({ initialMe, profile }: ProfileScreenProps) {
  if (!profile) {
    return (
      <SupportShell me={initialMe} title="Profile" subtitle="Your learning progress">
        <Card title="Profile unavailable">
          <p className="text-sm font-bold text-text-muted">
            We could not fetch your profile details. Return to Learn and retry.
          </p>
        </Card>
      </SupportShell>
    );
  }

  const achievements = buildProfileAchievements(profile);

  return (
    <SupportShell me={initialMe} title={profile.display_name} subtitle="Profile">
      <div className="space-y-4">
        <Card
          title="Your Stats"
          action={
            <Link
              href="/settings"
              className="rounded-xl border-2 border-border px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-text-muted hover:bg-bg-secondary"
            >
              Settings
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile label="Total XP" value={profile.stats.total_xp} />
            <StatTile label="Current streak" value={profile.stats.current_streak} />
            <StatTile label="Longest streak" value={profile.longest_streak} />
            <StatTile label="Daily goal" value={profile.stats.daily_goal} />
            <StatTile label="Completed lessons" value={profile.completed_lessons} />
            <StatTile label="Completed skills" value={profile.completed_skills} />
            <StatTile label="Total attempts" value={profile.total_attempts} />
            <StatTile label="Gems" value={profile.stats.gems} />
          </div>
        </Card>

        <Card title="Achievements">
          <ul className="space-y-3">
            {achievements.map((achievement) => (
              <li
                key={achievement.id}
                className={`rounded-2xl border-2 p-3 ${
                  achievement.unlocked
                    ? "border-green bg-green/10"
                    : "border-border bg-bg-secondary/40 text-text-muted"
                }`}
              >
                <p className="text-sm font-black uppercase tracking-wide">{achievement.label}</p>
                <p className="mt-1 text-sm font-bold">{achievement.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SupportShell>
  );
}
