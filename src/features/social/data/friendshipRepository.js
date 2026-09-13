import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import { assertOnline } from '../../../shared/offline/network'

export function sendFriendRequest(fromId, toId) {
  assertOnline()
  return addDoc(collection(db, 'friendRequests'), {
    fromId,
    toId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export function subscribeToIncomingFriendRequests(userId, callback, onError = console.error) {
  const requestsQuery = query(
    collection(db, 'friendRequests'),
    where('toId', '==', userId),
  )
  return onSnapshot(
    requestsQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export function subscribeToFriendships(userId, callback, onError = console.error) {
  const friendshipsQuery = query(
    collection(db, 'friendships'),
    where('memberIds', 'array-contains', userId),
  )
  return onSnapshot(
    friendshipsQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export async function acceptFriendRequest(request) {
  assertOnline()
  const memberIds = [request.fromId, request.toId].sort()
  const friendshipId = memberIds.join('_')
  const batch = writeBatch(db)
  batch.set(doc(db, 'friendships', friendshipId), {
    memberIds,
    requestId: request.id,
    acceptedBy: request.toId,
    createdAt: serverTimestamp(),
  })
  batch.delete(doc(db, 'friendRequests', request.id))
  await batch.commit()
  return friendshipId
}

export function removeFriendship(friendshipId) {
  assertOnline()
  return deleteDoc(doc(db, 'friendships', friendshipId))
}

export function rejectFriendRequest(requestId) {
  assertOnline()
  return deleteDoc(doc(db, 'friendRequests', requestId))
}
