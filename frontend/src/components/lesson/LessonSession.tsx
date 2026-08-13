"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useReducer, useState } from "react";

import {
  createInitialDraft,
  draftToAnswer,
  ExerciseRenderer,
  type ExerciseDraft,
} from "@/components/lesson/ExerciseRenderer";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { completeLesson, refillHearts, startLesson, submitAnswer } from "@/lib/api/client";
import { initialLessonState, lessonReducer } from "@/lib/lesson-reducer";

type LessonSessionProps = {
  lessonId: number;
};

function readableCorrection(correction: unknown): string {
  if (Array.isArray(correction)) {
    return correction
      .map((item) =>
        typeof item === "string"
          ? item
          : typeof item === "object" && item !== null
            ? `${String((item as { left?: unknown }).left ?? "")} → ${String(
                (item as { right?: unknown }).right ?? "",
              )}`
            : String(item),
      )
      .join(", ");
  }
  if (typeof correction === "string") return correction;
  if (correction === null || correction === undefined) return "";
  return String(correction);
}

export function LessonSession({ lessonId }: LessonSessionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState);
  const [draft, setDraft] = useState<ExerciseDraft | null>(null);
  const [refilling, setRefilling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const started = await startLesson(lessonId);
        if (cancelled) return;
        dispatch({ type: "load_success", payload: started });
        setDraft(
          started.exercises[started.current_exercise_position]
            ? createInitialDraft(started.exercises[started.current_exercise_position])
            : null,
        );
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Could not start this lesson session.";
        dispatch({ type: "load_error", message });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const currentExercise = useMemo(
    () => state.exercises[state.currentPosition] ?? null,
    [state.currentPosition, state.exercises],
  );
  const canSubmit = useMemo(() => {
    if (!draft || state.phase !== "ready") return false;
    if (draft.kind === "type_answer") return draft.text.trim().length > 0;
    if (draft.kind === "multiple_choice" || draft.kind === "fill_blank") return Boolean(draft.selected);
    if (draft.kind === "word_bank") return draft.tokens.length > 0;
    return draft.pairs.length > 0;
  }, [draft, state.phase]);

  const submitCurrentAnswer = async () => {
    if (!state.attemptId || !currentExercise || !draft) return;
    dispatch({ type: "submit_start" });
    try {
      const response = await submitAnswer(state.attemptId, {
        exercise_id: currentExercise.id,
        answer: draftToAnswer(draft),
      });
      dispatch({ type: "submit_success", payload: response });
      toast({
        variant: response.correct ? "success" : "error",
        message: response.correct ? "Nice! Correct answer." : "Not quite. Check the correction.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit your answer.";
      dispatch({ type: "submit_error", message });
      toast({ variant: "error", message });
    }
  };

  const continueOrFinish = async () => {
    if (state.currentPosition < state.totalExercises) {
      dispatch({ type: "continue" });
      setDraft(currentExercise ? createInitialDraft(currentExercise) : null);
      return;
    }
    if (!state.attemptId) return;

    dispatch({ type: "finish_start" });
    try {
      const completion = await completeLesson(state.attemptId);
      dispatch({ type: "finish_success", payload: completion });
      toast({
        variant: "success",
        title: "Lesson complete",
        message: `+${completion.awarded_xp} XP earned.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete this lesson.";
      dispatch({ type: "finish_error", message });
      toast({ variant: "error", message });
    }
  };

  const onRefillAndExit = async () => {
    setRefilling(true);
    try {
      const result = await refillHearts();
      toast({
        variant: result.refilled ? "success" : "info",
        message: result.refilled
          ? `Hearts restored to ${result.hearts}. -${result.gems_spent} gems.`
          : `Hearts are already full. -${result.gems_spent} gems.`,
      });
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not refill hearts.";
      toast({ variant: "error", message });
    } finally {
      setRefilling(false);
    }
  };

  useEffect(() => {
    const shouldWarn = !["completed", "failed", "error"].includes(state.phase);
    if (!shouldWarn) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [state.phase]);

  if (state.phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner size="lg" className="text-blue" />
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ErrorState
          title="Unable to load lesson"
          description={state.error ?? "Something went wrong."}
          retryLabel="Back to Learn"
          onRetry={() => router.push("/")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-4 sm:px-6">
        <header className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href="/"
              className="rounded-xl border-2 border-border px-3 py-2 text-xs font-black uppercase tracking-wide text-text-muted hover:bg-bg-secondary"
            >
              Back to Learn
            </Link>
            <p className="text-sm font-black text-heart">Hearts: {state.hearts}</p>
          </div>
          <ProgressBar
            value={Math.min(state.currentPosition, state.totalExercises)}
            max={Math.max(1, state.totalExercises)}
            tone="green"
            label="Lesson progress"
          />
          <h1 className="mt-4 text-2xl font-black text-text">{state.title}</h1>
        </header>

        <section className="rounded-2xl border-2 border-border bg-card p-5">
          {currentExercise ? (
            <>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-text-muted">
                Exercise {Math.min(state.currentPosition + 1, state.totalExercises)} of{" "}
                {state.totalExercises}
              </p>
              {currentExercise.instruction ? (
                <p className="mb-3 text-sm font-black text-text-link">{currentExercise.instruction}</p>
              ) : null}
              <h2 className="mb-5 text-2xl font-black leading-tight text-text">{currentExercise.prompt}</h2>
              {draft ? (
                <ExerciseRenderer
                  exercise={currentExercise}
                  draft={draft}
                  onChange={setDraft}
                  disabled={state.phase !== "ready"}
                />
              ) : null}
            </>
          ) : (
            <div className="py-6 text-center text-text-muted">No exercise is currently active.</div>
          )}
        </section>

        {state.feedback ? (
          <div
            className={`mt-4 rounded-2xl border-2 p-4 ${
              state.feedback.correct
                ? "border-green bg-green/15 text-green"
                : "animate-pulse border-heart bg-heart/15 text-heart"
            }`}
          >
            <p className="text-sm font-black uppercase tracking-wide">
              {state.feedback.correct ? "Correct" : "Incorrect"}
            </p>
            {!state.feedback.correct && state.feedback.correction ? (
              <p className="mt-1 text-sm font-bold text-text">
                Correct answer: {readableCorrection(state.feedback.correction)}
              </p>
            ) : null}
            {state.feedback.explanation ? (
              <p className="mt-1 text-sm font-bold text-text">{state.feedback.explanation}</p>
            ) : null}
          </div>
        ) : null}

        {state.error ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border-2 border-heart bg-heart/10 px-3 py-2 text-sm text-heart">
            <p role="alert">{state.error}</p>
            <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "dismiss_error" })}>
              Dismiss
            </Button>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          {state.phase === "answered" ? (
            <Button
              variant={state.currentPosition >= state.totalExercises ? "primary" : "secondary"}
              onClick={() => {
                void continueOrFinish();
              }}
            >
              {state.currentPosition >= state.totalExercises ? "Finish lesson" : "Continue"}
            </Button>
          ) : state.phase === "finishing" ? (
            <Button variant="primary" loading disabled>
              Finishing
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                void submitCurrentAnswer();
              }}
              disabled={!canSubmit || state.phase !== "ready"}
              loading={state.phase === "submitting"}
            >
              Check
            </Button>
          )}
        </div>
      </div>

      <Modal open={state.phase === "failed"} onClose={() => router.push("/")} title="Out of hearts">
        <p className="text-sm text-text-muted">
          You ran out of hearts in this lesson. Refill hearts from the Learn page and try again.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => void onRefillAndExit()} loading={refilling}>
            Refill hearts
          </Button>
          <Button variant="ghost" onClick={() => router.push("/")}>
            Exit lesson
          </Button>
        </div>
      </Modal>

      <Modal open={state.phase === "completed" && !!state.completion} onClose={() => router.push("/")} title="Lesson complete">
        {state.completion ? (
          <>
            <p className="text-sm text-text-muted">
              Great work. You earned <span className="font-black text-green">{state.completion.awarded_xp} XP</span>{" "}
              with <span className="font-black text-text">{state.completion.accuracy}%</span> accuracy.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Total XP: <span className="font-black text-text">{state.completion.total_xp}</span> · Streak:{" "}
              <span className="font-black text-text">{state.completion.current_streak}</span>
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Daily goal:{" "}
              <span className="font-black text-text">
                {state.completion.daily_xp}/{state.completion.daily_goal}
              </span>{" "}
              {state.completion.daily_goal_reached ? " (Goal reached!)" : ""}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => router.push("/")}>
                Return to path
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
