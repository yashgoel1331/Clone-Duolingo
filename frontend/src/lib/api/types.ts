export type SkillStatus = "locked" | "available" | "completed";

export interface UserStats {
  total_xp: number;
  weekly_xp: number;
  daily_xp: number;
  daily_goal: number;
  hearts: number;
  max_hearts: number;
  current_streak: number;
  gems: number;
}

export interface MeResponse {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  stats: UserStats;
}

export interface ProfileResponse extends MeResponse {
  longest_streak: number;
  completed_skills: number;
  completed_lessons: number;
  total_attempts: number;
}

export interface PathLesson {
  id: number;
  position: number;
  title: string;
  xp_reward: number;
}

export interface PathSkill {
  id: number;
  position: number;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  status: SkillStatus;
  progress_percent: number;
  crowns: number;
  crown_goal: number;
  lessons: PathLesson[];
}

export interface PathUnit {
  id: number;
  position: number;
  title: string;
  description: string | null;
  skills: PathSkill[];
}

export interface PathResponse {
  course_id: number;
  course_title: string;
  source_language: string;
  target_language: string;
  stats: UserStats;
  units: PathUnit[];
}

export interface LessonStartResponse {
  attempt_id: number;
  lesson_id: number;
  title: string;
  xp_reward: number;
  total_exercises: number;
  current_exercise_position: number;
  hearts: number;
  exercises: PublicExercise[];
}

export interface HeartRefillResponse {
  hearts: number;
  max_hearts: number;
  refilled: boolean;
  gems: number;
  gems_spent: number;
}

export type ExerciseType =
  | "multiple_choice"
  | "word_bank"
  | "match_pairs"
  | "fill_blank"
  | "type_answer";

export interface PublicExercise {
  id: number;
  position: number;
  exercise_type: ExerciseType;
  instruction: string | null;
  prompt: string;
  payload: Record<string, unknown>;
}

export interface AnswerResponse {
  correct: boolean;
  correction: unknown;
  explanation: string | null;
  hearts: number;
  current_exercise_position: number;
  total_exercises: number;
  lesson_failed: boolean;
}

export interface LessonCompleteResponse {
  attempt_id: number;
  status: "in_progress" | "completed" | "failed" | "abandoned";
  awarded_xp: number;
  accuracy: number;
  total_xp: number;
  daily_xp: number;
  daily_goal: number;
  daily_goal_reached: boolean;
  current_streak: number;
  skill_status: SkillStatus;
  next_skill_id: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}
