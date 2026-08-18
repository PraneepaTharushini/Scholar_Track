from datetime import datetime, date
from app.analytics import analytics_bp
from app.auth.routes import token_required
from models.db_queries import get_pending_tasks, get_completed_tasks
from services.priority_engine import rank_tasks


@analytics_bp.get("/summary")
@token_required
def summary(user):
    pending = get_pending_tasks(user.id)
    completed = get_completed_tasks(user.id)
    
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
                
    return {
        "total": total,
        "completed": len(completed),
        "pending": len(pending),
        "overdue": overdue_count
    }, 200


@analytics_bp.get("/status")
@token_required
def status(user):
    pending = get_pending_tasks(user.id)
    completed = get_completed_tasks(user.id)
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
    return {"status": status_list}, 200


@analytics_bp.get("/categories")
@token_required
def categories(user):
    pending = get_pending_tasks(user.id)
    completed = get_completed_tasks(user.id)
    
    cat_counts = {}
    for t in pending + completed:
        cat = t.get("category") or "Other"
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    cat_list = [{"label": k, "count": v} for k, v in cat_counts.items()]
    return {"categories": cat_list}, 200


@analytics_bp.get("/insights")
@token_required
def insights(user):
    completed = get_completed_tasks(user.id)
    
    if not completed:
        return {
            "insights": [
                "Add and complete more tasks to unlock personalized habit analysis!",
                "Tasks with early deadlines should be placed in your DO FIRST quadrant.",
                "Keeping your workload distributed prevents study burnout."
            ]
        }, 200

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
    
    insights_list = [
        f"You submit {on_time_pct}% of your tasks on or before the deadline date.",
        "Your most active task category is Exam preparation." if len(completed) > 2 else "Keep completing tasks on time to raise your student behavior score!",
        "Tip: Break down projects into smaller assignments to balance your workload."
    ]
    return {"insights": insights_list}, 200


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
    pending = get_pending_tasks(user.id)
    completed = get_completed_tasks(user.id)
    ranked_tasks = rank_tasks(pending, completed)

    overdue = [t for t in ranked_tasks if t.get("focus_sessions", 0) < 0 or t.get("days_left", 0) < 0]
    do_first = [t for t in ranked_tasks if t.get("quadrant") == "DO FIRST"]

    top_rec = (
        f"Submit or catch up on \"{overdue[0]['title']}\" immediately — "
        f"it is {abs(overdue[0].get('days_left', 0))} day(s) overdue."
        if overdue else
        f"Start working on \"{do_first[0]['title']}\" today — "
        f"due in {do_first[0].get('days_left', 0)} day(s)."
        if do_first else
        "No urgent tasks right now. Review upcoming tasks and plan ahead."
    )

    return {
        "summary": {
            "total": len(pending) + len(completed),
            "completed": len(completed),
            "pending": len(pending),
            "overdue": len(overdue),
        },
        "ranked_tasks": ranked_tasks,
        "do_first": do_first,
        "schedule": [t for t in ranked_tasks if t.get("quadrant") == "SCHEDULE"],
        "delegate": [t for t in ranked_tasks if t.get("quadrant") == "DELEGATE"],
        "eliminate": [t for t in ranked_tasks if t.get("quadrant") == "ELIMINATE"],
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
    pending = get_pending_tasks(user.id)
    completed = get_completed_tasks(user.id)

    # 1. Summary
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
                
    summary_data = {
        "total": total,
        "completed": len(completed),
        "pending": len(pending),
        "overdue": overdue_count
    }

    # 2. Status
    ranked = rank_tasks(pending, completed)
    quadrants = {"DO FIRST": 0, "SCHEDULE": 0, "DELEGATE": 0, "ELIMINATE": 0}
    for t in ranked:
        q = t.get("quadrant", "ELIMINATE")
        if q in quadrants:
            quadrants[q] += 1

    total_ranked = len(ranked) or 1
    status_list = [
        {"label": "Do First", "value": quadrants["DO FIRST"], "pct": round((quadrants["DO FIRST"] / total_ranked) * 100), "color": "#EF4444"},
        {"label": "Schedule", "value": quadrants["SCHEDULE"], "pct": round((quadrants["SCHEDULE"] / total_ranked) * 100), "color": "#4F46E5"},
        {"label": "Delegate", "value": quadrants["DELEGATE"], "pct": round((quadrants["DELEGATE"] / total_ranked) * 100), "color": "#F59E0B"},
        {"label": "Eliminate", "value": quadrants["ELIMINATE"], "pct": round((quadrants["ELIMINATE"] / total_ranked) * 100), "color": "#10B981"}
    ]

    # 3. Categories
    cat_counts = {}
    for t in pending + completed:
        cat = t.get("category") or "Other"
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    cat_list = [{"label": k, "count": v} for k, v in cat_counts.items()]

    # 4. Insights
    if not completed:
        insights_data = [
            "Add and complete more tasks to unlock personalized habit analysis!",
            "Tasks with early deadlines should be placed in your DO FIRST quadrant.",
            "Keeping your workload distributed prevents study burnout."
        ]
    else:
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
        
        insights_data = [
            f"You submit {on_time_pct}% of your tasks on or before the deadline date.",
            "Your most active task category is Exam preparation." if len(completed) > 2 else "Keep completing tasks on time to raise your student behavior score!",
            "Tip: Break down projects into smaller assignments to balance your workload."
        ]

    return {
        "summary": summary_data,
        "status": status_list,
        "categories": cat_list,
        "insights": insights_data
    }, 200
