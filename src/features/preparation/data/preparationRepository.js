import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import { assertOnline } from '../../../shared/offline/network'

export function subscribeToPreparationItems(tripId, userId, callback, onError = console.error) {
  const itemsQuery = query(
    collection(db, 'preparationItems'),
    where('tripId', '==', tripId),
    where('ownerId', '==', userId),
  )
  return onSnapshot(
    itemsQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export function createPreparationItem({ tripId, text, category }, userId) {
  assertOnline()
  return addDoc(collection(db, 'preparationItems'), {
    tripId,
    ownerId: userId,
    text: text.trim(),
    category,
    completed: false,
    createdAt: serverTimestamp(),
  })
}

export function togglePreparationItem(item) {
  assertOnline()
  return updateDoc(doc(db, 'preparationItems', item.id), { completed: !item.completed })
}

export function removePreparationItem(itemId) {
  assertOnline()
  return deleteDoc(doc(db, 'preparationItems', itemId))
}
