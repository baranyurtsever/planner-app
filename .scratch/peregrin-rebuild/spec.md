# Peregrin clean-schema rebuild

Status: ready-for-agent

## Goal

Replace the monolithic prototype with a feature-oriented, URL-addressable React application backed by one clean Firestore schema.

## Domain and ownership

- A `Trip` is shared and owns membership, roles, visibility, and plan items.
- A `TripSetting`, preparation item, and expense are owned by one user.
- Expense visibility is `private`, `trip`, or `profile`; visibility never transfers edit rights.
- A plan item belongs to a trip, is editable by the trip owner or an editor, and is visible to either participants or profile visitors.
- A private trip gates all public child content.
- Trips are archived rather than deleted from the client.
- Usernames are globally unique and case-insensitive.
- Public profile data is separate from private account data.
- A friendship is one mutual record created from an accepted request.

## Access

- Trip roles are `owner`, `editor`, and `viewer`.
- Owners manage roles and archive trips.
- Editors manage shared trip data and plan items.
- Viewers manage only their own expenses, preparation items, and trip settings.
- Anonymous profile visitors can read public profiles, public trips, profile-visible expenses, and profile-visible plan items.
- Firestore Security Rules are the authoritative access-control boundary.

## Time

- Timed plan items store UTC instants plus IANA start and end time zones.
- Date-only plan items store a local date without an instant.

## Architecture

- Organize source by feature, with shared domain utilities and Firebase infrastructure.
- Firebase is the server source of truth.
- Share only authentication state and selected trip ID globally.
- Use URL routes for public profiles, public trips, and authenticated trip sections.
- Rebuild in vertical slices and remove the legacy `App.jsx` only after replacement routes are available.

## Required routes

- `/`
- `/login`
- `/register`
- `/u/:username`
- `/u/:username/trips/:tripId`
- `/app/trips`
- `/app/trips/:tripId/plan`
- `/app/trips/:tripId/budget`
- `/app/trips/:tripId/preparation`

## Verification seams

- Unit tests cover public domain-rule interfaces for permissions, visibility, and time values.
- Firestore Emulator integration tests cover anonymous reads, participant reads, and owner/editor/viewer writes.
- UI smoke tests cover registration/login entry, trip creation, and anonymous public profile rendering.
- Lint, tests, and production build pass.
