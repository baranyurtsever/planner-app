const PREFIX = 'peregrin:offline:v1'

function cacheKey(userId, tripId) {
  return `${PREFIX}:${userId}:${tripId}`
}

function read(userId, tripId) {
  try {
    return JSON.parse(window.localStorage.getItem(cacheKey(userId, tripId))) || {}
  } catch {
    return {}
  }
}

function write(userId, tripId, value) {
  try {
    window.localStorage.setItem(cacheKey(userId, tripId), JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private browsing; online use remains unaffected.
  }
}

export function cacheTripForOffline(trip, userId) {
  const cachedTrip = {
    id: trip.id,
    name: trip.name,
    locationName: trip.locationName || '',
    visibility: trip.visibility,
    status: trip.status,
    defaultTimeZone: trip.defaultTimeZone,
    settlementCurrency: trip.settlementCurrency || 'TRY',
    ownerId: trip.ownerId,
    memberCount: trip.memberIds?.length || trip.memberCount || 1,
    memberIds: [userId],
    memberRoles: { [userId]: trip.memberRoles?.[userId] || 'viewer' },
  }
  write(userId, trip.id, { ...read(userId, trip.id), trip: cachedTrip, syncedAt: new Date().toISOString() })
}

export function cachePlansForOffline(tripId, userId, items) {
  const plans = items.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    status: item.status,
    visibility: item.visibility,
    scope: item.scope || 'shared',
    ownerId: item.ownerId === userId ? userId : null,
    participantIds: item.scope === 'personal' && item.participantIds?.includes(userId) ? [userId] : [],
    excludedParticipantIds: item.scope !== 'personal' && item.excludedParticipantIds?.includes(userId) ? [userId] : [],
    location: {
      name: item.location?.name || '',
      address: item.location?.address || '',
      mapUrl: item.location?.mapUrl || '',
      lat: item.location?.lat ?? null,
      lng: item.location?.lng ?? null,
      website: item.location?.website || '',
      phone: item.location?.phone || '',
      openingHours: item.location?.openingHours || '',
      category: item.location?.category || '',
    },
    travelFromPrevious: item.travelFromPrevious || { mode: 'none', durationMinutes: 0 },
    time: item.time,
  }))
  write(userId, tripId, { ...read(userId, tripId), plans, syncedAt: new Date().toISOString() })
}

export function getOfflineTrip(userId, tripId) {
  return read(userId, tripId).trip || null
}

export function getOfflinePlans(userId, tripId) {
  return read(userId, tripId).plans || []
}

export function getOfflineTrips(userId) {
  const prefix = `${PREFIX}:${userId}:`
  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(prefix))
      .map((key) => JSON.parse(window.localStorage.getItem(key))?.trip)
      .filter(Boolean)
  } catch {
    return []
  }
}

export function clearOfflineUserCache(userId) {
  const prefix = `${PREFIX}:${userId}:`
  try {
    Object.keys(window.localStorage).filter((key) => key.startsWith(prefix)).forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Nothing to clear.
  }
}

export function clearAllOfflineCache() {
  try {
    Object.keys(window.localStorage).filter((key) => key.startsWith(`${PREFIX}:`)).forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Nothing to clear.
  }
}
