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
from sqlalchemy import text

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
            t.quadrant,
            t.category               AS category,
            t.importance_override,
            t.focus_sessions,
            t.user_id                AS student_id,
            t.confidence,
            t.subject
        FROM tasks t
        WHERE t.user_id = :student_id
          AND t.status != 'completed'
        ORDER BY t.deadline ASC
        """

    with db.engine.connect() as conn:
        rows = conn.execute(text(query), {"student_id": student_id}).mappings().all()

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
            t.focus_sessions,
            t.confidence,
            t.subject
        FROM tasks t
        WHERE t.user_id = :student_id
          AND t.status = 'completed'
          AND t.completed_at IS NOT NULL
        ORDER BY t.completed_at DESC
        """

    with db.engine.connect() as conn:
        rows = conn.execute(text(query), {"student_id": student_id}).mappings().all()

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
        conn.execute(text(query), {
            "score":    score,
            "quadrant": quadrant,
            "now":      datetime.utcnow(),
            "task_id":  task_id,
        })


def save_priority_scores_batch(ranked_tasks: list[dict], pending_tasks: list[dict]) -> None:
    """
    Persist the calculated priority scores and quadrants back to the task rows in a single batch,
    only updating tasks whose score or quadrant has actually changed.
    """
    db = _get_db()
    
    # Create lookup map for existing values
    pending_lookup = {t["task_id"]: t for t in pending_tasks}
    
    updates = []
    now = datetime.utcnow()
    
    for t in ranked_tasks:
        orig = pending_lookup.get(t["task_id"])
        
        score_diff = False
        if orig:
            orig_score = orig.get("priority_score")
            new_score = t["priority_score"]
            if orig_score is None and new_score is not None:
                score_diff = True
            elif orig_score is not None and new_score is None:
                score_diff = True
            elif orig_score is not None and new_score is not None:
                if abs(float(orig_score) - float(new_score)) > 0.0001:
                    score_diff = True
        else:
            score_diff = True
            
        quadrant_diff = not orig or orig.get("quadrant") != t["quadrant"]
        
        if score_diff or quadrant_diff:
            updates.append({
                "score": t["priority_score"],
                "quadrant": t["quadrant"],
                "now": now,
                "task_id": t["task_id"]
            })
            
    if not updates:
        return
        
    query = """
        UPDATE tasks
        SET priority_score = :score,
            quadrant       = :quadrant,
            scored_at      = :now
        WHERE id = :task_id
    """
    
    with db.engine.begin() as conn:
        for update in updates:
            conn.execute(text(query), update)


def get_tasks_due_soon(hours: int = 24) -> list[dict]:
    """
    Fetch all pending tasks across ALL students whose deadline
    falls within the next `hours`, and that haven't been reminded yet.
    """
    db = _get_db()
    query = text("""
        SELECT
            t.id           AS task_id,
            t.task_title   AS title,
            t.deadline     AS deadline,
            t.user_id      AS student_id,
            u.email        AS email,
            u.name         AS name
        FROM tasks t
        JOIN users u ON u.id = t.user_id
        WHERE t.status != 'completed'
          AND t.reminder_sent = FALSE
          AND t.deadline BETWEEN NOW() AND NOW() + (:hours || ' hours')::interval
        ORDER BY t.deadline ASC
    """)
    with db.engine.connect() as conn:
        rows = conn.execute(query, {"hours": hours}).mappings().all()
    return [dict(row) for row in rows]


def mark_reminder_sent(task_id: int) -> None:
    """Flag a task so its reminder email isn't sent again."""
    db = _get_db()
    query = text("UPDATE tasks SET reminder_sent = TRUE WHERE id = :task_id")
    with db.engine.begin() as conn:
        conn.execute(query, {"task_id": task_id})