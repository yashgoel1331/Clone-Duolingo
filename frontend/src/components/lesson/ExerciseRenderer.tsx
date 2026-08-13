"use client";

import { Button } from "@/components/ui/Button";
import type { PublicExercise } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export type ExerciseDraft =
  | { kind: "multiple_choice"; selected: string | null }
  | { kind: "word_bank"; tokens: string[] }
  | {
      kind: "match_pairs";
      pairs: Array<{ left: string; right: string }>;
      pendingLeft: string | null;
    }
  | { kind: "fill_blank"; selected: string | null }
  | { kind: "type_answer"; text: string };

type ExerciseRendererProps = {
  exercise: PublicExercise;
  draft: ExerciseDraft;
  onChange: (draft: ExerciseDraft) => void;
  disabled?: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function createInitialDraft(exercise: PublicExercise): ExerciseDraft {
  switch (exercise.exercise_type) {
    case "multiple_choice":
      return { kind: "multiple_choice", selected: null };
    case "word_bank":
      return { kind: "word_bank", tokens: [] };
    case "match_pairs":
      return { kind: "match_pairs", pairs: [], pendingLeft: null };
    case "fill_blank":
      return { kind: "fill_blank", selected: null };
    case "type_answer":
      return { kind: "type_answer", text: "" };
  }
}

export function draftToAnswer(draft: ExerciseDraft): unknown {
  switch (draft.kind) {
    case "multiple_choice":
      return draft.selected ?? "";
    case "word_bank":
      return draft.tokens;
    case "match_pairs":
      return draft.pairs;
    case "fill_blank":
      return draft.selected ?? "";
    case "type_answer":
      return draft.text;
  }
}

function choiceButtonClasses(selected: boolean): string {
  return cn(
    "w-full rounded-2xl border-2 p-3 text-left text-base font-black transition-colors",
    selected
      ? "border-blue bg-nav-active text-blue"
      : "border-border bg-card text-text hover:border-border-light",
  );
}

export function ExerciseRenderer({ disabled = false, draft, exercise, onChange }: ExerciseRendererProps) {
  if (exercise.exercise_type === "multiple_choice" && draft.kind === "multiple_choice") {
    const options = asStringArray(exercise.payload.options);
    return (
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            className={choiceButtonClasses(draft.selected === option)}
            onClick={() => onChange({ kind: "multiple_choice", selected: option })}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (exercise.exercise_type === "word_bank" && draft.kind === "word_bank") {
    const tokens = asStringArray(exercise.payload.tokens);
    return (
      <div className="space-y-4">
        <div className="min-h-14 rounded-2xl border-2 border-border bg-card p-3 text-sm font-bold text-text">
          {draft.tokens.length > 0 ? draft.tokens.join(" ") : "Tap words to build the answer."}
        </div>
        <div className="flex flex-wrap gap-2">
          {tokens.map((token, index) => (
            <Button
              key={`${token}-${index}`}
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              className="rounded-xl border-2 border-border bg-bg-secondary px-3 py-1 text-xs text-text"
              onClick={() => onChange({ kind: "word_bank", tokens: [...draft.tokens, token] })}
            >
              {token}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || draft.tokens.length === 0}
          onClick={() => onChange({ kind: "word_bank", tokens: draft.tokens.slice(0, -1) })}
        >
          Remove last word
        </Button>
      </div>
    );
  }

  if (exercise.exercise_type === "match_pairs" && draft.kind === "match_pairs") {
    const leftItems = asStringArray(exercise.payload.left_items);
    const rightItems = asStringArray(exercise.payload.right_items);
    const matchedLeft = new Set(draft.pairs.map((pair) => pair.left));
    const matchedRight = new Set(draft.pairs.map((pair) => pair.right));

    return (
      <div className="space-y-4">
        <p className="text-sm text-text-muted">Tap one item from each side to make a pair.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {leftItems.map((left) => (
              <button
                key={left}
                type="button"
                disabled={disabled || matchedLeft.has(left)}
                onClick={() => onChange({ ...draft, pendingLeft: left })}
                className={choiceButtonClasses(draft.pendingLeft === left)}
              >
                {left}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightItems.map((right) => (
              <button
                key={right}
                type="button"
                disabled={disabled || matchedRight.has(right) || !draft.pendingLeft}
                onClick={() =>
                  draft.pendingLeft
                    ? onChange({
                        kind: "match_pairs",
                        pendingLeft: null,
                        pairs: [...draft.pairs, { left: draft.pendingLeft, right }],
                      })
                    : undefined
                }
                className={choiceButtonClasses(false)}
              >
                {right}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-3 text-sm">
          {draft.pairs.length > 0 ? (
            <ul className="space-y-1">
              {draft.pairs.map((pair) => (
                <li key={`${pair.left}-${pair.right}`} className="text-text">
                  {pair.left} → {pair.right}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted">No matches selected yet.</p>
          )}
        </div>
      </div>
    );
  }

  if (exercise.exercise_type === "fill_blank" && draft.kind === "fill_blank") {
    const sentence =
      typeof exercise.payload.sentence === "string" ? exercise.payload.sentence : exercise.prompt;
    const options = asStringArray(exercise.payload.options);
    return (
      <div className="space-y-4">
        <p className="rounded-2xl border-2 border-border bg-card p-4 text-base font-bold">{sentence}</p>
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={disabled}
              className={choiceButtonClasses(draft.selected === option)}
              onClick={() => onChange({ kind: "fill_blank", selected: option })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const value = draft.kind === "type_answer" ? draft.text : "";
  const acceptedAnswers = asStringArray(exercise.payload.accepted_answers);
  const placeholder =
    acceptedAnswers.length > 0
      ? `Type in English (e.g. ${acceptedAnswers[0]})`
      : "Type your answer";

  return (
    <div className="space-y-3">
      <label htmlFor={`answer-${exercise.id}`} className="text-sm font-bold text-text-muted">
        Type your answer
      </label>
      <input
        id={`answer-${exercise.id}`}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange({ kind: "type_answer", text: event.target.value })}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-base font-bold text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-blue"
      />
    </div>
  );
}
