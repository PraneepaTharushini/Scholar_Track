import os

from flask import Flask, jsonify
from flask_cors import CORS

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

@app.route('/')
def home():
    return app.send_static_file('index.html')

# If a user refreshes the page on a React screen, this prevents a 404 error
@app.errorhandler(404)
def not_found(e):
    # 🛡️ Safely check if index.html actually exists before trying to send it
    import os
    static_path = os.path.join(app.static_folder, 'index.html') if app.static_folder else ''
    
    if static_path and os.path.exists(static_path):
        return app.send_static_file('index.html')
        
    # If the file is missing, stop gracefully instead of crashing the server
    return "Frontend files are still uploading or missing. Please refresh in a moment!", 404

# IMPORTANT ROUTE FOR REACT
@app.route('/api/test')
def test():
    return jsonify({
        "message": "Backend + Database connected successfully!"
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True, use_reloader=False)