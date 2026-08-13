from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import (
    Course,
    Lesson,
    LessonAttempt,
    Skill,
    Unit,
    User,
    UserLessonProgress,
    UserSkillProgress,
)
from app.models.enums import AttemptStatus, SkillStatus
from app.schemas.lesson import (
    AnswerResponse,
    LessonCompleteResponse,
    LessonStartResponse,
)
from app.schemas.path import PathLesson, PathResponse, PathSkill, PathUnit
from app.services.exercises import public_exercise, validate_answer
from app.services.users import build_user_stats, regenerate_hearts, update_streak_for_activity


def _lesson_or_404(session: Session, lesson_id: int) -> Lesson:
    lesson = session.scalar(
        select(Lesson)
        .options(
            joinedload(Lesson.skill).joinedload(Skill.unit),
            selectinload(Lesson.exercises),
        )
        .where(Lesson.id == lesson_id),
    )
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")
    return lesson


def _attempt_or_404(session: Session, attempt_id: int, user_id: int) -> LessonAttempt:
    attempt = session.scalar(
        select(LessonAttempt)
        .options(
            joinedload(LessonAttempt.lesson).joinedload(Lesson.skill).joinedload(Skill.unit),
            joinedload(LessonAttempt.lesson).selectinload(Lesson.exercises),
        )
        .where(LessonAttempt.id == attempt_id, LessonAttempt.user_id == user_id),
    )
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found.")
    return attempt


def build_path(
    session: Session,
    user: User,
    course_slug: str,
    now: datetime,
) -> PathResponse:
    regenerate_hearts(user, now)
    course = session.scalar(
        select(Course)
        .options(
            selectinload(Course.units).selectinload(Unit.skills).selectinload(Skill.lessons),
        )
        .where(Course.slug == course_slug),
    )
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The seeded course is missing. Run the seed command first.",
        )

    progress_by_skill = {
        progress.skill_id: progress
        for progress in session.scalars(
            select(UserSkillProgress).where(UserSkillProgress.user_id == user.id),
        )
    }
    units: list[PathUnit] = []
    for unit in course.units:
        skills: list[PathSkill] = []
        for skill in unit.skills:
            progress = progress_by_skill.get(skill.id)
            skills.append(
                PathSkill(
                    id=skill.id,
                    position=skill.position,
                    title=skill.title,
                    description=skill.description,
                    icon=skill.icon,
                    color=skill.color,
                    status=progress.status if progress else SkillStatus.LOCKED,
                    progress_percent=progress.progress_percent if progress else 0,
                    crowns=progress.crowns if progress else 0,
                    crown_goal=skill.crown_goal,
                    lessons=[
                        PathLesson(
                            id=lesson.id,
                            position=lesson.position,
                            title=lesson.title,
                            xp_reward=lesson.xp_reward,
                        )
                        for lesson in skill.lessons
                    ],
                ),
            )
        units.append(
            PathUnit(
                id=unit.id,
                position=unit.position,
                title=unit.title,
                description=unit.description,
                skills=skills,
            ),
        )

    session.commit()
    return PathResponse(
        course_id=course.id,
        course_title=course.title,
        source_language=course.source_language,
        target_language=course.target_language,
        stats=build_user_stats(user),
        units=units,
    )


def _start_response(attempt: LessonAttempt, user: User) -> LessonStartResponse:
    lesson = attempt.lesson
    return LessonStartResponse(
        attempt_id=attempt.id,
        lesson_id=lesson.id,
        title=lesson.title,
        xp_reward=lesson.xp_reward,
        total_exercises=len(lesson.exercises),
        current_exercise_position=attempt.current_exercise_position,
        hearts=user.hearts,
        exercises=[public_exercise(exercise) for exercise in lesson.exercises],
    )


def start_lesson(
    session: Session,
    user: User,
    lesson_id: int,
    now: datetime,
) -> LessonStartResponse:
    lesson = _lesson_or_404(session, lesson_id)
    progress = session.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == lesson.skill_id,
        ),
    )
    if progress is None or progress.status is SkillStatus.LOCKED:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This skill is locked.")

    regenerate_hearts(user, now)
    if user.hearts <= 0:
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You need at least one heart to start a lesson.",
        )

    attempt = session.scalar(
        select(LessonAttempt).where(
            LessonAttempt.user_id == user.id,
            LessonAttempt.lesson_id == lesson.id,
            LessonAttempt.status == AttemptStatus.IN_PROGRESS,
        ),
    )
    if attempt is None:
        attempt = LessonAttempt(
            user=user,
            lesson=lesson,
            status=AttemptStatus.IN_PROGRESS,
            current_exercise_position=0,
        )
        session.add(attempt)
        session.flush()
    else:
        attempt.lesson = lesson

    response = _start_response(attempt, user)
    session.commit()
    return response


def _record_failed_lesson(
    session: Session,
    user: User,
    lesson: Lesson,
    now: datetime,
) -> None:
    progress = session.scalar(
        select(UserLessonProgress).where(
            UserLessonProgress.user_id == user.id,
            UserLessonProgress.lesson_id == lesson.id,
        ),
    )
    if progress is None:
        progress = UserLessonProgress(user=user, lesson=lesson)
        session.add(progress)
    progress.attempts_count = (progress.attempts_count or 0) + 1
    progress.last_attempt_at = now


def submit_answer(
    session: Session,
    user: User,
    attempt_id: int,
    exercise_id: int,
    submitted_answer: object,
    now: datetime,
) -> AnswerResponse:
    attempt = _attempt_or_404(session, attempt_id, user.id)
    if attempt.status is not AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This attempt is no longer active.",
        )

    exercises = attempt.lesson.exercises
    if attempt.current_exercise_position >= len(exercises):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="All exercises are answered. Complete the lesson.",
        )

    expected_exercise = exercises[attempt.current_exercise_position]
    if expected_exercise.id != exercise_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Answer exercises in lesson order.",
        )

    regenerate_hearts(user, now)
    if user.hearts <= 0:
        attempt.status = AttemptStatus.FAILED
        attempt.completed_at = now
        _record_failed_lesson(session, user, attempt.lesson, now)
        session.commit()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You are out of hearts.")

    correct, correction = validate_answer(expected_exercise, submitted_answer)
    if correct:
        attempt.correct_answers += 1
    else:
        attempt.incorrect_answers += 1
        attempt.hearts_lost += 1
        user.hearts -= 1
        if user.hearts == 0:
            attempt.status = AttemptStatus.FAILED
            attempt.completed_at = now
            _record_failed_lesson(session, user, attempt.lesson, now)

    attempt.current_exercise_position += 1
    response = AnswerResponse(
        correct=correct,
        correction=None if correct else correction,
        explanation=expected_exercise.explanation,
        hearts=user.hearts,
        current_exercise_position=attempt.current_exercise_position,
        total_exercises=len(exercises),
        lesson_failed=attempt.status is AttemptStatus.FAILED,
    )
    session.commit()
    return response


def _ordered_course_skills(session: Session, course_id: int) -> list[Skill]:
    return list(
        session.scalars(
            select(Skill)
            .join(Unit)
            .where(Unit.course_id == course_id)
            .order_by(Unit.position, Skill.position),
        ),
    )


def _next_skill(session: Session, skill: Skill) -> Skill | None:
    skills = _ordered_course_skills(session, skill.unit.course_id)
    current_index = next(index for index, item in enumerate(skills) if item.id == skill.id)
    return skills[current_index + 1] if current_index + 1 < len(skills) else None


def _update_progress(
    session: Session,
    user: User,
    lesson: Lesson,
    accuracy: int,
    now: datetime,
) -> tuple[UserSkillProgress, int | None]:
    lesson_progress = session.scalar(
        select(UserLessonProgress).where(
            UserLessonProgress.user_id == user.id,
            UserLessonProgress.lesson_id == lesson.id,
        ),
    )
    if lesson_progress is None:
        lesson_progress = UserLessonProgress(user=user, lesson=lesson)
        session.add(lesson_progress)
    lesson_progress.is_completed = True
    lesson_progress.best_score = max(lesson_progress.best_score or 0, accuracy)
    lesson_progress.attempts_count = (lesson_progress.attempts_count or 0) + 1
    lesson_progress.completed_at = lesson_progress.completed_at or now
    lesson_progress.last_attempt_at = now
    session.flush()

    total_lessons = (
        session.scalar(
            select(func.count()).select_from(Lesson).where(Lesson.skill_id == lesson.skill_id)
        )
        or 1
    )
    completed_lessons = (
        session.scalar(
            select(func.count())
            .select_from(UserLessonProgress)
            .join(Lesson)
            .where(
                UserLessonProgress.user_id == user.id,
                UserLessonProgress.is_completed.is_(True),
                Lesson.skill_id == lesson.skill_id,
            ),
        )
        or 0
    )

    skill_progress = session.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == lesson.skill_id,
        ),
    )
    if skill_progress is None:
        skill_progress = UserSkillProgress(
            user=user,
            skill=lesson.skill,
            status=SkillStatus.AVAILABLE,
        )
        session.add(skill_progress)

    skill_progress.progress_percent = min(100, completed_lessons * 100 // total_lessons)
    next_skill = None
    if completed_lessons >= total_lessons:
        skill_progress.status = SkillStatus.COMPLETED
        skill_progress.crowns = max(1, skill_progress.crowns)
        skill_progress.completed_at = skill_progress.completed_at or now
        next_skill = _next_skill(session, lesson.skill)
        if next_skill is not None:
            next_progress = session.scalar(
                select(UserSkillProgress).where(
                    UserSkillProgress.user_id == user.id,
                    UserSkillProgress.skill_id == next_skill.id,
                ),
            )
            if next_progress is None:
                session.add(
                    UserSkillProgress(
                        user=user,
                        skill=next_skill,
                        status=SkillStatus.AVAILABLE,
                    ),
                )
            elif next_progress.status is SkillStatus.LOCKED:
                next_progress.status = SkillStatus.AVAILABLE

    return skill_progress, next_skill.id if next_skill else None


def _completion_response(
    attempt: LessonAttempt,
    user: User,
    skill_progress: UserSkillProgress,
    next_skill_id: int | None,
) -> LessonCompleteResponse:
    total_answers = attempt.correct_answers + attempt.incorrect_answers
    accuracy = round(attempt.correct_answers * 100 / total_answers) if total_answers else 0
    return LessonCompleteResponse(
        attempt_id=attempt.id,
        status=attempt.status,
        awarded_xp=attempt.xp_earned,
        accuracy=accuracy,
        total_xp=user.total_xp,
        daily_xp=user.daily_xp,
        daily_goal=user.daily_goal,
        daily_goal_reached=user.daily_xp >= user.daily_goal,
        current_streak=user.current_streak,
        skill_status=skill_progress.status,
        next_skill_id=next_skill_id,
    )


def complete_lesson(
    session: Session,
    user: User,
    attempt_id: int,
    now: datetime,
) -> LessonCompleteResponse:
    attempt = _attempt_or_404(session, attempt_id, user.id)
    lesson = attempt.lesson
    skill_progress = session.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == lesson.skill_id,
        ),
    )
    if skill_progress is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Skill progress is missing."
        )

    if attempt.status is AttemptStatus.COMPLETED:
        next_skill = _next_skill(session, lesson.skill)
        return _completion_response(
            attempt,
            user,
            skill_progress,
            next_skill.id
            if next_skill and skill_progress.status is SkillStatus.COMPLETED
            else None,
        )
    if attempt.status is not AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only an active attempt can be completed.",
        )
    if attempt.current_exercise_position < len(lesson.exercises):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Answer every exercise before completing the lesson.",
        )

    total_answers = attempt.correct_answers + attempt.incorrect_answers
    accuracy = round(attempt.correct_answers * 100 / total_answers) if total_answers else 0
    update_streak_for_activity(user, now)
    user.total_xp += lesson.xp_reward
    user.weekly_xp += lesson.xp_reward
    user.daily_xp += lesson.xp_reward

    attempt.status = AttemptStatus.COMPLETED
    attempt.xp_earned = lesson.xp_reward
    attempt.completed_at = now
    skill_progress, next_skill_id = _update_progress(session, user, lesson, accuracy, now)

    response = _completion_response(attempt, user, skill_progress, next_skill_id)
    session.commit()
    return response
