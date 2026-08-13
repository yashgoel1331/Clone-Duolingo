import type { UserStats } from "@/lib/api/types";

import { CourseFlagIcon, FlameIcon, GemIcon, HeartIcon } from "@/components/icons";
import { StatBadge } from "@/components/ui/StatBadge";

type TopStatsProps = {
  stats: UserStats;
  courseLevel: number;
};

export function TopStats({ courseLevel, stats }: TopStatsProps) {
  return (
    <div
      aria-label="Learner statistics"
      className="flex min-h-13 items-center justify-between gap-1.5 rounded-2xl border-2 border-border/75 bg-bg/90 px-2 py-1 shadow-[0_2px_0_#0c1519] sm:gap-2 sm:px-2.5"
    >
      <StatBadge
        label="Course level"
        value={courseLevel}
        icon={<CourseFlagIcon className="h-6 w-7" />}
      />
      <StatBadge
        label="Streak"
        value={stats.current_streak}
        icon={<FlameIcon active={stats.current_streak > 0} className="h-6 w-6" />}
      />
      <StatBadge label="Gems" value={stats.gems} icon={<GemIcon className="h-6 w-6" />} />
      <StatBadge
        label="Hearts"
        value={`${stats.hearts}`}
        icon={<HeartIcon className="h-6 w-6" />}
      />
    </div>
  );
}
