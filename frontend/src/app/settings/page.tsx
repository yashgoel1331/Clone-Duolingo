import { SettingsScreen } from "@/components/support/SettingsScreen";
import { getMe } from "@/lib/api/client";

export default async function SettingsPage() {
  let initialMe = null;

  try {
    initialMe = await getMe();
  } catch {
    // The page handles missing shell data gracefully.
  }

  return <SettingsScreen initialMe={initialMe} />;
}
