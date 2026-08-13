import { ProfileScreen } from "@/components/support/ProfileScreen";
import { getMe, getProfile } from "@/lib/api/client";

export default async function ProfilePage() {
  let initialMe = null;
  let profile = null;

  try {
    [initialMe, profile] = await Promise.all([getMe(), getProfile()]);
  } catch {
    // The screen renders an in-app fallback while preserving shell behavior.
  }

  return <ProfileScreen initialMe={initialMe} profile={profile} />;
}
