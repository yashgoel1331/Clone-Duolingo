from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.db.session import SessionLocal
from app.models import (
    Course,
    Exercise,
    Lesson,
    LessonAttempt,
    Skill,
    Unit,
    User,
    UserLessonProgress,
    UserSkillProgress,
)
from app.models.enums import AttemptStatus, ExerciseType, SkillStatus

COURSE_SLUG = "spanish-for-english"
DEFAULT_USERNAME = "learner"
EXPECTED_UNITS = 4
EXPECTED_SKILLS = 8
EXPECTED_LESSONS = 16
EXPECTED_EXERCISES = 80


@dataclass(frozen=True)
class SkillSeed:
    title: str
    description: str
    icon: str
    color: str
    vocabulary: tuple[tuple[str, str], ...]
    word_bank_prompt: str
    word_bank_answer: tuple[str, ...]
    word_bank_tokens: tuple[str, ...]
    fill_sentence: str
    fill_options: tuple[str, ...]
    fill_answer: str
    type_prompt: str
    accepted_answers: tuple[str, ...]


@dataclass(frozen=True)
class UnitSeed:
    title: str
    description: str
    skills: tuple[SkillSeed, ...]


@dataclass(frozen=True)
class SeedSummary:
    users: int
    courses: int
    units: int
    skills: int
    lessons: int
    exercises: int


COURSE_CONTENT = (
    UnitSeed(
        title="First Steps",
        description="Greet people and introduce yourself.",
        skills=(
            SkillSeed(
                title="Greetings",
                description="Learn common hellos and goodbyes.",
                icon="message-circle",
                color="#58CC02",
                vocabulary=(
                    ("hola", "hello"),
                    ("adiós", "goodbye"),
                    ("gracias", "thank you"),
                ),
                word_bank_prompt="Good morning",
                word_bank_answer=("Buenos", "días"),
                word_bank_tokens=("días", "Buenas", "Buenos", "noches"),
                fill_sentence="___, ¿cómo estás?",
                fill_options=("Hola", "Adiós", "Gracias"),
                fill_answer="Hola",
                type_prompt="Hasta luego",
                accepted_answers=("see you later", "see you"),
            ),
            SkillSeed(
                title="Introductions",
                description="Say your name and ask about someone else.",
                icon="user-round",
                color="#1CB0F6",
                vocabulary=(
                    ("nombre", "name"),
                    ("amigo", "friend"),
                    ("persona", "person"),
                ),
                word_bank_prompt="My name is Ana",
                word_bank_answer=("Me", "llamo", "Ana"),
                word_bank_tokens=("Ana", "llamas", "Me", "llamo"),
                fill_sentence="¿Cómo te ___?",
                fill_options=("llamas", "llamo", "llama"),
                fill_answer="llamas",
                type_prompt="Mucho gusto",
                accepted_answers=("nice to meet you", "pleased to meet you"),
            ),
        ),
    ),
    UnitSeed(
        title="Everyday Life",
        description="Talk about food and the people around you.",
        skills=(
            SkillSeed(
                title="Food",
                description="Order simple food and drinks.",
                icon="utensils",
                color="#FF9600",
                vocabulary=(
                    ("pan", "bread"),
                    ("agua", "water"),
                    ("manzana", "apple"),
                ),
                word_bank_prompt="I eat an apple",
                word_bank_answer=("Yo", "como", "una", "manzana"),
                word_bank_tokens=("una", "bebo", "Yo", "manzana", "como"),
                fill_sentence="Yo ___ agua.",
                fill_options=("bebo", "como", "leo"),
                fill_answer="bebo",
                type_prompt="Quiero pan",
                accepted_answers=("i want bread", "i would like bread"),
            ),
            SkillSeed(
                title="Family",
                description="Describe close family members.",
                icon="users-round",
                color="#CE82FF",
                vocabulary=(
                    ("madre", "mother"),
                    ("padre", "father"),
                    ("hermana", "sister"),
                ),
                word_bank_prompt="She is my sister",
                word_bank_answer=("Ella", "es", "mi", "hermana"),
                word_bank_tokens=("hermana", "mi", "Ella", "soy", "es"),
                fill_sentence="Él es mi ___.",
                fill_options=("padre", "madre", "hermana"),
                fill_answer="padre",
                type_prompt="Mi familia",
                accepted_answers=("my family",),
            ),
        ),
    ),
    UnitSeed(
        title="Explore",
        description="Travel and find your way around town.",
        skills=(
            SkillSeed(
                title="Travel",
                description="Use useful words for a trip.",
                icon="plane",
                color="#2B70C9",
                vocabulary=(
                    ("tren", "train"),
                    ("avión", "airplane"),
                    ("hotel", "hotel"),
                ),
                word_bank_prompt="The train is here",
                word_bank_answer=("El", "tren", "está", "aquí"),
                word_bank_tokens=("está", "El", "allí", "tren", "aquí"),
                fill_sentence="El ___ sale hoy.",
                fill_options=("avión", "hotel", "calle"),
                fill_answer="avión",
                type_prompt="Necesito un hotel",
                accepted_answers=("i need a hotel",),
            ),
            SkillSeed(
                title="Directions",
                description="Ask where places are and follow directions.",
                icon="map",
                color="#00CD9C",
                vocabulary=(
                    ("izquierda", "left"),
                    ("derecha", "right"),
                    ("calle", "street"),
                ),
                word_bank_prompt="Turn to the right",
                word_bank_answer=("Gira", "a", "la", "derecha"),
                word_bank_tokens=("izquierda", "la", "Gira", "derecha", "a"),
                fill_sentence="El banco está a la ___.",
                fill_options=("izquierda", "calle", "tren"),
                fill_answer="izquierda",
                type_prompt="¿Dónde está la estación?",
                accepted_answers=("where is the station", "where is the train station"),
            ),
        ),
    ),
    UnitSeed(
        title="Daily Adventures",
        description="Handle shopping and talk about your routine.",
        skills=(
            SkillSeed(
                title="Shopping",
                description="Buy common items and ask prices.",
                icon="shopping-bag",
                color="#FF4B4B",
                vocabulary=(
                    ("mercado", "market"),
                    ("precio", "price"),
                    ("camisa", "shirt"),
                ),
                word_bank_prompt="The shirt is cheap",
                word_bank_answer=("La", "camisa", "es", "barata"),
                word_bank_tokens=("barata", "camisa", "es", "el", "La"),
                fill_sentence="¿Cuál es el ___?",
                fill_options=("precio", "mercado", "tren"),
                fill_answer="precio",
                type_prompt="Voy al mercado",
                accepted_answers=("i am going to the market", "i go to the market"),
            ),
            SkillSeed(
                title="Routine",
                description="Describe daily habits and schedules.",
                icon="clock-3",
                color="#7C4DFF",
                vocabulary=(
                    ("mañana", "morning"),
                    ("noche", "night"),
                    ("trabajo", "work"),
                ),
                word_bank_prompt="I work at night",
                word_bank_answer=("Yo", "trabajo", "de", "noche"),
                word_bank_tokens=("noche", "Yo", "trabaja", "de", "trabajo"),
                fill_sentence="Estudio en la ___.",
                fill_options=("mañana", "camisa", "calle"),
                fill_answer="mañana",
                type_prompt="Buenas noches",
                accepted_answers=("good night",),
            ),
        ),
    ),
)

LEADERBOARD_USERS = (
    {
        "username": "maria",
        "display_name": "Maria",
        "total_xp": 1480,
        "weekly_xp": 260,
        "current_streak": 21,
        "longest_streak": 30,
    },
    {
        "username": "diego",
        "display_name": "Diego",
        "total_xp": 1120,
        "weekly_xp": 210,
        "current_streak": 12,
        "longest_streak": 18,
    },
    {
        "username": "priya",
        "display_name": "Priya",
        "total_xp": 930,
        "weekly_xp": 165,
        "current_streak": 9,
        "longest_streak": 15,
    },
    {
        "username": "alex",
        "display_name": "Alex",
        "total_xp": 710,
        "weekly_xp": 95,
        "current_streak": 4,
        "longest_streak": 11,
    },
    {
        "username": "mei",
        "display_name": "Mei",
        "total_xp": 530,
        "weekly_xp": 70,
        "current_streak": 2,
        "longest_streak": 8,
    },
)


def _build_exercises(seed: SkillSeed) -> list[Exercise]:
    vocabulary_options = [english.title() for _, english in seed.vocabulary]
    first_spanish, first_english = seed.vocabulary[0]

    return [
        Exercise(
            position=1,
            exercise_type=ExerciseType.MULTIPLE_CHOICE,
            instruction="Choose the correct translation",
            prompt=first_spanish.capitalize(),
            payload={
                "options": vocabulary_options,
                "answer": first_english.title(),
            },
            explanation=f'"{first_spanish.capitalize()}" means "{first_english}".',
        ),
        Exercise(
            position=2,
            exercise_type=ExerciseType.WORD_BANK,
            instruction="Translate into Spanish",
            prompt=seed.word_bank_prompt,
            payload={
                "tokens": list(seed.word_bank_tokens),
                "answer": list(seed.word_bank_answer),
            },
        ),
        Exercise(
            position=3,
            exercise_type=ExerciseType.MATCH_PAIRS,
            instruction="Match each pair",
            prompt="Match the Spanish words with their English meanings.",
            payload={
                "pairs": [
                    {"left": spanish, "right": english} for spanish, english in seed.vocabulary
                ],
            },
        ),
        Exercise(
            position=4,
            exercise_type=ExerciseType.FILL_BLANK,
            instruction="Complete the sentence",
            prompt=seed.fill_sentence,
            payload={
                "sentence": seed.fill_sentence,
                "options": list(seed.fill_options),
                "answer": seed.fill_answer,
            },
        ),
        Exercise(
            position=5,
            exercise_type=ExerciseType.TYPE_ANSWER,
            instruction="Type the English translation",
            prompt=seed.type_prompt,
            payload={
                "accepted_answers": list(seed.accepted_answers),
                "case_sensitive": False,
            },
        ),
    ]


def _build_lessons(seed: SkillSeed) -> list[Lesson]:
    return [
        Lesson(
            position=lesson_position,
            title=f"{seed.title} {lesson_position}",
            xp_reward=20,
            exercises=_build_exercises(seed),
        )
        for lesson_position in range(1, 3)
    ]


def _build_course() -> Course:
    units: list[Unit] = []
    for unit_position, unit_seed in enumerate(COURSE_CONTENT, start=1):
        skills: list[Skill] = []
        for skill_position, skill_seed in enumerate(unit_seed.skills, start=1):
            skills.append(
                Skill(
                    position=skill_position,
                    title=skill_seed.title,
                    description=skill_seed.description,
                    icon=skill_seed.icon,
                    color=skill_seed.color,
                    crown_goal=1,
                    lessons=_build_lessons(skill_seed),
                ),
            )
        units.append(
            Unit(
                position=unit_position,
                title=unit_seed.title,
                description=unit_seed.description,
                skills=skills,
            ),
        )

    return Course(
        slug=COURSE_SLUG,
        title="Spanish for English Speakers",
        source_language="English",
        target_language="Spanish",
        description="A compact beginner Spanish course covering useful everyday language.",
        units=units,
    )


def _get_or_create_users(session: Session, seeded_at: datetime) -> User:
    default_user = session.scalar(select(User).where(User.username == DEFAULT_USERNAME))
    if default_user is None:
        default_user = User(
            username=DEFAULT_USERNAME,
            display_name="Yash",
            total_xp=40,
            weekly_xp=40,
            daily_xp=20,
            daily_goal=20,
            gems=500,
            hearts=4,
            max_hearts=5,
            last_heart_regenerated_at=seeded_at - timedelta(minutes=45),
            current_streak=7,
            longest_streak=14,
            last_activity_date=seeded_at.date(),
        )
        session.add(default_user)
    else:
        default_user.display_name = "Yash"

    for user_data in LEADERBOARD_USERS:
        existing_user = session.scalar(
            select(User).where(User.username == user_data["username"]),
        )
        if existing_user is None:
            session.add(
                User(
                    **user_data,
                    daily_goal=20,
                    hearts=5,
                    max_hearts=5,
                    gems=350,
                    last_activity_date=seeded_at.date(),
                ),
            )

    session.flush()
    return default_user


def _ordered_skills(session: Session, course_id: int) -> list[Skill]:
    return list(
        session.scalars(
            select(Skill)
            .join(Unit)
            .where(Unit.course_id == course_id)
            .order_by(Unit.position, Skill.position),
        ),
    )


def _seed_progress(
    session: Session,
    user: User,
    course: Course,
    seeded_at: datetime,
) -> None:
    already_seeded = session.scalar(
        select(UserSkillProgress.id).where(UserSkillProgress.user_id == user.id).limit(1),
    )
    if already_seeded is not None:
        return

    skills = _ordered_skills(session, course.id)
    if len(skills) != EXPECTED_SKILLS:
        raise RuntimeError(f"Expected {EXPECTED_SKILLS} seeded skills, found {len(skills)}.")

    statuses = (
        (SkillStatus.COMPLETED, 100, 1),
        (SkillStatus.COMPLETED, 100, 1),
        (SkillStatus.AVAILABLE, 0, 0),
        (SkillStatus.LOCKED, 0, 0),
        (SkillStatus.LOCKED, 0, 0),
        (SkillStatus.LOCKED, 0, 0),
        (SkillStatus.LOCKED, 0, 0),
        (SkillStatus.LOCKED, 0, 0),
    )
    for skill, (status, percentage, crowns) in zip(skills, statuses, strict=True):
        session.add(
            UserSkillProgress(
                user=user,
                skill=skill,
                status=status,
                progress_percent=percentage,
                crowns=crowns,
                completed_at=seeded_at if status is SkillStatus.COMPLETED else None,
            ),
        )

    completed_lessons = [*skills[0].lessons, *skills[1].lessons]
    for lesson in completed_lessons:
        session.add(
            UserLessonProgress(
                user=user,
                lesson=lesson,
                is_completed=True,
                best_score=100,
                attempts_count=1,
                completed_at=seeded_at,
                last_attempt_at=seeded_at,
            ),
        )
        session.add(
            LessonAttempt(
                user=user,
                lesson=lesson,
                status=AttemptStatus.COMPLETED,
                current_exercise_position=5,
                correct_answers=5,
                incorrect_answers=0,
                hearts_lost=0,
                xp_earned=20,
                completed_at=seeded_at,
            ),
        )

    active_lesson = skills[2].lessons[0]
    session.add(
        UserLessonProgress(
            user=user,
            lesson=active_lesson,
            is_completed=False,
            best_score=60,
            attempts_count=1,
            last_attempt_at=seeded_at,
        ),
    )
    session.add(
        LessonAttempt(
            user=user,
            lesson=active_lesson,
            status=AttemptStatus.ABANDONED,
            current_exercise_position=3,
            correct_answers=3,
            incorrect_answers=1,
            hearts_lost=1,
            xp_earned=0,
            completed_at=seeded_at,
        ),
    )


def _summary(session: Session) -> SeedSummary:
    return SeedSummary(
        users=session.scalar(select(func.count()).select_from(User)) or 0,
        courses=session.scalar(select(func.count()).select_from(Course)) or 0,
        units=session.scalar(select(func.count()).select_from(Unit)) or 0,
        skills=session.scalar(select(func.count()).select_from(Skill)) or 0,
        lessons=session.scalar(select(func.count()).select_from(Lesson)) or 0,
        exercises=session.scalar(select(func.count()).select_from(Exercise)) or 0,
    )


def _course_matches_expected_shape(course: Course) -> bool:
    units = len(course.units)
    skills = sum(len(unit.skills) for unit in course.units)
    lessons = sum(len(skill.lessons) for unit in course.units for skill in unit.skills)
    exercises = sum(
        len(lesson.exercises) for unit in course.units for skill in unit.skills for lesson in skill.lessons
    )
    return (
        units == EXPECTED_UNITS
        and skills == EXPECTED_SKILLS
        and lessons == EXPECTED_LESSONS
        and exercises == EXPECTED_EXERCISES
    )


def seed_database(session: Session, *, seeded_at: datetime | None = None) -> SeedSummary:
    effective_time = seeded_at or utc_now()

    with session.begin():
        course = session.scalar(select(Course).where(Course.slug == COURSE_SLUG))
        if course is None:
            course = _build_course()
            session.add(course)
            session.flush()
        elif not _course_matches_expected_shape(course):
            session.delete(course)
            session.flush()
            course = _build_course()
            session.add(course)
            session.flush()

        default_user = _get_or_create_users(session, effective_time)
        _seed_progress(session, default_user, course, effective_time)
        summary = _summary(session)

    return summary


def main() -> None:
    with SessionLocal() as session:
        summary = seed_database(session)

    print(
        "Seed complete: "
        f"{summary.users} users, {summary.courses} course, {summary.units} units, "
        f"{summary.skills} skills, {summary.lessons} lessons, "
        f"{summary.exercises} exercises.",
    )


if __name__ == "__main__":
    main()
