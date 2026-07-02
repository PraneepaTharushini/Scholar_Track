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


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config())

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(documents_bp, url_prefix="/api")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")

    if app.config.get("CREATE_DB_ON_START"):
        with app.app_context():
            db.create_all()
            ensure_user_schema(app)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}, 200

    return app
