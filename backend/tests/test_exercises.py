from app.models import Exercise
from app.models.enums import ExerciseType
from app.services.exercises import validate_answer


def _exercise(exercise_type: ExerciseType, payload: dict) -> Exercise:
    return Exercise(
        lesson_id=1,
        position=1,
        exercise_type=exercise_type,
        prompt="prompt",
        payload=payload,
    )


def test_validate_answer_normalizes_multiple_choice_and_fill_blank() -> None:
    multiple_choice = _exercise(
        ExerciseType.MULTIPLE_CHOICE,
        {"options": ["Hello", "Goodbye"], "answer": "Hello"},
    )
    fill_blank = _exercise(
        ExerciseType.FILL_BLANK,
        {"sentence": "Yo ___ agua.", "options": ["bebo", "como"], "answer": "bebo"},
    )

    assert validate_answer(multiple_choice, "  hello  ")[0] is True
    assert validate_answer(fill_blank, " BeBo ")[0] is True


def test_validate_answer_normalizes_word_bank_and_match_pairs() -> None:
    word_bank = _exercise(
        ExerciseType.WORD_BANK,
        {"tokens": ["Yo", "como"], "answer": ["Yo", "como"]},
    )
    match_pairs = _exercise(
        ExerciseType.MATCH_PAIRS,
        {
            "pairs": [
                {"left": "pan", "right": "bread"},
                {"left": "agua", "right": "water"},
            ]
        },
    )

    assert validate_answer(word_bank, [" yo ", " CoMo "])[0] is True
    assert (
        validate_answer(
            match_pairs,
            [{"left": " AGUA", "right": "water "}, {"left": "Pan", "right": " BREAD"}],
        )[0]
        is True
    )


def test_validate_answer_handles_type_answer_case_sensitivity() -> None:
    case_insensitive = _exercise(
        ExerciseType.TYPE_ANSWER,
        {"accepted_answers": ["i want bread"], "case_sensitive": False},
    )
    case_sensitive = _exercise(
        ExerciseType.TYPE_ANSWER,
        {"accepted_answers": ["I want bread"], "case_sensitive": True},
    )

    assert validate_answer(case_insensitive, " I WANT BREAD ")[0] is True
    assert validate_answer(case_sensitive, "I want bread")[0] is True
    assert validate_answer(case_sensitive, "i want bread")[0] is False
