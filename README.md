# Scholar Track Monorepo

A comprehensive academic task management and priority system with intelligent scheduling capabilities.

## 📁 Repository Structure

```
scholar-track/
├── frontend/                    # React + Vite UI
│   ├── src/                     # React source code
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/                     # Flask Backend
│   ├── scholar_track_priority/  # Priority engine module
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── models/              # Database queries
│   │   └── tests/               # Unit tests
│   ├── app.py                   # Flask entry point
│   ├── extensions.py            # Database setup
│   └── package.json             # Backend metadata
├── package.json                 # Root workspace config
└── README.md
```

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

This installs dependencies for both frontend and backend.

### Frontend Development

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

Frontend runs on `http://localhost:5173` by default.

### Backend

```bash
npm run backend:dev      # Run Flask development server
npm run backend:test     # Run priority engine unit tests (30 tests)
```

Backend runs on `http://localhost:5000` by default.

## 🏗️ Architecture

### Frontend (`/frontend`)
- **Framework:** React 19 + Vite
- **Styling:** CSS
- **Routing:** React Router v7
- **Charts:** Recharts for analytics
- **Key Features:**
  - Task management dashboard
  - Analytics & insights
  - Academic calendar
  - User profile management

### Backend (`/backend`)
- **Framework:** Flask
- **Database:** PostgreSQL
- **Key Modules:**
  - **Priority Engine:** Intelligent task prioritization
  - **Recommendation System:** Personalized task suggestions
  - **Eisenhower Matrix:** Quadrant-based task classification
  - **Behaviour Scoring:** Student performance tracking

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint frontend code |
| `npm run preview` | Preview production build |
| `npm run backend:dev` | Run Flask backend |
| `npm run backend:test` | Run backend tests |

## 📚 Development Workflow

1. **For frontend changes:** Edit files in `/frontend/src`
2. **For backend changes:** Edit files in `/backend/scholar_track_priority`
3. **Frontend API calls:** Proxy to `http://localhost:5000/api` (configured in `frontend/vite.config.js`)
4. **Hot reload:** Frontend supports HMR; restart backend manually for changes

## 🧪 Testing

### Backend Tests
```bash
npm run backend:test
```
Runs 30+ unit tests for the priority scoring engine (no database required).

### Frontend Tests
Frontend testing framework not yet configured. Planned for future updates.

## 📦 Dependencies

### Frontend
- React 19.2.4
- React Router DOM 7.13.1
- Recharts 3.8.0
- Vite 8.0.0
- ESLint 9.39.4

### Backend
- Flask (integrated via Python)
- PostgreSQL (external database)
- psycopg2 (PostgreSQL adapter)

## 🛠️ Configuration

### Vite Config
Frontend build configuration: `frontend/vite.config.js`
- React plugin enabled
- API proxy to Flask backend

### Git Ignore
Root `.gitignore` ignores:
- All `node_modules` directories (recursively)
- Build outputs (`dist/`)
- Python caches and virtual environments

## 🚢 Deployment

- **Frontend:** Build with `npm run build`, deploy `frontend/dist/` as static files
- **Backend:** Deploy `backend/` directory with Flask application

## 📝 Contributing

1. Create a feature branch from `main`
2. Make changes in appropriate `/frontend` or `/backend` folder
3. Run linters and tests before committing
4. Create a pull request with clear description

## 📄 License

MIT License - see LICENSE file for details

