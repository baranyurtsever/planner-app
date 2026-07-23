import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
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
  const reference = await addDoc(collection(db, 'trips'), trip)
  return reference.id
}

export function subscribeToUserTrips(userId, callback, onError = console.error) {
  const tripsQuery = query(collection(db, 'trips'), where('memberIds', 'array-contains', userId))
  return onSnapshot(
    tripsQuery,
    (snapshot) => {
      const trips = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
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

export function updateTrip(tripId, changes) {
  return updateDoc(doc(db, 'trips', tripId), {
    ...changes,
    updatedAt: serverTimestamp(),
  })
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
