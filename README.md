# Peregrin

Peregrin is a collaborative travel planner built with React, Vite, Firebase Authentication, and Firestore.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when using a Firebase project other than the configured development project.

## Verification

```bash
npm test
npm run test:rules
npm run lint
npm run build
```

`test:rules` starts the Firestore Emulator and requires OpenJDK 21.

## Source layout

- `src/app/` — routes, layouts, and application composition
- `src/features/` — feature-owned UI, repositories, and domain logic
- `src/shared/` — cross-feature UI and domain policies
- `src/infrastructure/firebase/` — Firebase initialization boundaries
- `firestore.rules` — authoritative authorization policy
- `CONTEXT.md` — domain language
- `docs/adr/` — accepted architectural decisions

The legacy `src/App.jsx` is not part of the active application; `src/main.jsx` renders the feature-oriented router.
