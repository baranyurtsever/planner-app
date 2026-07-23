---
status: accepted
---

# Store plan times as instants with time zones

Timed Plan Öğeleri will store UTC start and end instants together with IANA start and end time zones, while date-only plans use a separate local-date representation. This prevents collaborators in different locations from interpreting the same shared value differently and supports journeys, such as flights, whose departure and arrival use different time zones.
