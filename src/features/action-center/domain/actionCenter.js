function planInstant(item) {
  if (item.time?.kind === 'timed') return new Date(item.time.startsAt).getTime()
  if (item.time?.kind === 'date') return new Date(`${item.time.localDate}T00:00:00`).getTime()
  return Number.NaN
}

export function upcomingPlans(itemsByTrip, trips, now = new Date(), days = 7) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = start.getTime() + days * 24 * 60 * 60 * 1000
  const tripsById = new Map(trips.map((trip) => [trip.id, trip]))

  return Object.entries(itemsByTrip).flatMap(([tripId, items]) =>
    items.map((item) => ({ ...item, tripId, tripName: tripsById.get(tripId)?.name || 'Gezi' })),
  ).filter((item) => {
    const instant = planInstant(item)
    return instant >= start.getTime() && instant < end
  }).sort((left, right) => planInstant(left) - planInstant(right))
}

export function pendingActionCount({ invitations, friendRequests, proposalsByTrip, requestsByTrip }) {
  return invitations.length + friendRequests.length +
    Object.values(proposalsByTrip).reduce((sum, items) => sum + items.length, 0) +
    Object.values(requestsByTrip).reduce((sum, items) => sum + items.length, 0)
}
