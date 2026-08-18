import os

# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request, Blueprint
# pyrefly: ignore [missing-import]
from sqlalchemy import inspect, text

from app.config import Config
from app.extensions import db
from app.auth.routes import auth_bp
from app.analytics.routes import analytics_bp
from routes.extra_routes import documents_bp, tasks_bp
from routes import priority_bp
# pyrefly: ignore [missing-import]
from apscheduler.schedulers.background import BackgroundScheduler
from services.notification_service import send_deadline_reminders


def ensure_user_schema(app: Flask) -> None:
    inspector = inspect(db.engine)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "role" not in user_columns:
        db.session.execute(
            text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student'")
        )
        db.session.commit()


def ensure_task_schema(app: Flask) -> None:
    inspector = inspect(db.engine)
    if "tasks" not in inspector.get_table_names():
        return

    task_columns = {column["name"] for column in inspector.get_columns("tasks")}
    if "reminder_sent" not in task_columns:
        db.session.execute(
            text("ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE")
        )
        db.session.commit()


def create_app() -> Flask:
    app = Flask(__name__, static_folder='../static', static_url_path='/')
    app.config.from_object(Config())

    @app.route('/')
    def home():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        import os
        static_path = os.path.join(app.static_folder, 'index.html') if app.static_folder else ''
        if static_path and os.path.exists(static_path):
            return app.send_static_file('index.html')
        return "Frontend files are still uploading or missing. Please refresh in a moment!", 404

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(documents_bp, url_prefix="/api")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(priority_bp, url_prefix="/api/priority")

    if app.config.get("CREATE_DB_ON_START"):
        with app.app_context():
            db.create_all()
            ensure_user_schema(app)
            ensure_task_schema(app)

    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            func=lambda: send_deadline_reminders(app),
            trigger="interval",
            hours=1,
        )
        scheduler.start()

    @app.get("/health")
    def health_check():
        return {"status": "ok"}, 200

    @app.post("/api/test-reminders")
    def test_reminders():
        count = send_deadline_reminders(app)
        return {"reminders_sent": count}, 200

    return app