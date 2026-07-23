---
status: accepted
---

# Separate shared trip data from user-owned data

A Gezi is the shared source of truth for membership, roles, profile visibility, and Plan Öğeleri, while Gezi Ayarları, Hazırlık Öğeleri, and Harcamalar remain owned by individual users. Harcama visibility is independent from ownership, Gezi visibility gates all public child content, authorization is enforced by versioned Firestore Security Rules, and Gezi removal is archival rather than client-side cascading deletion. This avoids the current duplicate user-scoped and shared trip models, protects private data, and gives every record one authoritative owner.
