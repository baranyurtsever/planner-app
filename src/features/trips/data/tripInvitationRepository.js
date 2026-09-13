import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import { assertOnline } from '../../../shared/offline/network'

function invitationReference(tripId, inviteeId) {
  return doc(db, 'tripInvitations', `${tripId}_${inviteeId}`)
}

function decode(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function sendTripInvitation(trip, inviterId, inviteeId, role) {
  assertOnline()
  if (trip.ownerId !== inviterId) throw new Error('Yalnız Gezi Sahibi davet gönderebilir.')
  if (trip.memberIds.includes(inviteeId)) throw new Error('Bu kullanıcı zaten Gezi katılımcısı.')
  if (!['editor', 'viewer'].includes(role)) throw new Error('Geçersiz Gezi rolü.')

  const reference = invitationReference(trip.id, inviteeId)
  const existing = await getDoc(reference)
  if (existing.exists() && existing.data().status === 'accepted') {
    throw new Error('Bu davet daha önce kabul edilmiş.')
  }

  const invitation = {
    tripId: trip.id,
    tripName: trip.name,
    inviterId,
    inviteeId,
    role,
    status: 'pending',
    updatedAt: serverTimestamp(),
  }
  if (!existing.exists()) invitation.createdAt = serverTimestamp()
  await setDoc(reference, invitation, { merge: true })
  return reference.id
}

export function subscribeToIncomingTripInvitations(userId, callback, onError = console.error) {
  const invitationsQuery = query(
    collection(db, 'tripInvitations'),
    where('inviteeId', '==', userId),
    where('status', '==', 'pending'),
  )
  return onSnapshot(invitationsQuery, (snapshot) => callback(decode(snapshot)), onError)
}

export function subscribeToTripInvitations(tripId, inviterId, callback, onError = console.error) {
  const invitationsQuery = query(
    collection(db, 'tripInvitations'),
    where('inviterId', '==', inviterId),
  )
  return onSnapshot(invitationsQuery, (snapshot) => callback(
    decode(snapshot).filter((invitation) => invitation.tripId === tripId && invitation.status === 'pending'),
  ), onError)
}

export async function acceptTripInvitation(invitation, userId) {
  assertOnline()
  if (invitation.inviteeId !== userId) throw new Error('Bu daveti kabul etme yetkin yok.')
  const batch = writeBatch(db)
  batch.update(invitationReference(invitation.tripId, userId), {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'trips', invitation.tripId), {
    memberIds: arrayUnion(userId),
    [`memberRoles.${userId}`]: invitation.role,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export function rejectTripInvitation(invitation, userId) {
  assertOnline()
  if (invitation.inviteeId !== userId) throw new Error('Bu daveti reddetme yetkin yok.')
  return updateDoc(invitationReference(invitation.tripId, userId), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  })
}

export function cancelTripInvitation(invitation, userId) {
  assertOnline()
  if (invitation.inviterId !== userId) throw new Error('Bu daveti iptal etme yetkin yok.')
  return updateDoc(invitationReference(invitation.tripId, invitation.inviteeId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  })
}
