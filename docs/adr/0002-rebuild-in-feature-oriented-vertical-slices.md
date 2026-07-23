---
status: accepted
---

# Rebuild in feature-oriented vertical slices

The application will replace the monolithic `App.jsx` incrementally with feature-oriented modules for identity and profiles, trips, itinerary, expenses, preparation, and social relationships. Firebase remains the server source of truth behind feature repositories and subscription hooks; only session identity and the selected Gezi identifier are shared globally, public pages use URL-based routing, and each vertical slice must include unit, Firestore Emulator integration, and targeted end-to-end tests before the legacy implementation is removed.
