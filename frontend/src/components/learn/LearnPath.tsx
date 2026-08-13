"use client";

import { ArrowUp, BookOpen, Check, ChevronsRight, Dumbbell, NotebookTabs, Star } from "lucide-react";

import { DuoMascot } from "@/components/learn/DuoMascot";
import { useToast } from "@/components/ui/Toast";
import type { PathResponse, PathSkill } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type UnitBannerProps = {
  kicker: string;
  title: string;
  subtitle?: string | null;
  tone: "purple" | "green";
};

function UnitBanner({ kicker, title, subtitle, tone }: UnitBannerProps) {
  const colors =
    tone === "purple"
      ? "bg-purple shadow-[0_6px_0_var(--purple-dark)]"
      : "bg-green shadow-[0_6px_0_var(--green-dark)]";

  return (
    <header
      className={cn("relative z-10 rounded-2xl px-5 py-3.5 text-white md:px-6 md:py-4", colors)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-black uppercase tracking-[0.7px] text-white/80">
            {kicker}
          </p>
          <h2 className="mt-1 text-[23px] font-black leading-7 tracking-[-0.3px] md:text-[26px]">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-white/85">{subtitle}</p> : null}
        </div>
        <div
          aria-label="Guidebook coming soon"
          className={cn(
            "flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-white/20 px-3 text-[11px] font-black uppercase tracking-wide text-white transition-transform active:translate-y-0.5",
            tone === "purple"
              ? "bg-purple-dark/55 shadow-[0_3px_0_#8754aa]"
              : "bg-green-dark/60 shadow-[0_3px_0_#378400]",
          )}
        >
          <NotebookTabs aria-hidden size={20} strokeWidth={3} />
          Guidebook soon
        </div>
      </div>
    </header>
  );
}

type PathNodeProps = {
  label: string;
  offset: string;
  state: "completed" | "active" | "locked";
  tone: "green" | "blue" | "gold" | "purple" | "orange" | "teal";
  lockedIcon?: "book" | "star" | "dumbbell";
  onSelect: () => void | Promise<void>;
};

function PathNode({
  label,
  offset,
  state,
  tone,
  lockedIcon = "book",
  onSelect,
}: PathNodeProps) {
  const isLocked = state === "locked";
  const styleByTone = {
    green: {
      active: "bg-green shadow-[0_7px_0_var(--green-dark)] ring-green/20",
      completed: "bg-green shadow-[0_7px_0_var(--green-dark)]",
      lockedBorder: "border-green/40 text-green",
    },
    blue: {
      active: "bg-blue shadow-[0_7px_0_var(--blue-dark)] ring-blue/20",
      completed: "bg-blue shadow-[0_7px_0_var(--blue-dark)]",
      lockedBorder: "border-blue/40 text-blue",
    },
    gold: {
      active: "bg-gold text-[#594400] shadow-[0_7px_0_#c99e00] ring-gold/20",
      completed: "bg-gold text-[#594400] shadow-[0_7px_0_#c99e00]",
      lockedBorder: "border-gold/45 text-gold",
    },
    purple: {
      active: "bg-purple shadow-[0_7px_0_var(--purple-dark)] ring-purple/20",
      completed: "bg-purple shadow-[0_7px_0_var(--purple-dark)]",
      lockedBorder: "border-purple/45 text-purple",
    },
    orange: {
      active: "bg-orange shadow-[0_7px_0_#d57e00] ring-orange/20",
      completed: "bg-orange shadow-[0_7px_0_#d57e00]",
      lockedBorder: "border-orange/45 text-orange",
    },
    teal: {
      active: "bg-[#2fd1b4] shadow-[0_7px_0_#20a58e] ring-[#2fd1b4]/25",
      completed: "bg-[#2fd1b4] shadow-[0_7px_0_#20a58e]",
      lockedBorder: "border-[#2fd1b4]/45 text-[#2fd1b4]",
    },
  } as const;

  const toneStyle = styleByTone[tone];

  const icon =
    state === "completed" ? (
      <Check aria-hidden size={36} strokeWidth={4.5} className="lesson-node-check" />
    ) : state === "active" ? (
      <ChevronsRight aria-hidden size={38} strokeWidth={4.5} />
    ) : lockedIcon === "star" ? (
      <Star aria-hidden size={31} strokeWidth={4} />
    ) : lockedIcon === "dumbbell" ? (
      <Dumbbell aria-hidden size={31} strokeWidth={4} />
    ) : (
      <BookOpen aria-hidden size={31} strokeWidth={4} />
    );

  return (
    <div className={cn("relative flex w-full justify-center", offset)}>
      {state === "active" ? (
        <div className="animate-tooltip-bob absolute -top-14 z-20 rounded-xl bg-text px-4 py-2 text-[13px] font-black uppercase tracking-wide text-green shadow-[0_3px_0_#b8c3c8]">
          Jump here?
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-text" />
        </div>
      ) : null}
      <div
        className={cn(
          "relative z-10 flex h-[82px] w-[82px] items-center justify-center rounded-full border-2 bg-[#19262d] shadow-[0_5px_0_#111a1f] md:h-[88px] md:w-[88px]",
          state === "active" ? "border-[#445560]" : "border-[#3a4953]",
        )}
      >
        <button
          type="button"
          aria-label={label}
          onClick={() => {
            void onSelect();
          }}
          className={cn(
            "group relative z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full text-white transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:shadow-none md:h-[68px] md:w-[68px]",
            isLocked
              ? cn(
                  "border-2 bg-locked text-locked-icon shadow-[0_6px_0_#2b3940]",
                  toneStyle.lockedBorder,
                )
              : state === "active"
                ? cn("lesson-node-active", toneStyle.active)
                : cn("lesson-node-completed", toneStyle.completed),
          )}
        >
          <span className="pointer-events-none">{icon}</span>
        </button>
      </div>
    </div>
  );
}

type LearnPathProps = {
  path: PathResponse;
  onStartLesson: (skill: PathSkill, lessonId?: number | null) => Promise<void>;
  startingSkillId: number | null;
};

function toneForIndex(index: number): PathNodeProps["tone"] {
  const cycle: PathNodeProps["tone"][] = ["green", "purple", "blue", "gold", "orange", "teal"];
  return cycle[index % cycle.length];
}

function lessonStateForSkill(
  skill: PathSkill,
  lessonIndex: number,
): Extract<PathNodeProps["state"], "active" | "completed" | "locked"> {
  if (skill.status === "locked") return "locked";
  if (skill.status === "completed") return "completed";

  const lessonCount = skill.lessons.length;
  if (lessonCount === 0) return "locked";

  const completedLessons = Math.max(
    0,
    Math.min(lessonCount, Math.floor((skill.progress_percent * lessonCount) / 100)),
  );
  if (lessonIndex < completedLessons) return "completed";
  if (lessonIndex === completedLessons) return "active";
  return "locked";
}

export function LearnPath({ onStartLesson, path, startingSkillId }: LearnPathProps) {
  const { toast } = useToast();

  const notify = (nextMessage: string) => {
    toast({ message: nextMessage, duration: 2400 });
  };

  const skills = path.units.flatMap((unit) =>
    unit.skills.map((skill) => ({
      ...skill,
      unitTitle: unit.title,
      unitPosition: unit.position,
    })),
  );
  const availableSkill = skills.find((skill) => skill.status === "available");
  const firstLockedLesson = skills
    .flatMap((skill) =>
      skill.lessons.map((lesson, lessonIndex) => ({
        lesson,
        state: lessonStateForSkill(skill, lessonIndex),
      })),
    )
    .find((entry) => entry.state === "locked")?.lesson;
  const activeUnitPosition = path.units.find((unit) =>
    unit.skills.some((skill) => skill.status === "available"),
  )?.position;
  const offsets = [
    "-translate-x-10 sm:-translate-x-16",
    "translate-x-2 sm:translate-x-6",
    "translate-x-10 sm:translate-x-18",
    "translate-x-1 sm:translate-x-6",
    "-translate-x-10 sm:-translate-x-18",
    "-translate-x-1 sm:-translate-x-6",
  ];

  return (
    <div className="relative mx-auto w-full max-w-[680px] pb-20 xl:max-w-[700px]">
      {path.units.map((unit, unitIndex) => (
        <section key={unit.id} className="pb-10">
          <UnitBanner
            tone={unitIndex % 2 === 0 ? "purple" : "green"}
            kicker={`Section 1, Unit ${unit.position}`}
            title={`Unit ${unit.position}: ${unit.title}`}
            subtitle={unit.description}
          />

          <div className="relative overflow-hidden py-14 md:py-16">
            {activeUnitPosition === unit.position ? (
              <DuoMascot className="absolute right-2 top-20 hidden h-36 w-36 md:block lg:right-10 xl:right-6" />
            ) : null}
            <div className="relative flex flex-col items-center gap-12 md:gap-14">
              {unit.skills.flatMap((skill, skillIndex) =>
                skill.lessons.map((lesson, lessonIndex) => {
                  const state = lessonStateForSkill(skill, lessonIndex);
                  const indexWithinUnit = skillIndex * Math.max(1, skill.lessons.length) + lessonIndex;

                  return (
                    <PathNode
                      key={lesson.id}
                      label={
                        skill.id === startingSkillId
                          ? `Starting ${lesson.title}`
                          : `${state === "locked" ? "Locked" : "Lesson"} ${lesson.title}`
                      }
                      state={state}
                      tone={toneForIndex(unitIndex + indexWithinUnit)}
                      offset={offsets[indexWithinUnit % offsets.length]}
                      lockedIcon={
                        indexWithinUnit % 3 === 0
                          ? "book"
                          : indexWithinUnit % 3 === 1
                            ? "star"
                            : "dumbbell"
                      }
                      onSelect={() => {
                        if (state === "active" || state === "completed") {
                          return onStartLesson(skill, lesson.id);
                        }
                        if (state === "locked") {
                          notify("Complete the previous lesson to unlock this");
                          return;
                        }
                      }}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </section>
      ))}

      <div className="flex items-center gap-4 border-t-2 border-border py-7">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-text-muted">Next up</p>
          <h3 className="mt-1 text-xl font-black text-[#91a3ab]">
            {firstLockedLesson?.title ?? "Keep progressing through your path"}
          </h3>
        </div>
        <span className="rounded-xl border-2 border-border px-3 py-2 text-xs font-black uppercase tracking-[0.8px] text-text-muted">
          {availableSkill ? `${availableSkill.progress_percent}% complete` : "Path complete"}
        </span>
      </div>

      <button
        type="button"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="sticky bottom-22 ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue text-white shadow-[0_5px_0_var(--blue-dark)] transition-transform active:translate-y-1 active:shadow-none lg:bottom-5"
      >
        <ArrowUp aria-hidden size={25} strokeWidth={4} />
      </button>

    </div>
  );
}
