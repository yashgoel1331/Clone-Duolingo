import type {
  AnswerResponse,
  LessonCompleteResponse,
  LessonStartResponse,
  PublicExercise,
} from "@/lib/api/types";

export type LessonPhase =
  | "loading"
  | "ready"
  | "submitting"
  | "answered"
  | "finishing"
  | "completed"
  | "failed"
  | "error";

export interface LessonState {
  phase: LessonPhase;
  attemptId: number | null;
  lessonId: number | null;
  title: string;
  hearts: number;
  totalExercises: number;
  currentPosition: number;
  exercises: PublicExercise[];
  feedback: AnswerResponse | null;
  completion: LessonCompleteResponse | null;
  error: string | null;
}

export type LessonAction =
  | { type: "load_success"; payload: LessonStartResponse }
  | { type: "load_error"; message: string }
  | { type: "submit_start" }
  | { type: "submit_success"; payload: AnswerResponse }
  | { type: "submit_error"; message: string }
  | { type: "continue" }
  | { type: "finish_start" }
  | { type: "finish_success"; payload: LessonCompleteResponse }
  | { type: "finish_error"; message: string }
  | { type: "dismiss_error" };

export const initialLessonState: LessonState = {
  phase: "loading",
  attemptId: null,
  lessonId: null,
  title: "",
  hearts: 0,
  totalExercises: 0,
  currentPosition: 0,
  exercises: [],
  feedback: null,
  completion: null,
  error: null,
};

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case "load_success":
      return {
        phase: "ready",
        attemptId: action.payload.attempt_id,
        lessonId: action.payload.lesson_id,
        title: action.payload.title,
        hearts: action.payload.hearts,
        totalExercises: action.payload.total_exercises,
        currentPosition: action.payload.current_exercise_position,
        exercises: action.payload.exercises,
        feedback: null,
        completion: null,
        error: null,
      };
    case "load_error":
      return { ...state, phase: "error", error: action.message };
    case "submit_start":
      return { ...state, phase: "submitting", error: null };
    case "submit_success":
      return {
        ...state,
        hearts: action.payload.hearts,
        currentPosition: action.payload.current_exercise_position,
        feedback: action.payload,
        phase: action.payload.lesson_failed ? "failed" : "answered",
      };
    case "submit_error":
      return { ...state, phase: "ready", error: action.message };
    case "continue":
      return { ...state, phase: "ready", feedback: null, error: null };
    case "finish_start":
      return { ...state, phase: "finishing", error: null };
    case "finish_success":
      return { ...state, phase: "completed", completion: action.payload, feedback: null };
    case "finish_error":
      return { ...state, phase: "answered", error: action.message };
    case "dismiss_error":
      return { ...state, error: null };
    default:
      return state;
  }
}
