import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
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
      callback(trips.sort((left, right) => left.name.localeCompare(right.name, 'tr')))
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

export function subscribeToPlanItems(tripId, callback, onError = console.error) {
  return onSnapshot(
    collection(db, 'trips', tripId, 'planItems'),
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      callback(
        items.sort((left, right) =>
          (left.time?.startsAt || left.time?.localDate || '').localeCompare(
            right.time?.startsAt || right.time?.localDate || '',
          ),
        ),
      )
    },
    onError,
  )
}

export function subscribeToPublicPlanItems(tripId, callback, onError = console.error) {
  const planItemsQuery = query(
    collection(db, 'trips', tripId, 'planItems'),
    where('visibility', '==', 'profile'),
  )
  return onSnapshot(
    planItemsQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export async function savePlanItem(tripId, planItem) {
  const reference = planItem.id
    ? doc(db, 'trips', tripId, 'planItems', planItem.id)
    : doc(collection(db, 'trips', tripId, 'planItems'))

  await setDoc(
    reference,
    {
      title: planItem.title.trim(),
      category: planItem.category,
      visibility: planItem.visibility,
      notes: planItem.notes?.trim() || '',
      time: planItem.time,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return reference.id
}

export function removePlanItem(tripId, planItemId) {
  return deleteDoc(doc(db, 'trips', tripId, 'planItems', planItemId))
}
