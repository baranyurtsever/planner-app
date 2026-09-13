import {
  collection,
  doc,
  getDoc,
  getDocs,
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
import { cachePlansForOffline, getOfflinePlans } from '../../../shared/offline/offlineCache'
import { assertOnline } from '../../../shared/offline/network'
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
const reconciledPublicPlans = new Set()

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

const CONTENT_FIELDS = new Set([
  'title', 'category', 'status', 'visibility', 'notes', 'location', 'travelFromPrevious', 'time',
])

export function changedPlanContentPatch(original, cleaned, userId) {
  return Object.fromEntries(
    Object.entries(changedPlanPatch(original, cleanPlanItem(cleaned, userId), userId))
      .filter(([field]) => CONTENT_FIELDS.has(field)),
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

async function reconcilePublicPlanProjections(tripId, userId, items) {
  const reconciliationKey = `${tripId}:${userId}`
  if (reconciledPublicPlans.has(reconciliationKey)) return
  reconciledPublicPlans.add(reconciliationKey)

  try {
    const [tripSnapshot, publicSnapshot] = await Promise.all([
      getDoc(doc(db, 'trips', tripId)),
      getDocs(collection(db, 'trips', tripId, 'publicPlanItems')),
    ])
    if (!tripSnapshot.exists()) return

    const trip = tripSnapshot.data()
    const isOwner = trip.ownerId === userId
    const sourceById = new Map(items.map((item) => [item.id, item]))
    const batch = writeBatch(db)
    let writes = 0

    for (const item of items) {
      const canPublish = item.scope === PLAN_SCOPE.PERSONAL
        ? item.ownerId === userId
        : isOwner
      if (item.visibility === 'profile' && canPublish) {
        batch.set(
          doc(db, 'trips', tripId, 'publicPlanItems', item.id),
          publicPlanPayload(item),
        )
        writes += 1
      }
    }

    if (isOwner) {
      for (const publicDocument of publicSnapshot.docs) {
        const source = sourceById.get(publicDocument.id)
        if (!source || source.visibility !== 'profile') {
          batch.delete(publicDocument.ref)
          writes += 1
        }
      }
    }

    if (writes > 0) await batch.commit()
  } catch (error) {
    reconciledPublicPlans.delete(reconciliationKey)
    console.error('Public Plan Öğesi projeksiyonları onarılamadı.', error)
  }
}

function proposalReference(tripId, proposerId, targetItemId) {
  return doc(
    db,
    'trips',
    tripId,
    'planChangeProposals',
    `${targetItemId}_${proposerId}`,
  )
}

async function saveProposal({ tripId, proposerId, targetItemId, action, patch }) {
  const stableReference = proposalReference(tripId, proposerId, targetItemId)
  const existing = await getDoc(stableReference)
  const nextProposal = {
    proposerId,
    targetItemId,
    action,
    patch,
    status: 'pending',
    updatedAt: serverTimestamp(),
  }
  if (!existing.exists()) {
    nextProposal.createdAt = serverTimestamp()
  }
  await setDoc(stableReference, nextProposal, { merge: true })
  return { kind: 'proposal', id: stableReference.id, targetItemId }
}

function proposalTimestamp(proposal) {
  return proposal.updatedAt?.toMillis?.() || proposal.createdAt?.toMillis?.() || 0
}

function activeProposals(proposals) {
  const unique = new Map()
  proposals.filter((proposal) => proposal.status === 'pending').forEach((proposal) => {
    const key = `${proposal.targetItemId}:${proposal.proposerId}`
    const current = unique.get(key)
    if (!current || proposalTimestamp(proposal) >= proposalTimestamp(current)) unique.set(key, proposal)
  })
  return [...unique.values()]
}

export function subscribeToPlanItems(tripId, userId, callback, onError = console.error) {
  if (navigator.onLine === false) {
    callback(getOfflinePlans(userId, tripId))
    return () => {}
  }
  const visibleQuery = query(
    collection(db, 'trips', tripId, 'planItems'),
    where('visibility', 'in', ['trip', 'profile']),
  )
  const privateOwnerQuery = query(
    collection(db, 'trips', tripId, 'planItems'),
    where('scope', '==', PLAN_SCOPE.PERSONAL),
    where('ownerId', '==', userId),
    where('visibility', '==', 'private'),
  )
  const snapshots = { visible: [], private: [] }
  const publish = () => {
    const uniqueItems = new Map(
      [...snapshots.visible, ...snapshots.private].map((item) => [item.id, item]),
    )
    const sorted = [...uniqueItems.values()].sort((left, right) =>
        (left.time?.startsAt || left.time?.localDate || '').localeCompare(
          right.time?.startsAt || right.time?.localDate || '',
        ),
      )
    cachePlansForOffline(tripId, userId, sorted)
    callback(sorted)
  }
  const handleError = (error) => {
    if (navigator.onLine === false) {
      callback(getOfflinePlans(userId, tripId))
      return
    }
    onError(error)
  }
  const unsubscribeVisible = onSnapshot(visibleQuery, (snapshot) => {
    snapshots.visible = decode(snapshot)
    void reconcilePublicPlanProjections(tripId, userId, snapshots.visible)
    publish()
  }, handleError)
  const unsubscribePrivate = onSnapshot(privateOwnerQuery, (snapshot) => {
    snapshots.private = decode(snapshot)
    publish()
  }, handleError)
  return () => {
    unsubscribeVisible()
    unsubscribePrivate()
  }
}

export function subscribeToPlanProposals(tripId, callback, onError = console.error) {
  return onSnapshot(
    collection(db, 'trips', tripId, 'planChangeProposals'),
    (snapshot) => callback(activeProposals(decode(snapshot))),
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
  assertOnline()
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

  if (planItem.id) {
    const patch = changedPlanContentPatch(planItem._original, cleaned, userId)
    if (Object.keys(patch).length === 0) return { kind: 'unchanged', id: planItem.id }
    await updatePlanContent(trip.id, reference, patch, userId)
    return { kind: 'item', id: reference.id }
  }

  const savedItem = {
    ...cleaned,
    createdBy: planItem.createdBy || userId,
    createdAt: planItem.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const batch = writeBatch(db)
  batch.set(reference, savedItem, { merge: true })
  if (cleaned.visibility === 'profile') {
    syncPublicPlan(batch, trip.id, reference.id, cleaned)
  }
  await batch.commit()
  return { kind: 'item', id: reference.id }
}

async function updatePlanContent(tripId, reference, patch, userId) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists()) throw new Error('Plan Öğesi artık mevcut değil.')
    const next = cleanPlanItem({ ...snapshot.data(), ...patch }, userId)
    transaction.update(reference, { ...next, updatedAt: serverTimestamp() })
    const publicReference = doc(db, 'trips', tripId, 'publicPlanItems', reference.id)
    if (next.visibility === 'profile') {
      transaction.set(publicReference, publicPlanPayload(next), { merge: true })
    } else {
      transaction.delete(publicReference)
    }
  })
}

export async function changePlanItem(trip, planItem, userId, patch) {
  assertOnline()
  if (canDirectEditPlanItem(trip, planItem, userId)) {
    const reference = doc(db, 'trips', trip.id, 'planItems', planItem.id)
    const cleaned = cleanPlanItem({ ...planItem, ...patch }, userId)
    const contentPatch = changedPlanContentPatch(planItem, cleaned, userId)
    await updatePlanContent(trip.id, reference, contentPatch, userId)
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
  assertOnline()
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
  assertOnline()
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
  assertOnline()
  return updateDoc(doc(db, 'trips', tripId, 'planChangeProposals', proposalId), {
    status: 'rejected',
    decidedBy: ownerId,
    decidedAt: serverTimestamp(),
  })
}

export function withdrawPlanProposal(tripId, proposalId, proposerId) {
  assertOnline()
  return updateDoc(doc(db, 'trips', tripId, 'planChangeProposals', proposalId), {
    status: 'withdrawn',
    withdrawnBy: proposerId,
    decidedAt: serverTimestamp(),
  })
}
