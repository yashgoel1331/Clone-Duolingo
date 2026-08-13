import { describe, expect, it } from "vitest";

import { createInitialDraft, draftToAnswer } from "./ExerciseRenderer";

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
});
