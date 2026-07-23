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

function mergeExpenses(ownExpenses, sharedExpenses) {
  return [...new Map([...ownExpenses, ...sharedExpenses].map((expense) => [expense.id, expense])).values()]
    .sort((left, right) => (right.spentAt || '').localeCompare(left.spentAt || ''))
}

export function subscribeToTripExpenses(tripId, userId, callback, onError = console.error) {
  let ownExpenses = []
  let sharedExpenses = []
  const publish = () => callback(mergeExpenses(ownExpenses, sharedExpenses))

  const ownQuery = query(
    collection(db, 'expenses'),
    where('tripId', '==', tripId),
    where('ownerId', '==', userId),
  )
  const sharedQuery = query(
    collection(db, 'expenses'),
    where('tripId', '==', tripId),
    where('visibility', 'in', ['trip', 'profile']),
  )

  const unsubscribeOwn = onSnapshot(
    ownQuery,
    (snapshot) => {
      ownExpenses = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      publish()
    },
    onError,
  )
  const unsubscribeShared = onSnapshot(
    sharedQuery,
    (snapshot) => {
      sharedExpenses = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      publish()
    },
    onError,
  )

  return () => {
    unsubscribeOwn()
    unsubscribeShared()
  }
}

export function subscribeToPublicTripExpenses(tripId, callback, onError = console.error) {
  const expensesQuery = query(
    collection(db, 'expenses'),
    where('tripId', '==', tripId),
    where('visibility', '==', 'profile'),
  )
  return onSnapshot(
    expensesQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export async function createExpense(expense, userId) {
  const reference = await addDoc(collection(db, 'expenses'), {
    ...expense,
    title: expense.title.trim(),
    amount: Number(expense.amount),
    ownerId: userId,
    spentAt: expense.spentAt || new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return reference.id
}

export function updateExpense(expenseId, changes) {
  const nextChanges = { ...changes, updatedAt: serverTimestamp() }
  if (changes.amount !== undefined) nextChanges.amount = Number(changes.amount)
  return updateDoc(doc(db, 'expenses', expenseId), {
    ...nextChanges,
  })
}

export function removeExpense(expenseId) {
  return deleteDoc(doc(db, 'expenses', expenseId))
}
