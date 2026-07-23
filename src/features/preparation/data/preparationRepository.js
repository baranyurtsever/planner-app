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
  return updateDoc(doc(db, 'preparationItems', item.id), { completed: !item.completed })
}

export function removePreparationItem(itemId) {
  return deleteDoc(doc(db, 'preparationItems', itemId))
}
