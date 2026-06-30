from app.analytics import analytics_bp
from app.auth.routes import token_required


@analytics_bp.get("/summary")
@token_required
def summary(user):
    return {
        "total": 24,
        "completed": 14,
        "pending": 8,
        "overdue": 2,
    }, 200


@analytics_bp.get("/status")
@token_required
def status(user):
    return {
        "status": [
            {"label": "Completed", "value": 14, "pct": 58, "color": "#22C55E"},
            {"label": "Pending", "value": 8, "pct": 33, "color": "#F59E0B"},
            {"label": "Overdue", "value": 2, "pct": 9, "color": "#EF4444"},
        ],
    }, 200


@analytics_bp.get("/categories")
@token_required
def categories(user):
    return {
        "categories": [
            {"label": "Assignments", "count": 9},
            {"label": "Exams", "count": 5},
            {"label": "Projects", "count": 6},
            {"label": "Reading", "count": 4},
        ],
    }, 200


@analytics_bp.get("/insights")
@token_required
def insights(user):
    return {
        "insights": [
            "Most pending work is grouped around assignments and projects.",
            "Two tasks are overdue and should be reviewed first.",
            "Completion progress is steady; keep upcoming deadlines visible in the calendar.",
        ],
    }, 200


@analytics_bp.get("/timeline")
@token_required
def timeline(user):
    return {
        "timeline": [
            {"label": "Week 1", "completed": 3, "created": 5},
            {"label": "Week 2", "completed": 5, "created": 6},
            {"label": "Week 3", "completed": 4, "created": 7},
            {"label": "Week 4", "completed": 2, "created": 6},
        ],
    }, 200


@analytics_bp.get("/recommendations")
@token_required
def recommendations(user):
    """
    Returns a ranked task list with priority scores and smart recommendations.
    Currently returns structured mock data matching the Dashboard.jsx contract.
    Will be replaced with live data once the Task model is integrated.
    """
    ranked_tasks = [
        {
            "task_id": 1,
            "title": "Database Assignment 02",
            "subject": "DBMS",
            "days_left": -1,
            "status": "pending",
            "quadrant": "DO FIRST",
            "focus_sessions": 2,
            "priority_score": 9.4,
        },
        {
            "task_id": 2,
            "title": "AI Group Presentation",
            "subject": "AI",
            "days_left": 3,
            "status": "pending",
            "quadrant": "DO FIRST",
            "focus_sessions": 1,
            "priority_score": 8.1,
        },
        {
            "task_id": 3,
            "title": "Algebra Midterm Exam",
            "subject": "MAT",
            "days_left": 7,
            "status": "pending",
            "quadrant": "SCHEDULE",
            "focus_sessions": 0,
            "priority_score": 7.3,
        },
        {
            "task_id": 4,
            "title": "Physics Lab Report",
            "subject": "PHY",
            "days_left": 5,
            "status": "pending",
            "quadrant": "SCHEDULE",
            "focus_sessions": 1,
            "priority_score": 6.8,
        },
        {
            "task_id": 5,
            "title": "SE Quiz",
            "subject": "SE",
            "days_left": 14,
            "status": "pending",
            "quadrant": "ELIMINATE",
            "focus_sessions": 0,
            "priority_score": 3.2,
        },
    ]

    overdue = [t for t in ranked_tasks if t["days_left"] < 0]
    do_first = [t for t in ranked_tasks if t["quadrant"] == "DO FIRST"]

    top_rec = (
        f"Submit or catch up on \"{overdue[0]['title']}\" immediately — "
        f"it is {abs(overdue[0]['days_left'])} day(s) overdue."
        if overdue else
        f"Start working on \"{do_first[0]['title']}\" today — "
        f"due in {do_first[0]['days_left']} day(s)."
        if do_first else
        "No urgent tasks right now. Review upcoming tasks and plan ahead."
    )

    return {
        "summary": {
            "total": 24,
            "completed": 14,
            "pending": 8,
            "overdue": 2,
        },
        "ranked_tasks": ranked_tasks,
        "do_first": do_first,
        "schedule": [t for t in ranked_tasks if t["quadrant"] == "SCHEDULE"],
        "delegate": [t for t in ranked_tasks if t["quadrant"] == "DELEGATE"],
        "eliminate": [t for t in ranked_tasks if t["quadrant"] == "ELIMINATE"],
        "overdue_alerts": overdue,
        "behaviour_score": None,
        "behaviour_label": "not enough data yet",
        "summary_message": (
            f"You have {len(overdue)} overdue task(s). Address these immediately. "
            if overdue else
            "Your workload is manageable. Keep it up!"
        ),
        "top_recommendation": top_rec,
    }, 200


@analytics_bp.get("/all")
@token_required
def all_analytics(user):
    """
    Aggregated analytics endpoint — returns summary, status, categories and
    insights in a single request so the frontend getAnalyticsAll() call works.
    """
    return {
        "summary": {
            "total":     24,
            "completed": 14,
            "pending":   8,
            "overdue":   2,
        },
        "status": [
            {"label": "Completed", "value": 14, "pct": 58, "color": "#22C55E"},
            {"label": "Pending",   "value": 8,  "pct": 33, "color": "#F59E0B"},
            {"label": "Overdue",   "value": 2,  "pct": 9,  "color": "#EF4444"},
        ],
        "categories": [
            {"label": "Assignments", "count": 9},
            {"label": "Exams",       "count": 5},
            {"label": "Projects",    "count": 6},
            {"label": "Reading",     "count": 4},
        ],
        "insights": [
            "Most pending work is grouped around assignments and projects.",
            "Two tasks are overdue and should be reviewed first.",
            "Completion progress is steady; keep upcoming deadlines visible in the calendar.",
        ],
    }, 200
