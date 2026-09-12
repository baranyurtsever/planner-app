import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import { normalizedPlanScope } from '../domain/planItem'

export function isPlanParticipant(item, userId) {
  if (normalizedPlanScope(item) === 'shared') {
    return !(item.excludedParticipantIds || []).includes(userId)
  }
  return (item.participantIds || []).includes(userId)
}

export function subscribeToParticipationRequests(tripId, callback, onError = console.error) {
  return onSnapshot(
    query(
      collection(db, 'trips', tripId, 'planParticipationRequests'),
      where('status', '==', 'pending'),
    ),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export function subscribeToOwnPlanDetails(tripId, planItemId, userId, callback, onError = console.error) {
  return onSnapshot(
    doc(db, 'trips', tripId, 'planParticipantDetails', `${planItemId}_${userId}`),
    (snapshot) => callback(snapshot.exists() ? snapshot.data() : { note: '', links: [] }),
    onError,
  )
}

export function saveOwnPlanDetails(tripId, planItemId, userId, details) {
  return setDoc(doc(db, 'trips', tripId, 'planParticipantDetails', `${planItemId}_${userId}`), {
    planItemId,
    userId,
    note: details.note?.trim() || '',
    links: (details.links || []).map((link) => link.trim()).filter(Boolean),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function requestPlanParticipation(tripId, item, userId) {
  if (item.visibility === 'private') throw new Error('Gizli bir kişisel plana katılım isteği gönderilemez.')
  if ((item.blockedParticipantIds || []).includes(userId)) {
    throw new Error('Bu plandan ayrıldığın için yeniden istek gönderemezsin.')
  }
  const reference = doc(db, 'trips', tripId, 'planParticipationRequests', `${item.id}_${userId}`)
  const existing = await getDoc(reference)
  if (existing.exists() && existing.data().status === 'pending') return { kind: 'pending' }
  if (existing.exists() && existing.data().status === 'rejected') {
    await updateDoc(reference, { status: 'pending', updatedAt: serverTimestamp() })
    return { kind: 'reopened' }
  }
  await setDoc(reference, {
    planItemId: item.id,
    requesterId: userId,
    itemOwnerId: item.ownerId,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { kind: 'created' }
}

export async function decideParticipationRequest(tripId, item, request, decision, userId) {
  const batch = writeBatch(db)
  const requestRef = doc(db, 'trips', tripId, 'planParticipationRequests', request.id)
  if (decision === 'approved') {
    batch.update(doc(db, 'trips', tripId, 'planItems', item.id), {
      participantIds: arrayUnion(request.requesterId),
      updatedAt: serverTimestamp(),
    })
  }
  batch.update(requestRef, {
    status: decision,
    decidedBy: userId,
    decidedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function includePlanParticipant(tripId, itemId, userId) {
  const departureRef = doc(db, 'trips', tripId, 'planDepartures', `${itemId}_${userId}`)
  const departure = await getDoc(departureRef)
  const batch = writeBatch(db)
  batch.update(doc(db, 'trips', tripId, 'planItems', itemId), {
    participantIds: arrayUnion(userId),
    excludedParticipantIds: arrayRemove(userId),
    blockedParticipantIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  })
  if (departure.exists()) batch.delete(departureRef)
  await batch.commit()
}

export async function leavePlanItem(tripId, item, userId) {
  const expensesQuery = query(
    collection(db, 'expenses'),
    where('tripId', '==', tripId),
    where('ownerId', '==', userId),
    where('planItemId', '==', item.id),
  )
  const expenses = await getDocs(expensesQuery)
  const detailsRef = doc(db, 'trips', tripId, 'planParticipantDetails', `${item.id}_${userId}`)
  const details = await getDoc(detailsRef)
  const batch = writeBatch(db)
  expenses.forEach((snapshot) => batch.delete(snapshot.ref))
  if (details.exists()) batch.delete(detailsRef)
  batch.set(doc(db, 'trips', tripId, 'planDepartures', `${item.id}_${userId}`), {
    planItemId: item.id,
    userId,
    departedAt: serverTimestamp(),
  })
  const itemRef = doc(db, 'trips', tripId, 'planItems', item.id)
  if (normalizedPlanScope(item) === 'shared') {
    batch.update(itemRef, {
      excludedParticipantIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    })
  } else {
    batch.update(itemRef, {
      participantIds: arrayRemove(userId),
      blockedParticipantIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
