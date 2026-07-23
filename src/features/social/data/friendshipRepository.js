import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'

export function sendFriendRequest(fromId, toId) {
  return addDoc(collection(db, 'friendRequests'), {
    fromId,
    toId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function acceptFriendRequest(request) {
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
  return deleteDoc(doc(db, 'friendships', friendshipId))
}
