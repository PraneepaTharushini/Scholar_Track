import os

# Helper to load local .env files without external dependencies
def load_env_file():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(backend_dir, ".env")
    if os.path.exists(env_path):
        print("Loading environment from:", env_path)
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")

load_env_file()

from flask import Flask, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

from extensions import db
from routes import priority_bp
from routes.extra_routes import auth_bp, tasks_bp, analytics_bp, documents_bp


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:lXkbAOtVInUIMHWZFygvINIaKGlspqwJ@tramway.proxy.rlwy.net:33180/railway",
)

app = Flask(__name__, static_folder='static', static_url_path='/')
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
db.init_app(app)
app.register_blueprint(priority_bp, url_prefix="/api/priority")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
app.register_blueprint(documents_bp, url_prefix="/api")

print("API ROUTES LOADED")
print("REGISTERED ROUTES:", app.url_map)

print("Trying to connect database...")

try:
    with app.app_context():
        with db.engine.connect():
            print("Database Connected Successfully!")
except Exception as e:
    print("Database Connection Error:")
    print(e)

# ---------------------------------------------------------------------------
# Email Reminder Scheduler
# ---------------------------------------------------------------------------

def run_daily_reminders():
    print("Running scheduled email reminders...")
    from routes.extra_routes import sync_notifications_from_tasks
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                users = conn.execute(
                    "SELECT id FROM users WHERE status = 'active' OR is_active = true"
                ).mappings().all()
            for user in users:
                sync_notifications_from_tasks(user["id"])
            print(f"Email reminders sent to {len(users)} users.")
        except Exception as e:
            print(f"Scheduler error: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(run_daily_reminders, 'interval', hours=24, id='daily_reminders')
scheduler.start()
print("Email reminder scheduler started!")

# ---------------------------------------------------------------------------

@app.route('/')
def home():
    return app.send_static_file('index.html')

# If a user refreshes the page on a React screen, this prevents a 404 error
@app.errorhandler(404)
def not_found(e):
    import os
    static_path = os.path.join(app.static_folder, 'index.html') if app.static_folder else ''
    
    if static_path and os.path.exists(static_path):
        return app.send_static_file('index.html')
        
    return "Frontend files are still uploading or missing. Please refresh in a moment!", 404

# IMPORTANT ROUTE FOR REACT
@app.route('/api/test')
def test():
    return jsonify({
        "message": "Backend + Database connected successfully!"
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True, use_reloader=False)