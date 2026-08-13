import { describe, expect, it } from "vitest";

import { initialLessonState, lessonReducer } from "./lesson-reducer";

describe("lessonReducer", () => {
  it("loads lesson start payload into ready state", () => {
    const state = lessonReducer(initialLessonState, {
      type: "load_success",
      payload: {
        attempt_id: 10,
        lesson_id: 2,
        title: "Food Basics",
        xp_reward: 20,
        total_exercises: 3,
        current_exercise_position: 0,
        hearts: 5,
        exercises: [
          {
            id: 1,
            position: 1,
            exercise_type: "multiple_choice",
            instruction: null,
            prompt: "Choose the right answer",
            payload: { options: ["hola", "adios"] },
          },
        ],
      },
    });

    expect(state.phase).toBe("ready");
    expect(state.attemptId).toBe(10);
    expect(state.currentPosition).toBe(0);
    expect(state.exercises).toHaveLength(1);
  });

  it("moves to failed when answer marks lesson_failed", () => {
    const loaded = lessonReducer(initialLessonState, {
      type: "load_success",
      payload: {
        attempt_id: 10,
        lesson_id: 2,
        title: "Food Basics",
        xp_reward: 20,
        total_exercises: 1,
        current_exercise_position: 0,
        hearts: 1,
        exercises: [],
      },
    });

    const state = lessonReducer(loaded, {
      type: "submit_success",
      payload: {
        correct: false,
        correction: "la manzana",
        explanation: null,
        hearts: 0,
        current_exercise_position: 0,
        total_exercises: 1,
        lesson_failed: true,
      },
    });

    expect(state.phase).toBe("failed");
    expect(state.hearts).toBe(0);
    expect(state.feedback?.correct).toBe(false);
  });

  it("stores completion payload after finish", () => {
    const loaded = lessonReducer(initialLessonState, {
      type: "load_success",
      payload: {
        attempt_id: 10,
        lesson_id: 2,
        title: "Food Basics",
        xp_reward: 20,
        total_exercises: 1,
        current_exercise_position: 1,
        hearts: 4,
        exercises: [],
      },
    });

    const state = lessonReducer(loaded, {
      type: "finish_success",
      payload: {
        attempt_id: 10,
        status: "completed",
        awarded_xp: 20,
        accuracy: 100,
        total_xp: 120,
        daily_xp: 30,
        daily_goal: 20,
        daily_goal_reached: true,
        current_streak: 4,
        skill_status: "completed",
        next_skill_id: 3,
      },
    });

    expect(state.phase).toBe("completed");
    expect(state.completion?.awarded_xp).toBe(20);
  });
});
