# Scholar Track

Scholar Track is a full-stack task and academic planning app with a Flask backend and a React + Vite frontend. The project includes task management, analytics, notifications, document uploads, and a priority/recommendation engine for ranking work by urgency and importance.

## Project Structure

- `backend/` - Flask API, database access, services, routes, and tests.
- `frontend/` - React application built with Vite.
- `backend/uploads/` - stored upload samples and generated files.
- `backend/migration_add_priority_columns.sql` - SQL migration for priority features.

## Prerequisites

- Python 3.10+ for the backend
- Node.js 18+ for the frontend
- PostgreSQL database for the Flask API

## Backend Setup

From the `backend/` folder:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Set `DATABASE_URL` if you are not using the default connection in `backend/app.py`, then start the API:

```bash
python run.py
```

The backend runs on port `5000` by default.

## Frontend Setup

From the `frontend/` folder:

```bash
npm install
npm run dev
```

The Vite app runs on the local development server and connects to the Flask API through the services in `frontend/src/services/`.

## Useful Endpoints

- `GET /api/test` - quick backend connectivity check
- `GET /api/priority/categories` - priority category list
- `POST /api/priority/score-task` - preview a task score
- `GET /api/priority/recommendations` - recommendation payload
- `GET /api/priority/quadrants` - Eisenhower quadrant grouping

## Notes

- The backend already registers `auth`, `tasks`, `analytics`, `documents`, and `priority` blueprints in `backend/app.py`.
- The priority module has its own test suite under `backend/tests/` and `backend/v2/tests/`.
- If you update the database schema, review `backend/migration_add_priority_columns.sql` before deploying.
