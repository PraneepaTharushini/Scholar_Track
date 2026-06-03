from datetime import datetime, date
import hashlib
from flask import Blueprint, jsonify, request
from extensions import db
from models.db_queries import get_pending_tasks, get_completed_tasks, save_priority_score
from services.priority_engine import rank_tasks, score_task

auth_bp = Blueprint("auth", __name__)
tasks_bp = Blueprint("tasks", __name__)
analytics_bp = Blueprint("analytics", __name__)

# ---------------------------------------------------------------------------
# Auth Helpers
# ---------------------------------------------------------------------------

def get_current_user_id() -> int | None:
    """Extract authenticated student_id (user_id) from the request."""
    # Look for X-Student-ID, query param, or Bearer token
    sid = request.headers.get("X-Student-ID")
    if not sid:
        sid = request.args.get("student_id")
    if not sid:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            sid = auth_header.split(None, 1)[1].strip()
    if sid and sid.isdigit():
        return int(sid)
    return None

def require_auth(f):
    """Decorator: return 401 if user is not authenticated."""
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = get_current_user_id()
        if user_id is None:
            return jsonify({"error": "Unauthorized. Please log in."}), 401
        return f(*args, user_id=user_id, **kwargs)
    return wrapper

# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields (name, email, password)"}), 400

    p_hash = hashlib.sha256(password.encode()).hexdigest()
    now = datetime.utcnow()

    # Check if user already exists
    check_query = "SELECT id FROM users WHERE email = :email"
    with db.engine.connect() as conn:
        existing = conn.execute(check_query, {"email": email}).mappings().first()
        if existing:
            return jsonify({"error": "User with this email already exists"}), 409

    # Insert user
    insert_query = """
        INSERT INTO users (email, password_hash, name, role, status, created_at)
        VALUES (:email, :password_hash, :name, 'student', 'active', :created_at)
        RETURNING id
    """
    with db.engine.begin() as conn:
        res = conn.execute(insert_query, {
            "email": email,
            "password_hash": p_hash,
            "name": name,
            "created_at": now
        }).mappings().first()
        user_id = res["id"]

    return jsonify({
        "token": str(user_id),
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    p_hash = hashlib.sha256(password.encode()).hexdigest()

    query = "SELECT id, name, email, password_hash FROM users WHERE email = :email"
    with db.engine.connect() as conn:
        user = conn.execute(query, {"email": email}).mappings().first()
        if not user or user["password_hash"] != p_hash:
            return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "token": str(user["id"]),
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })

@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_me(user_id: int):
    query = "SELECT id, name, email FROM users WHERE id = :id"
    with db.engine.connect() as conn:
        user = conn.execute(query, {"id": user_id}).mappings().first()
        if not user:
            return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })

# ---------------------------------------------------------------------------
# Tasks Endpoints
# ---------------------------------------------------------------------------

@tasks_bp.route("", methods=["GET"])
@require_auth
def get_tasks(user_id: int):
    # Fetch and recalculate rankings to serve updated priority scores
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    ranked = rank_tasks(pending, completed)

    # Persist the recalculated scores/quadrants to DB
    for t in ranked:
        save_priority_score(t["task_id"], t["priority_score"], t["quadrant"])

    # Combine ranked pending + completed for a full response
    full_list = []
    # 1. Pending tasks sorted by rank
    for t in ranked:
        full_list.append({
            "id": t["task_id"],
            "title": t["title"],
            "description": t["description"],
            "deadline": t["deadline"].isoformat() if hasattr(t["deadline"], "isoformat") else t["deadline"],
            "status": t["status"],
            "priority": "high" if (t.get("days_left", 0) < 0 or t.get("quadrant") == "DO FIRST") else ("medium" if t.get("quadrant") in ("SCHEDULE", "DELEGATE") else "low"),
            "category": t["category"],
            "importance_override": float(t["importance_override"]) if t["importance_override"] else None,
            "priority_score": float(t["priority_score"]) if t["priority_score"] else None,
            "quadrant": t["quadrant"],
            "source": "Extracted" if t.get("confidence", 100) < 100 else "Manual Entry",
            "focus_sessions": t.get("focus_sessions", 0),
            "ai": {
                "urgency": float(t.get("urgency", 5)),
                "importance": float(t.get("importance", 5)),
                "recommended": t.get("quadrant", "SCHEDULE")
            }
        })
    # 2. Completed tasks
    for t in completed:
        full_list.append({
            "id": t["task_id"],
            "title": t["title"],
            "description": t.get("description", ""),
            "deadline": t["deadline"].isoformat() if hasattr(t["deadline"], "isoformat") else t["deadline"],
            "status": "completed",
            "priority": "low",
            "category": t["category"],
            "importance_override": None,
            "priority_score": None,
            "quadrant": "ELIMINATE",
            "source": "Manual Entry",
            "focus_sessions": t.get("focus_sessions", 0),
            "ai": None
        })

    return jsonify(full_list)

@tasks_bp.route("", methods=["POST"])
@require_auth
def create_task(user_id: int):
    data = request.get_json(force=True)
    title = data.get("title")
    description = data.get("description", "")
    deadline = data.get("deadline")
    category = data.get("category", "Other")
    importance_override = data.get("importance_override")

    if not title or not deadline:
        return jsonify({"error": "Missing title or deadline"}), 400

    now = datetime.utcnow()

    # Insert task
    insert_query = """
        INSERT INTO tasks (user_id, task_title, description, deadline, category, status, confidence, has_error, created_at, updated_at)
        VALUES (:user_id, :task_title, :description, :deadline, :category, 'pending', 100, False, :created_at, :updated_at)
        RETURNING id
    """
    with db.engine.begin() as conn:
        res = conn.execute(insert_query, {
            "user_id": user_id,
            "task_title": title,
            "description": description,
            "deadline": deadline,
            "category": category,
            "created_at": now,
            "updated_at": now
        }).mappings().first()
        task_id = res["id"]

    # Calculate initial scores
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    ranked = rank_tasks(pending, completed)
    for t in ranked:
        if t["task_id"] == task_id:
            save_priority_score(task_id, t["priority_score"], t["quadrant"])

    return jsonify({"success": True, "id": task_id}), 201

@tasks_bp.route("/<int:id>", methods=["PUT"])
@require_auth
def update_task(user_id: int, id: int):
    data = request.get_json(force=True)
    title = data.get("title")
    description = data.get("description")
    deadline = data.get("deadline")
    category = data.get("category")
    status = data.get("status")
    importance_override = data.get("importance_override")

    now = datetime.utcnow()
    completed_at = now if status == "completed" else None

    # Update columns dynamically based on fields provided
    update_parts = []
    params = {"id": id, "user_id": user_id, "updated_at": now}

    if title is not None:
        update_parts.append("task_title = :title")
        params["title"] = title
    if description is not None:
        update_parts.append("description = :description")
        params["description"] = description
    if deadline is not None:
        update_parts.append("deadline = :deadline")
        params["deadline"] = deadline
    if category is not None:
        update_parts.append("category = :category")
        params["category"] = category
    if status is not None:
        update_parts.append("status = :status")
        params["status"] = status
        if status == "completed":
            update_parts.append("completed_at = :completed_at")
            params["completed_at"] = now
        else:
            update_parts.append("completed_at = NULL")
    if importance_override is not None:
        update_parts.append("importance_override = :importance_override")
        params["importance_override"] = importance_override

    if not update_parts:
        return jsonify({"error": "No fields to update"}), 400

    query = f"""
        UPDATE tasks
        SET {', '.join(update_parts)}, updated_at = :updated_at
        WHERE id = :id AND user_id = :user_id
    """
    with db.engine.begin() as conn:
        conn.execute(query, params)

    # Recalculate priority scores
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    ranked = rank_tasks(pending, completed)
    for t in ranked:
        save_priority_score(t["task_id"], t["priority_score"], t["quadrant"])

    return jsonify({"success": True})

@tasks_bp.route("/<int:id>", methods=["DELETE"])
@require_auth
def delete_task(user_id: int, id: int):
    query = "DELETE FROM tasks WHERE id = :id AND user_id = :user_id"
    with db.engine.begin() as conn:
        conn.execute(query, {"id": id, "user_id": user_id})
    return jsonify({"success": True})

@tasks_bp.route("/<int:id>/focus", methods=["POST"])
@require_auth
def increment_focus_session(user_id: int, id: int):
    query = """
        UPDATE tasks
        SET focus_sessions = focus_sessions + 1, updated_at = :updated_at
        WHERE id = :id AND user_id = :user_id
        RETURNING focus_sessions
    """
    now = datetime.utcnow()
    with db.engine.begin() as conn:
        res = conn.execute(query, {"id": id, "user_id": user_id, "updated_at": now}).mappings().first()
    if not res:
        return jsonify({"error": "Task not found"}), 404
    return jsonify({"success": True, "focus_sessions": res["focus_sessions"]})

@tasks_bp.route("/batch", methods=["POST"])
@require_auth
def batch_save_tasks(user_id: int):
    data = request.get_json(force=True)
    tasks_list = data.get("tasks", [])

    if not tasks_list:
        return jsonify({"error": "No tasks provided"}), 400

    now = datetime.utcnow()
    query = """
        INSERT INTO tasks (user_id, task_title, subject, deadline, category, description, confidence, status, has_error, error_message, created_at, updated_at)
        VALUES (:user_id, :task_title, :subject, :deadline, :category, :description, :confidence, 'pending', :has_error, :error_message, :created_at, :updated_at)
    """

    with db.engine.begin() as conn:
        for t in tasks_list:
            conn.execute(query, {
                "user_id": user_id,
                "task_title": t.get("task_title"),
                "subject": t.get("subject", ""),
                "deadline": t.get("deadline"),
                "category": t.get("category", "Assignment"),
                "description": t.get("description", ""),
                "confidence": t.get("confidence", 100),
                "has_error": t.get("has_error", False),
                "error_message": t.get("error_message"),
                "created_at": now,
                "updated_at": now
            })

    # Trigger priority scoring for new tasks
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    ranked = rank_tasks(pending, completed)
    for t in ranked:
        save_priority_score(t["task_id"], t["priority_score"], t["quadrant"])

    return jsonify({"success": True}), 201

# ---------------------------------------------------------------------------
# Analytics Endpoints
# ---------------------------------------------------------------------------

@analytics_bp.route("/summary", methods=["GET"])
@require_auth
def get_analytics_summary(user_id: int):
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    
    total = len(pending) + len(completed)
    overdue_count = 0
    now = date.today()
    for t in pending:
        d = t.get("deadline")
        if d:
            if isinstance(d, datetime):
                d = d.date()
            elif isinstance(d, str):
                d = date.fromisoformat(d[:10])
            if d < now:
                overdue_count += 1

    return jsonify({
        "total": total,
        "completed": len(completed),
        "pending": len(pending),
        "overdue": overdue_count
    })

@analytics_bp.route("/status", methods=["GET"])
@require_auth
def get_analytics_status(user_id: int):
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    ranked = rank_tasks(pending, completed)

    quadrants = {"DO FIRST": 0, "SCHEDULE": 0, "DELEGATE": 0, "ELIMINATE": 0}
    for t in ranked:
        q = t.get("quadrant", "ELIMINATE")
        if q in quadrants:
            quadrants[q] += 1

    total = len(ranked) or 1
    status_list = [
        {"label": "Do First", "value": quadrants["DO FIRST"], "pct": round((quadrants["DO FIRST"] / total) * 100), "color": "#EF4444"},
        {"label": "Schedule", "value": quadrants["SCHEDULE"], "pct": round((quadrants["SCHEDULE"] / total) * 100), "color": "#4F46E5"},
        {"label": "Delegate", "value": quadrants["DELEGATE"], "pct": round((quadrants["DELEGATE"] / total) * 100), "color": "#F59E0B"},
        {"label": "Eliminate", "value": quadrants["ELIMINATE"], "pct": round((quadrants["ELIMINATE"] / total) * 100), "color": "#10B981"}
    ]

    return jsonify({"status": status_list})

@analytics_bp.route("/categories", methods=["GET"])
@require_auth
def get_analytics_categories(user_id: int):
    pending = get_pending_tasks(user_id)
    completed = get_completed_tasks(user_id)
    
    cat_counts = {}
    for t in pending + completed:
        cat = t.get("category") or "Other"
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    cat_list = [{"label": k, "count": v} for k, v in cat_counts.items()]
    return jsonify({"categories": cat_list})

@analytics_bp.route("/insights", methods=["GET"])
@require_auth
def get_analytics_insights(user_id: int):
    completed = get_completed_tasks(user_id)
    
    if not completed:
        return jsonify({"insights": [
            "Add and complete more tasks to unlock personalized habit analysis!",
            "Tasks with early deadlines should be placed in your DO FIRST quadrant.",
            "Keeping your workload distributed prevents study burnout."
        ]})

    on_time = 0
    for t in completed:
        deadline = t.get("deadline")
        comp = t.get("completed_at")
        if deadline and comp:
            if isinstance(deadline, str):
                deadline = date.fromisoformat(deadline[:10])
            elif isinstance(deadline, datetime):
                deadline = deadline.date()
            if isinstance(comp, str):
                comp = date.fromisoformat(comp[:10])
            elif isinstance(comp, datetime):
                comp = comp.date()
            if comp <= deadline:
                on_time += 1

    on_time_pct = round((on_time / len(completed)) * 100)
    
    insights = [
        f"You submit {on_time_pct}% of your tasks on or before the deadline date.",
        "Your most active task category is Exam preparation." if len(completed) > 2 else "Keep completing tasks on time to raise your student behavior score!",
        "Tip: Break down projects into smaller assignments to balance your workload."
    ]

    return jsonify({"insights": insights})
