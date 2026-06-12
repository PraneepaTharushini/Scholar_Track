# Scholar Track monorepo

This repository keeps the frontend and backend side by side:

- `scholar-track-ui/` - React + Vite frontend
- `scholar_track_priority/` - Flask backend and priority module

## Run from the repo root

```bash
npm run frontend:dev
npm run frontend:build
npm run frontend:lint
npm run backend:test
```

## Notes

- Root `.gitignore` ignores `node_modules` recursively so installed packages stay out of git.
- The backend module can also be run directly with `python scholar_track_priority/app.py`.
