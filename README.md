# Scholar-Track — Task Management & Task Detail Pages

This is the **Tasks** section of the Scholar-Track group project, covering 2 pages:

1. **Task Management** (`/Tasks`) — table view with subject/priority/status filters and a View button per row
2. **Task Details** — detail card showing subject, deadline, status, source, description, AI Analysis box, and Edit / Mark as Completed / Delete actions

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── components/
│   ├── Sidebar.jsx        # Shared navigation sidebar
│   ├── TaskManagement.jsx # Page 1 — table with filters
│   └── TaskDetail.jsx     # Page 2 — detail card + edit modal
├── App.js                 # Routing between the two pages
├── index.js
└── index.css
```

## Notes for group integration

- The other sidebar pages (Dashboard, Upload Documents, etc.) show a placeholder — those are handled by other team members.
- `INITIAL_TASKS` is exported from `TaskManagement.jsx` so it can be replaced with a shared data source during integration.
