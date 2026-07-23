import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import {
  canDirectEditPlanItem,
  canProposePlanChange,
  PLAN_SCOPE,
} from '../../../shared/domain/access'
import {
  normalizePlanItemForWrite,
  publicPlanFields,
} from '../domain/planItem'

const decode = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))

function cleanPlanItem(planItem, userId) {
  return normalizePlanItemForWrite(planItem, userId)
}

function changedPlanPatch(original, cleaned, userId) {
  if (!original) return cleaned
  const previous = cleanPlanItem(original, userId)
  return Object.fromEntries(
    Object.entries(cleaned).filter(([field, value]) =>
      JSON.stringify(value) !== JSON.stringify(previous[field]),
    ),
  )
}

function publicPlanPayload(planItem) {
  return {
    ...publicPlanFields(planItem),
    updatedAt: serverTimestamp(),
  }
}

function syncPublicPlan(batch, tripId, itemId, planItem) {
  const publicReference = doc(db, 'trips', tripId, 'publicPlanItems', itemId)
  if (planItem?.visibility === 'profile') {
    batch.set(publicReference, publicPlanPayload(planItem), { merge: true })
  } else {
    batch.delete(publicReference)
  }
}

function proposalReference(tripId, proposerId, targetItemId, action) {
  return doc(
    db,
    'trips',
    tripId,
    'planChangeProposals',
    `${targetItemId}_${proposerId}_${action}`,
  )
}

async function saveProposal({ tripId, proposerId, targetItemId, action, patch }) {
  const stableReference = proposalReference(tripId, proposerId, targetItemId, action)
  const existing = await getDoc(stableReference)
  const reference = existing.exists() && existing.data().status === 'pending'
    ? stableReference
    : existing.exists()
      ? doc(collection(db, 'trips', tripId, 'planChangeProposals'))
      : stableReference
  const nextProposal = {
    proposerId,
    targetItemId,
    action,
    patch,
    status: 'pending',
    updatedAt: serverTimestamp(),
  }
  if (!existing.exists() || reference.id !== stableReference.id) {
    nextProposal.createdAt = serverTimestamp()
  }
  await setDoc(reference, nextProposal, { merge: true })
  return { kind: 'proposal', id: reference.id, targetItemId }
}

export function subscribeToPlanItems(tripId, userId, callback, onError = console.error) {
  const visibleQuery = query(
    collection(db, 'trips', tripId, 'planItems'),
    where('visibility', 'in', ['trip', 'profile']),
  )
  const privateOwnerQuery = query(
    collection(db, 'trips', tripId, 'planItems'),
    where('ownerId', '==', userId),
    where('visibility', '==', 'private'),
  )
  const snapshots = { visible: [], private: [] }
  const publish = () => {
    const uniqueItems = new Map(
      [...snapshots.visible, ...snapshots.private].map((item) => [item.id, item]),
    )
    callback(
      [...uniqueItems.values()].sort((left, right) =>
        (left.time?.startsAt || left.time?.localDate || '').localeCompare(
          right.time?.startsAt || right.time?.localDate || '',
        ),
      ),
    )
  }
  const unsubscribeVisible = onSnapshot(visibleQuery, (snapshot) => {
    snapshots.visible = decode(snapshot)
    publish()
  }, onError)
  const unsubscribePrivate = onSnapshot(privateOwnerQuery, (snapshot) => {
    snapshots.private = decode(snapshot)
    publish()
  }, onError)
  return () => {
    unsubscribeVisible()
    unsubscribePrivate()
  }
}

export function subscribeToPlanProposals(tripId, callback, onError = console.error) {
  return onSnapshot(
    collection(db, 'trips', tripId, 'planChangeProposals'),
    (snapshot) => callback(decode(snapshot).filter((proposal) => proposal.status === 'pending')),
    onError,
  )
}

export function subscribeToPublicPlanItems(tripId, callback, onError = console.error) {
  return onSnapshot(
    collection(db, 'trips', tripId, 'publicPlanItems'),
    (snapshot) => callback(decode(snapshot)),
    onError,
  )
}

export async function savePlanItem(trip, planItem, userId) {
  const reference = planItem.id
    ? doc(db, 'trips', trip.id, 'planItems', planItem.id)
    : doc(collection(db, 'trips', trip.id, 'planItems'))
  const cleaned = cleanPlanItem(planItem, userId)
  const permissionItem = { ...planItem, ...cleaned }

  if (cleaned.scope === PLAN_SCOPE.SHARED && canProposePlanChange(trip, permissionItem, userId)) {
    const patch = planItem.id
      ? changedPlanPatch(planItem._original, cleaned, userId)
      : cleaned
    if (planItem.id && Object.keys(patch).length === 0) return { kind: 'unchanged', id: planItem.id }
    return saveProposal({
      tripId: trip.id,
      proposerId: userId,
      targetItemId: reference.id,
      action: planItem.id ? 'update' : 'create',
      patch,
    })
  }

  if (!canDirectEditPlanItem(trip, permissionItem, userId)) {
    throw new Error('Bu Plan Öğesini doğrudan değiştirme yetkin yok.')
  }

  const savedItem = {
    ...cleaned,
    createdBy: planItem.createdBy || userId,
    createdAt: planItem.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const batch = writeBatch(db)
  batch.set(reference, savedItem, { merge: true })
  syncPublicPlan(batch, trip.id, reference.id, cleaned)
  await batch.commit()
  return { kind: 'item', id: reference.id }
}

export async function changePlanItem(trip, planItem, userId, patch) {
  if (canDirectEditPlanItem(trip, planItem, userId)) {
    const cleaned = cleanPlanItem({ ...planItem, ...patch }, userId)
    const batch = writeBatch(db)
    batch.update(doc(db, 'trips', trip.id, 'planItems', planItem.id), {
      ...cleaned,
      updatedAt: serverTimestamp(),
    })
    syncPublicPlan(batch, trip.id, planItem.id, cleaned)
    await batch.commit()
    return { kind: 'item', id: planItem.id }
  }

  if (canProposePlanChange(trip, planItem, userId)) {
    return saveProposal({
      tripId: trip.id,
      proposerId: userId,
      targetItemId: planItem.id,
      action: 'update',
      patch,
    })
  }

  throw new Error('Bu Plan Öğesini değiştirme veya değişiklik önerme yetkin yok.')
}

export async function removePlanItem(trip, planItem, userId) {
  if (canDirectEditPlanItem(trip, planItem, userId)) {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'trips', trip.id, 'planItems', planItem.id))
    batch.delete(doc(db, 'trips', trip.id, 'publicPlanItems', planItem.id))
    await batch.commit()
    return { kind: 'item', id: planItem.id }
  }

  if (canProposePlanChange(trip, planItem, userId)) {
    return saveProposal({
      tripId: trip.id,
      proposerId: userId,
      targetItemId: planItem.id,
      action: 'delete',
      patch: {},
    })
  }

  throw new Error('Bu Plan Öğesini silme veya silme önerisi oluşturma yetkin yok.')
}

export async function approvePlanProposal(tripId, proposalId, ownerId) {
  const proposalRef = doc(db, 'trips', tripId, 'planChangeProposals', proposalId)
  return runTransaction(db, async (transaction) => {
    const proposalSnapshot = await transaction.get(proposalRef)
    if (!proposalSnapshot.exists()) throw new Error('Öneri bulunamadı.')
    const proposal = proposalSnapshot.data()
    if (proposal.status !== 'pending') throw new Error('Öneri artık beklemede değil.')

    const itemRef = doc(db, 'trips', tripId, 'planItems', proposal.targetItemId)
    const publicRef = doc(db, 'trips', tripId, 'publicPlanItems', proposal.targetItemId)
    const itemSnapshot = proposal.action === 'create' ? null : await transaction.get(itemRef)
    if (proposal.action === 'delete') {
      transaction.delete(itemRef)
      transaction.delete(publicRef)
    } else if (proposal.action === 'create') {
      const createdItem = {
        ...proposal.patch,
        createdBy: proposal.proposerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      transaction.set(itemRef, createdItem)
      if (proposal.patch.visibility === 'profile') {
        transaction.set(publicRef, publicPlanPayload(proposal.patch))
      }
    } else {
      const updatedItem = normalizePlanItemForWrite(
        { ...itemSnapshot.data(), ...proposal.patch },
        itemSnapshot.data().ownerId || proposal.proposerId,
      )
      transaction.update(itemRef, { ...updatedItem, updatedAt: serverTimestamp() })
      if (updatedItem.visibility === 'profile') {
        transaction.set(publicRef, publicPlanPayload(updatedItem), { merge: true })
      } else {
        transaction.delete(publicRef)
      }
    }
    transaction.update(proposalRef, {
      status: 'approved',
      decidedBy: ownerId,
      decidedAt: serverTimestamp(),
    })
  })
}

export function rejectPlanProposal(tripId, proposalId, ownerId) {
  return updateDoc(doc(db, 'trips', tripId, 'planChangeProposals', proposalId), {
    status: 'rejected',
    decidedBy: ownerId,
    decidedAt: serverTimestamp(),
  })
}

export function withdrawPlanProposal(tripId, proposalId, proposerId) {
  return updateDoc(doc(db, 'trips', tripId, 'planChangeProposals', proposalId), {
    status: 'withdrawn',
    withdrawnBy: proposerId,
    decidedAt: serverTimestamp(),
  })
}
