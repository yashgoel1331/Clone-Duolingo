import { describe, expect, it } from "vitest";

import { buildProfileAchievements } from "./profile-achievements";

describe("buildProfileAchievements", () => {
  it("marks achievements unlocked when thresholds are met", () => {
    const achievements = buildProfileAchievements({
      id: 1,
      username: "learner",
      display_name: "Yash",
      avatar_url: null,
      stats: {
        total_xp: 100,
        weekly_xp: 80,
        daily_xp: 30,
        daily_goal: 20,
        hearts: 5,
        max_hearts: 5,
        current_streak: 5,
        gems: 200,
      },
      longest_streak: 9,
      completed_skills: 4,
      completed_lessons: 8,
      total_attempts: 15,
    });

    expect(achievements.every((item) => item.unlocked)).toBe(true);
  });

  it("keeps achievements locked when thresholds are not met", () => {
    const achievements = buildProfileAchievements({
      id: 1,
      username: "learner",
      display_name: "Yash",
      avatar_url: null,
      stats: {
        total_xp: 40,
        weekly_xp: 40,
        daily_xp: 10,
        daily_goal: 20,
        hearts: 4,
        max_hearts: 5,
        current_streak: 1,
        gems: 50,
      },
      longest_streak: 2,
      completed_skills: 1,
      completed_lessons: 2,
      total_attempts: 4,
    });

    expect(achievements.some((item) => item.unlocked)).toBe(false);
  });
});
