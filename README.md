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

## Mobile installation and offline access

- Android: open the production site in a supported browser and use **Uygulamayı yükle**.
- iPhone/iPad: open the site in Safari, then choose **Paylaş > Ana Ekrana Ekle**.
- After a trip has loaded once, its last synced itinerary and addresses remain readable without a connection.
- Offline mode is read-only. Changes are rejected with a clear message until the connection returns.
- Offline data is scoped to the signed-in user and cleared on logout.

## Source layout

- `src/app/` — routes, layouts, and application composition
- `src/features/` — feature-owned UI, repositories, and domain logic
- `src/shared/` — cross-feature UI and domain policies
- `src/infrastructure/firebase/` — Firebase initialization boundaries
- `firestore.rules` — authoritative authorization policy
- `CONTEXT.md` — domain language
- `docs/adr/` — accepted architectural decisions

The legacy `src/App.jsx` is not part of the active application; `src/main.jsx` renders the feature-oriented router.
