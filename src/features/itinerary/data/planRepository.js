import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'

const decode = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))

export function subscribeToPlanItems(tripId, callback, onError = console.error) {
  return onSnapshot(collection(db, 'trips', tripId, 'planItems'), (snapshot) => {
    callback(
      decode(snapshot).sort((left, right) =>
        (left.time?.startsAt || left.time?.localDate || '').localeCompare(
          right.time?.startsAt || right.time?.localDate || '',
        ),
      ),
    )
  }, onError)
}

export function subscribeToPublicPlanItems(tripId, callback, onError = console.error) {
  const planItemsQuery = query(
    collection(db, 'trips', tripId, 'planItems'),
    where('visibility', '==', 'profile'),
  )
  return onSnapshot(planItemsQuery, (snapshot) => callback(decode(snapshot)), onError)
}

export async function savePlanItem(tripId, planItem) {
  const reference = planItem.id
    ? doc(db, 'trips', tripId, 'planItems', planItem.id)
    : doc(collection(db, 'trips', tripId, 'planItems'))

  await setDoc(reference, {
    title: planItem.title.trim(),
    category: planItem.category,
    visibility: planItem.visibility,
    notes: planItem.notes?.trim() || '',
    time: planItem.time,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  return reference.id
}

export function removePlanItem(tripId, planItemId) {
  return deleteDoc(doc(db, 'trips', tripId, 'planItems', planItemId))
}
