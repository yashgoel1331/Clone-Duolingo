"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MeResponse } from "@/lib/api/types";

import { SupportShell } from "./SupportShell";

type SettingsScreenProps = {
  initialMe: MeResponse | null;
};

export function SettingsScreen({ initialMe }: SettingsScreenProps) {
  return (
    <SupportShell me={initialMe} title="Settings" subtitle="Preferences">
      <div className="space-y-4">
        <Card title="Social Features">
          <EmptyState
            title="Friends and social feed coming soon"
            description="Follow friends, compare streaks, and send cheers once social features are connected."
          />
        </Card>

        <Card title="Subscription">
          <EmptyState
            title="Super plan controls coming soon"
            description="Manage ad-free mode, unlimited hearts, and practice perks from this section."
          />
        </Card>

        <Card title="Language Tracks">
          <EmptyState
            title="Multi-language learning coming soon"
            description="Choose multiple source and target language tracks when course switching is enabled."
          />
        </Card>
      </div>
    </SupportShell>
  );
}
