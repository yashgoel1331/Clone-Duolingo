import type {
  AnswerResponse,
  HeartRefillResponse,
  LeaderboardResponse,
  LessonCompleteResponse,
  LessonStartResponse,
  MeResponse,
  PathResponse,
  ProfileResponse,
} from "./types";

function baseApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseApiUrl()}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}.`;
    try {
      const payload = (await response.json()) as { detail?: string };
      throw new Error(payload.detail || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return (await response.json()) as T;
}

export function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me");
}

export function getPath(): Promise<PathResponse> {
  return apiRequest<PathResponse>("/path");
}

export function getProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/me/profile");
}

export function getLeaderboard(): Promise<LeaderboardResponse> {
  return apiRequest<LeaderboardResponse>("/leaderboard");
}

export function startLesson(lessonId: number): Promise<LessonStartResponse> {
  return apiRequest<LessonStartResponse>(`/lessons/${lessonId}/start`, {
    method: "POST",
  });
}

export function refillHearts(): Promise<HeartRefillResponse> {
  return apiRequest<HeartRefillResponse>("/hearts/refill", {
    method: "POST",
  });
}

export function submitAnswer(
  attemptId: number,
  payload: { exercise_id: number; answer: unknown },
): Promise<AnswerResponse> {
  return apiRequest<AnswerResponse>(`/attempts/${attemptId}/answer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeLesson(attemptId: number): Promise<LessonCompleteResponse> {
  return apiRequest<LessonCompleteResponse>(`/attempts/${attemptId}/complete`, {
    method: "POST",
  });
}
