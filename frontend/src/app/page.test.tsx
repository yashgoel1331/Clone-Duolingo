import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";

import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

const meResponse = {
  id: 1,
  username: "learner",
  display_name: "Yash",
  avatar_url: null,
  stats: {
    total_xp: 40,
    weekly_xp: 40,
    daily_xp: 20,
    daily_goal: 20,
    hearts: 5,
    max_hearts: 5,
    current_streak: 7,
    gems: 500,
  },
};

const pathResponse = {
  course_id: 1,
  course_title: "Spanish for English Speakers",
  source_language: "English",
  target_language: "Spanish",
  stats: meResponse.stats,
  units: [
    {
      id: 1,
      position: 1,
      title: "First Steps",
      description: "Greet people and introduce yourself.",
      skills: [
        {
          id: 1,
          position: 1,
          title: "Greetings",
          description: "Learn common hellos and goodbyes.",
          icon: "message-circle",
          color: "#58CC02",
          status: "completed",
          progress_percent: 100,
          crowns: 1,
          crown_goal: 1,
          lessons: [{ id: 1, position: 1, title: "Greetings 1", xp_reward: 20 }],
        },
        {
          id: 2,
          position: 2,
          title: "Introductions",
          description: "Say your name and ask about someone else.",
          icon: "user-round",
          color: "#1CB0F6",
          status: "available",
          progress_percent: 60,
          crowns: 0,
          crown_goal: 1,
          lessons: [{ id: 2, position: 1, title: "Introductions 1", xp_reward: 20 }],
        },
      ],
    },
  ],
};

describe("Home", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/me")) {
        return Promise.resolve(new Response(JSON.stringify(meResponse), { status: 200 }));
      }
      if (url.endsWith("/path")) {
        return Promise.resolve(new Response(JSON.stringify(pathResponse), { status: 200 }));
      }
      return Promise.resolve(new Response("Not found", { status: 404 }));
    });
  });

  it("renders the Learn shell from API-backed data", async () => {
    const ui = await Home();

    render(
      <ToastProvider>
        {ui}
      </ToastProvider>,
    );

    expect(await screen.findByText("Daily Quests")).toBeInTheDocument();
    expect(screen.getAllByText("Learn").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Unit 1: First Steps" })).toBeInTheDocument();
    expect(screen.getByText("Greet people and introduce yourself.")).toBeInTheDocument();
    expect(screen.getByText("Jump here?")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Streak/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Gems/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Hearts/).length).toBeGreaterThan(0);
  });
});
