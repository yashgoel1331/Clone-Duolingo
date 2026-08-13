# Duolingo Clone

A full-stack implementation of the core Duolingo lesson and gamification experience. The project
uses a Next.js TypeScript frontend and a FastAPI/SQLAlchemy backend backed by SQLite.

## Repository layout

- `frontend/` — Next.js App Router, TypeScript, Tailwind CSS
- `backend/` — FastAPI, SQLAlchemy, Alembic, SQLite

## Prerequisites

- Node.js 22+ and npm
- Python 3.12+

## Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Install the frontend:

```bash
cd frontend
npm install
```

Install the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Development

From the repository root, run each service in a separate terminal:

```bash
npm run dev:frontend
npm run dev:backend
```

- Frontend: http://localhost:3000
- API health check: http://localhost:8000/api/health
- Interactive API docs: http://localhost:8000/api/docs

## Quality checks

```bash
npm run lint:frontend
npm run test:frontend
npm run build:frontend
npm run test:backend
backend/.venv/bin/ruff check backend
```

## Database migrations

Run Alembic commands from `backend/`:

```bash
.venv/bin/alembic upgrade head
.venv/bin/alembic current
```

Create a migration after changing the SQLAlchemy models:

```bash
.venv/bin/alembic revision --autogenerate -m "describe change"
```

## Seed data

After applying migrations, seed the demo course from the repository root:

```bash
npm run migrate:backend
npm run seed:backend
```

The seed command is safe to rerun; it checks stable course slugs and usernames before inserting
anything. It creates:

- One Spanish-for-English course with 3 units, 6 skills, 6 lessons, and 30 exercises.
- One Spanish-for-English course with 4 units, 8 skills, 16 lessons, and 80 exercises.
- Six users: the default `learner` plus five users for the leaderboard.
- Sixteen examples of every required exercise type.
- Completed, available, partially progressed, and locked skill states for `learner`.
- Four completed lesson attempts and one abandoned attempt for profile and progress testing.

The default learner starts with 40 XP, a 7-day streak, 4 of 5 hearts, 500 gems, and a completed
20-XP daily goal.

## API overview

The MVP assumes the seeded `learner` is logged in. That decision is isolated in
`app/api/dependencies.py`, so real authentication can replace it later.

- `GET /api/me` — identity and top-bar XP, streak, hearts, gems, and daily goal stats.
- `GET /api/me/profile` — learner stats plus completed skills, lessons, and attempt count.
- `GET /api/path` — the ordered course tree with completed, available, and locked skill states.
- `POST /api/lessons/{lesson_id}/start` — start or resume one active lesson attempt.
- `POST /api/attempts/{attempt_id}/answer` — validate the next answer and immediately return
  feedback; wrong answers remove one heart.
- `POST /api/attempts/{attempt_id}/complete` — award XP, update streak/progress, and unlock the
  next skill. Repeating this request does not award XP twice.
- `GET /api/leaderboard` — users ranked by weekly XP.
- `POST /api/hearts/refill` — refills hearts and deducts 50 gems on every use.

Lesson-start responses expose only the information needed to render exercises. Canonical answers
and matching pairs remain server-side until feedback is returned. Exercises must be submitted in
their stored order. Hearts regenerate lazily every four hours when learner stats are read.

Run the backend and explore all request/response contracts at http://localhost:8000/api/docs.

## Database schema

Course content follows an ordered hierarchy:

```text
Course -> Unit -> Skill -> Lesson -> Exercise
```

- `users` stores the learner profile and persistent XP, daily goal, gems, hearts, and streak data.
  Gems are seeded values and are only spent (not earned) in this MVP.
- `courses`, `units`, `skills`, and `lessons` define the ordered learning path.
- `exercises` stores the prompt, exercise type, and a type-specific JSON payload.
- `user_skill_progress` stores each skill's lock state, completion percentage, and crowns.
- `user_lesson_progress` stores completion, best score, and attempt totals per learner and lesson.
- `lesson_attempts` records an active or finished lesson session, answers, hearts lost, and XP earned.

Position values are unique within their parent, such as a unit's position inside a course. User
progress is unique for each user/skill or user/lesson pair. Check constraints prevent invalid
values such as negative XP, more hearts than the configured maximum, or progress above 100%.
Deleting content cascades to its descendants and associated progress records.

## Exercise payload contract

The `exercise_type` determines the shape of the `payload` JSON. The seed and API layers must
validate these shapes before saving or returning content.

```json
{
  "multiple_choice": {
    "options": ["Hello", "Goodbye", "Thanks"],
    "answer": "Hello"
  },
  "word_bank": {
    "tokens": ["I", "eat", "apples"],
    "answer": ["I", "eat", "apples"]
  },
  "match_pairs": {
    "pairs": [
      {"left": "hola", "right": "hello"},
      {"left": "adiós", "right": "goodbye"}
    ]
  },
  "fill_blank": {
    "sentence": "Yo ___ agua",
    "options": ["bebo", "como", "leo"],
    "answer": "bebo"
  },
  "type_answer": {
    "accepted_answers": ["good morning", "morning"],
    "case_sensitive": false
  }
}
```

Canonical answers stay in the database but must be removed from lesson-start API responses. The
backend will validate submitted answers and return feedback separately.

The API surface and deployment guide will be documented as those features are implemented.
