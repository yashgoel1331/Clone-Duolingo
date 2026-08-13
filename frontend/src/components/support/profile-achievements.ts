import type { ProfileResponse } from "@/lib/api/types";

export type ProfileAchievement = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export function buildProfileAchievements(profile: ProfileResponse): ProfileAchievement[] {
  return [
    {
      id: "streak-starter",
      label: "Streak Starter",
      description: "Reach a 3-day streak.",
      unlocked: profile.stats.current_streak >= 3,
    },
    {
      id: "streak-champion",
      label: "Streak Champion",
      description: "Reach a 7-day streak.",
      unlocked: profile.longest_streak >= 7,
    },
    {
      id: "lesson-finisher",
      label: "Lesson Finisher",
      description: "Complete 5 lessons.",
      unlocked: profile.completed_lessons >= 5,
    },
    {
      id: "skill-climber",
      label: "Skill Climber",
      description: "Complete 3 skills.",
      unlocked: profile.completed_skills >= 3,
    },
  ];
}
