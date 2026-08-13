import { LeaderboardScreen } from "@/components/support/LeaderboardScreen";
import { getLeaderboard, getMe } from "@/lib/api/client";

export default async function LeaderboardPage() {
  let initialMe = null;
  let leaderboard = null;

  try {
    [initialMe, leaderboard] = await Promise.all([getMe(), getLeaderboard()]);
  } catch {
    // The screen renders an empty state and shell fallback when data fetch fails.
  }

  return <LeaderboardScreen initialMe={initialMe} leaderboard={leaderboard} />;
}
