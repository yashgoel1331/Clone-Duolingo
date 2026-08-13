import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createInitialDraft, draftToAnswer, ExerciseRenderer } from "./ExerciseRenderer";

describe("ExerciseRenderer answer helpers", () => {
  it("creates a fill_blank draft and serializes selected answer", () => {
    const draft = createInitialDraft({
      id: 11,
      position: 1,
      exercise_type: "fill_blank",
      instruction: null,
      prompt: "Yo ___ estudiante.",
      payload: {
        options: ["eres", "soy"],
      },
    });

    expect(draft.kind).toBe("fill_blank");
    if (draft.kind !== "fill_blank") return;

    const serialized = draftToAnswer({ ...draft, selected: "soy" });
    expect(serialized).toBe("soy");
  });

  it("serializes match pairs into backend contract shape", () => {
    const serialized = draftToAnswer({
      kind: "match_pairs",
      pendingLeft: null,
      pairs: [
        { left: "hola", right: "hello" },
        { left: "adios", right: "bye" },
      ],
    });
    expect(serialized).toEqual([
      { left: "hola", right: "hello" },
      { left: "adios", right: "bye" },
    ]);
  });

  it("updates multiple choice draft through user interaction", () => {
    const onChange = vi.fn();
    render(
      <ExerciseRenderer
        exercise={{
          id: 1,
          position: 1,
          exercise_type: "multiple_choice",
          instruction: null,
          prompt: "Choose",
          payload: { options: ["hola", "adios"] },
        }}
        draft={{ kind: "multiple_choice", selected: null }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "hola" }));
    expect(onChange).toHaveBeenCalledWith({ kind: "multiple_choice", selected: "hola" });
  });

  it("updates type answer draft through input typing", () => {
    const onChange = vi.fn();
    render(
      <ExerciseRenderer
        exercise={{
          id: 2,
          position: 1,
          exercise_type: "type_answer",
          instruction: null,
          prompt: "Translate",
          payload: { accepted_answers: ["hello"] },
        }}
        draft={{ kind: "type_answer", text: "" }}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Type your answer"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledWith({ kind: "type_answer", text: "hello" });
  });
});
