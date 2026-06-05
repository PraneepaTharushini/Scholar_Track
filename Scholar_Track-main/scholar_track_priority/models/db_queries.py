"""
db_queries.py
=============
All database interactions for the priority module.
Uses SQLAlchemy (already installed in most Flask projects).

You only need to call two functions from your Flask routes:
  - get_pending_tasks(student_id)
  - get_completed_tasks(student_id)

The rest of the business logic lives in priority_engine.py.
"""

from datetime import datetime

# Import the shared db instance from the local extensions module.
# This keeps the routes independent from the app entrypoint.


def _get_db():
    """Lazy import of db to avoid circular import issues."""
    from extensions import db
    return db


def get_pending_tasks(student_id: int) -> list[dict]:
    """
    Fetch all non-completed tasks for a student from PostgreSQL.

    Returns a list of dicts ready for priority_engine.score_task().
    """
    db = _get_db()

    query = """
        SELECT
            t.id                     AS task_id,
            t.task_title             AS title,
            t.description,
            t.deadline               AS deadline,
            t.status,
            t.priority_score,
            t.category               AS category,
            t.importance_override,
            t.focus_sessions,
            t.user_id                AS student_id
        FROM tasks t
        WHERE t.user_id = :student_id
          AND t.status != 'completed'
        ORDER BY t.deadline ASC
        """

    with db.engine.connect() as conn:
        rows = conn.execute(query, {"student_id": student_id}).mappings().all()

    return [dict(row) for row in rows]


def get_completed_tasks(student_id: int) -> list[dict]:
    """
    Fetch all completed tasks for behaviour scoring.

    Each returned dict has 'deadline' and 'completed_at' so
    priority_engine._behaviour_score() can use them.
    """
    db = _get_db()
    query = """
        SELECT
            t.id                AS task_id,
            t.task_title        AS title,
            t.deadline          AS deadline,
            t.completed_at,
            t.category          AS category,
            t.focus_sessions
        FROM tasks t
        WHERE t.user_id = :student_id
          AND t.status = 'completed'
          AND t.completed_at IS NOT NULL
        ORDER BY t.completed_at DESC
        """

    with db.engine.connect() as conn:
        rows = conn.execute(query, {"student_id": student_id}).mappings().all()

    return [dict(row) for row in rows]


def save_priority_score(task_id: int, score: float, quadrant: str) -> None:
    """
    Persist the calculated priority_score and quadrant back to the task row.

    Call this after scoring so the frontend can also read scores directly
    from the DB without calling the API every time.
    """
    db = _get_db()
    query = """
        UPDATE tasks
        SET priority_score = :score,
            quadrant       = :quadrant,
            scored_at      = :now
        WHERE id = :task_id
    """

    with db.engine.begin() as conn:   # begin() auto-commits
        conn.execute(query, {
            "score":    score,
            "quadrant": quadrant,
            "now":      datetime.utcnow(),
            "task_id":  task_id,
        })

