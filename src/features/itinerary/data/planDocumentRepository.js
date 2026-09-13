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

const allowedKinds = new Set(['ticket', 'reservation', 'qr', 'pdf', 'link'])

function documentsCollection(tripId, planItemId) {
  return collection(db, 'trips', tripId, 'planItems', planItemId, 'documents')
}

function cleanDocument(input) {
  const title = input.title?.trim() || ''
  const url = input.url?.trim() || ''
  const reservationCode = input.reservationCode?.trim() || ''
  if (!title) throw new Error('Belge başlığı zorunludur.')
  if (!url && !reservationCode) throw new Error('Bağlantı veya rezervasyon numarasından biri zorunludur.')
  if (url) {
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
    } catch {
      throw new Error('Geçerli bir http veya https bağlantısı gir.')
    }
  }
  return {
    title,
    kind: allowedKinds.has(input.kind) ? input.kind : 'link',
    url,
    reservationCode,
    visibility: input.visibility === 'trip' ? 'trip' : 'private',
  }
}

function decode(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export function subscribeToPlanDocuments(tripId, planItemId, userId, callback, onError = console.error) {
  const source = documentsCollection(tripId, planItemId)
  let own = []
  let shared = []
  const publish = () => callback([...new Map([...own, ...shared].map((item) => [item.id, item])).values()])
  const unsubscribeOwn = onSnapshot(query(source, where('ownerId', '==', userId)), (snapshot) => {
    own = decode(snapshot)
    publish()
  }, onError)
  const unsubscribeShared = onSnapshot(query(source, where('visibility', '==', 'trip')), (snapshot) => {
    shared = decode(snapshot)
    publish()
  }, onError)
  return () => {
    unsubscribeOwn()
    unsubscribeShared()
  }
}

export function createPlanDocument(tripId, planItemId, userId, input) {
  assertOnline()
  return addDoc(documentsCollection(tripId, planItemId), {
    ...cleanDocument(input),
    planItemId,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updatePlanDocument(tripId, planItemId, documentId, input) {
  assertOnline()
  return updateDoc(doc(db, 'trips', tripId, 'planItems', planItemId, 'documents', documentId), {
    ...cleanDocument(input),
    updatedAt: serverTimestamp(),
  })
}

export function removePlanDocument(tripId, planItemId, documentId) {
  assertOnline()
  return deleteDoc(doc(db, 'trips', tripId, 'planItems', planItemId, 'documents', documentId))
}
