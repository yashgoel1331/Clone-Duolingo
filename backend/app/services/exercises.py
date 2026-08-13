from typing import Any

from app.models import Exercise
from app.models.enums import ExerciseType
from app.schemas.lesson import PublicExercise


def _normalize(value: Any) -> str:
    return " ".join(str(value).strip().casefold().split())


def public_exercise(exercise: Exercise) -> PublicExercise:
    payload = exercise.payload

    if exercise.exercise_type is ExerciseType.MULTIPLE_CHOICE:
        public_payload = {"options": payload["options"]}
    elif exercise.exercise_type is ExerciseType.WORD_BANK:
        public_payload = {"tokens": payload["tokens"]}
    elif exercise.exercise_type is ExerciseType.MATCH_PAIRS:
        pairs = payload["pairs"]
        public_payload = {
            "left_items": [pair["left"] for pair in pairs],
            "right_items": [pair["right"] for pair in reversed(pairs)],
        }
    elif exercise.exercise_type is ExerciseType.FILL_BLANK:
        public_payload = {
            "sentence": payload["sentence"],
            "options": payload["options"],
        }
    else:
        public_payload = {}

    return PublicExercise(
        id=exercise.id,
        position=exercise.position,
        exercise_type=exercise.exercise_type,
        instruction=exercise.instruction,
        prompt=exercise.prompt,
        payload=public_payload,
    )


def validate_answer(exercise: Exercise, submitted: Any) -> tuple[bool, Any]:
    payload = exercise.payload

    if exercise.exercise_type is ExerciseType.MULTIPLE_CHOICE:
        correction = payload["answer"]
        return _normalize(submitted) == _normalize(correction), correction

    if exercise.exercise_type is ExerciseType.WORD_BANK:
        correction = payload["answer"]
        submitted_tokens = submitted.split() if isinstance(submitted, str) else submitted
        if not isinstance(submitted_tokens, list):
            return False, correction
        normalized_submitted = [_normalize(token) for token in submitted_tokens]
        normalized_answer = [_normalize(token) for token in correction]
        return normalized_submitted == normalized_answer, correction

    if exercise.exercise_type is ExerciseType.MATCH_PAIRS:
        correction = payload["pairs"]
        if not isinstance(submitted, list):
            return False, correction
        try:
            submitted_pairs = {
                (_normalize(pair["left"]), _normalize(pair["right"])) for pair in submitted
            }
        except (KeyError, TypeError):
            return False, correction
        answer_pairs = {
            (_normalize(pair["left"]), _normalize(pair["right"])) for pair in correction
        }
        return submitted_pairs == answer_pairs, correction

    if exercise.exercise_type is ExerciseType.FILL_BLANK:
        correction = payload["answer"]
        return _normalize(submitted) == _normalize(correction), correction

    correction = payload["accepted_answers"][0]
    accepted_answers = {_normalize(answer) for answer in payload["accepted_answers"]}
    normalized_submission = _normalize(submitted)
    if payload.get("case_sensitive", False):
        accepted_answers = {str(answer).strip() for answer in payload["accepted_answers"]}
        normalized_submission = str(submitted).strip()
    return normalized_submission in accepted_answers, correction
