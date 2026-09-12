import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'

export async function createTrip({ name, locationName, visibility }, userId) {
  const trip = {
    name: name.trim(),
    locationName: locationName.trim(),
    ownerId: userId,
    memberIds: [userId],
    memberRoles: { [userId]: 'owner' },
    visibility,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const reference = doc(collection(db, 'trips'))
  const batch = writeBatch(db)
  batch.set(reference, trip)
  if (visibility === 'profile') {
    const projection = publicTripProjection(trip)
    batch.set(doc(db, 'publicTrips', reference.id), projection)
    batch.set(doc(db, 'profiles', userId, 'publicTrips', reference.id), projection)
  }
  await batch.commit()
  return reference.id
}

function publicTripProjection(trip) {
  const projection = {
    name: trip.name,
    locationName: trip.locationName ?? '',
    visibility: 'profile',
    status: 'active',
    updatedAt: serverTimestamp(),
  }
  for (const key of ['startDate', 'endDate', 'coverImageUrl']) {
    if (trip[key] !== undefined) projection[key] = trip[key]
  }
  return projection
}

async function ensurePublicTripProjection(trip, userId) {
  if (
    trip.ownerId !== userId ||
    trip.visibility !== 'profile' ||
    trip.status !== 'active'
  ) return

  const publicReference = doc(db, 'publicTrips', trip.id)
  const snapshot = await getDoc(publicReference)
  if (snapshot.exists()) return

  const projection = publicTripProjection(trip)
  const batch = writeBatch(db)
  batch.set(publicReference, projection)
  for (const memberId of trip.memberIds ?? []) {
    batch.set(doc(db, 'profiles', memberId, 'publicTrips', trip.id), projection)
  }
  await batch.commit()
}

async function writeTripWithProjection(tripId, changes) {
  const reference = doc(db, 'trips', tripId)
  const snapshot = await getDoc(reference)
  if (!snapshot.exists()) throw new Error('Gezi bulunamadı.')

  const current = { id: snapshot.id, ...snapshot.data() }
  const next = { ...current, ...changes }
  const previousMemberIds = current.memberIds ?? []
  const nextMemberIds = next.memberIds ?? []
  const batch = writeBatch(db)
  batch.update(reference, { ...changes, updatedAt: serverTimestamp() })

  const publicReference = doc(db, 'publicTrips', tripId)
  if (next.visibility === 'profile' && next.status === 'active') {
    const projection = publicTripProjection(next)
    batch.set(publicReference, projection)
    for (const memberId of nextMemberIds) {
      batch.set(doc(db, 'profiles', memberId, 'publicTrips', tripId), projection)
    }
  } else {
    batch.delete(publicReference)
  }

  for (const memberId of previousMemberIds) {
    if (!(next.visibility === 'profile' && next.status === 'active' && nextMemberIds.includes(memberId))) {
      batch.delete(doc(db, 'profiles', memberId, 'publicTrips', tripId))
    }
  }

  await batch.commit()
}

export function subscribeToUserTrips(userId, callback, onError = console.error) {
  const tripsQuery = query(collection(db, 'trips'), where('memberIds', 'array-contains', userId))
  return onSnapshot(
    tripsQuery,
    async (snapshot) => {
      const trips = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      try {
        await Promise.all(trips.map((trip) => ensurePublicTripProjection(trip, userId)))
      } catch (projectionError) {
        onError(projectionError)
      }
      callback(
        trips
          .filter((trip) => trip.status === 'active')
          .sort((left, right) => left.name.localeCompare(right.name, 'tr')),
      )
    },
    onError,
  )
}

export function subscribeToTrip(tripId, callback, onError = console.error) {
  return onSnapshot(
    doc(db, 'trips', tripId),
    (snapshot) => callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  )
}

export async function getTrip(tripId) {
  const snapshot = await getDoc(doc(db, 'trips', tripId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function getPublicTrip(tripId) {
  const snapshot = await getDoc(doc(db, 'publicTrips', tripId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export function updateTrip(tripId, changes) {
  return writeTripWithProjection(tripId, changes)
}

export function archiveTrip(tripId) {
  return updateTrip(tripId, { status: 'archived' })
}

export function updateTripMember(trip, memberId, role) {
  return updateTrip(trip.id, {
    memberIds: Array.from(new Set([...trip.memberIds, memberId])),
    memberRoles: { ...trip.memberRoles, [memberId]: role },
  })
}

export function removeTripMember(trip, memberId) {
  if (memberId === trip.ownerId) throw new Error('Gezi sahibi katılımcılardan çıkarılamaz.')
  const memberRoles = { ...trip.memberRoles }
  delete memberRoles[memberId]
  return updateTrip(trip.id, {
    memberIds: trip.memberIds.filter((id) => id !== memberId),
    memberRoles,
  })
}
