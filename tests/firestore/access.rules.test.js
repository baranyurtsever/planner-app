import fs from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { expect } from 'vitest'

const projectId = 'demo-peregrin'
let testEnvironment

function sharedPlan(overrides = {}) {
  return {
    scope: 'shared',
    ownerId: null,
    title: 'Akşam yemeği',
    category: 'food',
    status: 'todo',
    visibility: 'trip',
    notes: '',
    location: { name: '', mapUrl: '', lat: null, lng: null },
    time: { kind: 'date', localDate: '2026-08-01' },
    participantMode: 'all',
    participantIds: [],
    excludedParticipantIds: [],
    blockedParticipantIds: [],
    createdBy: 'owner',
    ...overrides,
  }
}

function personalPlan(overrides = {}) {
  return {
    ...sharedPlan(),
    scope: 'personal',
    ownerId: 'editor',
    title: 'Kişisel etkinlik',
    visibility: 'trip',
    participantMode: 'selected',
    participantIds: ['editor'],
    createdBy: 'editor',
    ...overrides,
  }
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  })
})

beforeEach(async () => {
  await testEnvironment.clearFirestore()
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'profiles', 'owner'), {
      username: 'owner',
      displayName: 'Gezi Sahibi',
    })
    await setDoc(doc(db, 'profiles', 'guest'), {
      username: 'guest',
      displayName: 'Davetli Gezgin',
    })
    await setDoc(doc(db, 'trips', 'public-trip'), {
      ownerId: 'owner',
      memberIds: ['owner', 'editor', 'viewer'],
      memberRoles: { owner: 'owner', editor: 'editor', viewer: 'viewer' },
      name: 'Bangkok',
      locationName: 'Tayland',
      visibility: 'profile',
      status: 'active',
    })
    await setDoc(doc(db, 'publicTrips', 'public-trip'), {
      name: 'Bangkok',
      locationName: 'Tayland',
      visibility: 'profile',
      status: 'active',
    })
    await setDoc(doc(db, 'profiles', 'owner', 'publicTrips', 'public-trip'), {
      name: 'Bangkok',
      locationName: 'Tayland',
      visibility: 'profile',
      status: 'active',
    })
    await setDoc(doc(db, 'trips', 'private-trip'), {
      ownerId: 'owner',
      memberIds: ['owner'],
      memberRoles: { owner: 'owner' },
      name: 'Gizli Gezi',
      visibility: 'private',
      status: 'active',
    })
    await setDoc(doc(db, 'trips', 'archived-trip'), {
      ownerId: 'owner',
      memberIds: ['owner', 'viewer'],
      memberRoles: { owner: 'owner', viewer: 'viewer' },
      name: 'Eski Gezi',
      visibility: 'private',
      status: 'archived',
    })
    await setDoc(doc(db, 'expenses', 'profile-expense'), {
      ownerId: 'viewer',
      tripId: 'public-trip',
      visibility: 'profile',
      amount: 120,
    })
    await setDoc(doc(db, 'expenses', 'private-expense'), {
      ownerId: 'viewer',
      tripId: 'public-trip',
      visibility: 'private',
      amount: 80,
    })
    await setDoc(doc(db, 'friendRequests', 'owner-to-viewer'), {
      fromId: 'owner',
      toId: 'viewer',
      status: 'pending',
    })
    await setDoc(
      doc(db, 'trips', 'public-trip', 'planItems', 'shared-plan'),
      sharedPlan(),
    )
    await setDoc(
      doc(db, 'trips', 'public-trip', 'planItems', 'personal-plan'),
      personalPlan(),
    )
    await setDoc(
      doc(db, 'trips', 'public-trip', 'planItems', 'private-personal-plan'),
      personalPlan({ id: 'private-personal-plan', visibility: 'private' }),
    )
    await setDoc(
      doc(db, 'trips', 'public-trip', 'planItems', 'profile-plan'),
      sharedPlan({ visibility: 'profile' }),
    )
    await setDoc(
      doc(db, 'trips', 'public-trip', 'publicPlanItems', 'profile-plan'),
      {
        scope: 'shared',
        title: 'Akşam yemeği',
        category: 'food',
        status: 'todo',
        visibility: 'profile',
        notes: '',
        location: { name: '', mapUrl: '', lat: null, lng: null },
        time: { kind: 'date', localDate: '2026-08-01' },
      },
    )
  })
})

afterAll(async () => {
  await testEnvironment.cleanup()
})

describe('public reads', () => {
  it('keeps trip membership private while exposing sanitized public projections', async () => {
    const db = testEnvironment.unauthenticatedContext().firestore()
    await assertSucceeds(getDoc(doc(db, 'profiles', 'owner')))
    await assertFails(getDoc(doc(db, 'trips', 'public-trip')))
    await assertFails(getDoc(doc(db, 'trips', 'private-trip')))
    const publicTrip = await assertSucceeds(getDoc(doc(db, 'publicTrips', 'public-trip')))
    const profileTrip = await assertSucceeds(
      getDoc(doc(db, 'profiles', 'owner', 'publicTrips', 'public-trip')),
    )
    expect(publicTrip.data()).not.toHaveProperty('memberIds')
    expect(publicTrip.data()).not.toHaveProperty('memberRoles')
    expect(profileTrip.data()).not.toHaveProperty('memberIds')
    expect(profileTrip.data()).not.toHaveProperty('memberRoles')
    await assertSucceeds(getDoc(doc(db, 'expenses', 'profile-expense')))
    await assertFails(getDoc(doc(db, 'expenses', 'private-expense')))
    await assertFails(getDoc(doc(db, 'trips', 'public-trip', 'planItems', 'profile-plan')))
    await assertSucceeds(getDoc(doc(db, 'trips', 'public-trip', 'publicPlanItems', 'profile-plan')))
  })

  it('lets a profile visitor list the public plans and expenses rendered by the trip page', async () => {
    const db = testEnvironment.unauthenticatedContext().firestore()
    await assertSucceeds(getDocs(query(
      collection(db, 'trips', 'public-trip', 'publicPlanItems'),
      where('visibility', '==', 'profile'),
    )))
    await assertSucceeds(getDocs(query(
      collection(db, 'expenses'),
      where('tripId', '==', 'public-trip'),
      where('visibility', '==', 'profile'),
    )))
  })

})

describe('profile integrity', () => {
  it('does not let a profile owner change a reserved username', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    await assertFails(updateDoc(doc(db, 'profiles', 'owner'), { username: 'someone_else' }))
  })

  it('rejects username reservations that are not normalized', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    await assertFails(setDoc(doc(db, 'usernames', 'Ada'), { uid: 'owner' }))
    await assertSucceeds(setDoc(doc(db, 'usernames', 'ada'), { uid: 'owner' }))
  })
})

describe('trip roles', () => {
  it('keeps an invitation private and grants membership only when the invitee accepts it', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const guestDb = testEnvironment.authenticatedContext('guest').firestore()
    const outsiderDb = testEnvironment.authenticatedContext('outsider').firestore()
    const invitationRef = doc(ownerDb, 'tripInvitations', 'public-trip_guest')
    await assertSucceeds(setDoc(invitationRef, {
      tripId: 'public-trip',
      tripName: 'Bangkok',
      inviterId: 'owner',
      inviteeId: 'guest',
      role: 'viewer',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }))

    await assertFails(getDoc(doc(guestDb, 'trips', 'public-trip')))
    await assertSucceeds(getDoc(doc(guestDb, 'tripInvitations', 'public-trip_guest')))
    await assertFails(getDoc(doc(outsiderDb, 'tripInvitations', 'public-trip_guest')))

    const batch = writeBatch(guestDb)
    batch.update(doc(guestDb, 'tripInvitations', 'public-trip_guest'), {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    })
    batch.update(doc(guestDb, 'trips', 'public-trip'), {
      memberIds: arrayUnion('guest'),
      'memberRoles.guest': 'viewer',
      updatedAt: serverTimestamp(),
    })
    await assertSucceeds(batch.commit())
    expect((await getDoc(doc(guestDb, 'trips', 'public-trip'))).data().memberRoles.guest).toBe('viewer')
  })

  it('does not let an invitee choose a stronger role than the invitation', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'tripInvitations', 'public-trip_guest'), {
        tripId: 'public-trip', tripName: 'Bangkok', inviterId: 'owner', inviteeId: 'guest',
        role: 'viewer', status: 'pending', createdAt: new Date(), updatedAt: new Date(),
      })
    })
    const guestDb = testEnvironment.authenticatedContext('guest').firestore()
    const batch = writeBatch(guestDb)
    batch.update(doc(guestDb, 'tripInvitations', 'public-trip_guest'), {
      status: 'accepted', updatedAt: serverTimestamp(),
    })
    batch.update(doc(guestDb, 'trips', 'public-trip'), {
      memberIds: arrayUnion('guest'), 'memberRoles.guest': 'editor', updatedAt: serverTimestamp(),
    })
    await assertFails(batch.commit())
  })

  it('lets the owner atomically update sanitized public trip projections', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    const batch = writeBatch(db)
    const projection = {
      name: 'Bangkok 2027',
      locationName: 'Tayland',
      visibility: 'profile',
      status: 'active',
    }
    batch.update(doc(db, 'trips', 'public-trip'), { name: projection.name })
    batch.set(doc(db, 'publicTrips', 'public-trip'), projection)
    batch.set(doc(db, 'profiles', 'owner', 'publicTrips', 'public-trip'), projection)
    await assertSucceeds(batch.commit())
  })

  it('allows a participant to query their trips', async () => {
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    const tripsQuery = query(
      collection(db, 'trips'),
      where('memberIds', 'array-contains', 'viewer'),
    )

    await assertSucceeds(getDocs(tripsQuery))
  })

  it('allows editors to update shared fields but not membership', async () => {
    const db = testEnvironment.authenticatedContext('editor').firestore()
    const ref = doc(db, 'trips', 'public-trip')

    await assertSucceeds(updateDoc(ref, { name: 'Bangkok ve Chiang Mai' }))
    await assertFails(updateDoc(ref, { memberIds: ['owner', 'editor'] }))
  })

  it('allows only owners to archive a trip', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()

    await assertFails(updateDoc(doc(editorDb, 'trips', 'public-trip'), { status: 'archived' }))
    await assertSucceeds(updateDoc(doc(ownerDb, 'trips', 'public-trip'), { status: 'archived' }))
    await assertFails(updateDoc(doc(ownerDb, 'trips', 'public-trip'), { status: 'active' }))
  })
})

describe('user-owned expenses', () => {
  it('allows only the expense owner to update or delete it', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const expenseOwnerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const refForOwner = doc(ownerDb, 'expenses', 'profile-expense')
    const refForExpenseOwner = doc(expenseOwnerDb, 'expenses', 'profile-expense')

    await assertFails(updateDoc(refForOwner, { amount: 1 }))
    await assertSucceeds(updateDoc(refForExpenseOwner, { amount: 150 }))
    await assertSucceeds(deleteDoc(refForExpenseOwner))
  })

  it('rejects unknown visibility values and archived-trip mutations', async () => {
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    await assertFails(
      setDoc(doc(db, 'expenses', 'invalid-visibility'), {
        ownerId: 'viewer',
        tripId: 'public-trip',
        visibility: 'world',
        amount: 10,
      }),
    )
    await assertFails(
      setDoc(doc(db, 'expenses', 'invalid-kind'), {
        ownerId: 'viewer',
        tripId: 'public-trip',
        visibility: 'private',
        kind: 'refund',
        amount: 10,
      }),
    )
    await assertFails(
      setDoc(doc(db, 'expenses', 'archived-expense'), {
        ownerId: 'viewer',
        tripId: 'archived-trip',
        visibility: 'private',
        amount: 10,
      }),
    )
  })

  it('allows settlement only for trip-visible spending and active trip members', async () => {
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    const valid = {
      ownerId: 'viewer', tripId: 'public-trip', title: 'Taksi', amount: 100,
      currency: 'TRY', kind: 'spent', visibility: 'trip', settlementCurrency: 'EUR',
      exchangeRate: 0.02, splitParticipantIds: ['viewer', 'editor'],
    }
    await assertSucceeds(setDoc(doc(db, 'expenses', 'settled'), valid))
    await assertFails(setDoc(doc(db, 'expenses', 'outsider-split'), {
      ...valid, splitParticipantIds: ['viewer', 'outsider'],
    }))
    await assertFails(setDoc(doc(db, 'expenses', 'public-split'), {
      ...valid, visibility: 'profile',
    }))
    await assertFails(setDoc(doc(db, 'expenses', 'invalid-rate'), {
      ...valid, exchangeRate: 0,
    }))
  })
})

describe('plan item integrity', () => {
  it('requires supported visibility and a valid time representation', async () => {
    const db = testEnvironment.authenticatedContext('editor').firestore()
    const planItem = doc(db, 'trips', 'public-trip', 'planItems', 'invalid')

    await assertFails(setDoc(planItem, {
      title: 'Uçuş',
      visibility: 'world',
      time: { kind: 'date', localDate: '2026-08-01' },
    }))
    await assertFails(setDoc(planItem, {
      title: 'Uçuş',
      visibility: 'trip',
      time: { kind: 'timed', startsAt: '2026-08-01T08:00:00.000Z' },
    }))
    await assertFails(setDoc(planItem, {
      title: 'Uçuş',
      visibility: 'trip',
      time: {
        kind: 'timed',
        startsAt: 'tomorrow',
        endsAt: 'later',
        startTimeZone: 'local',
        endTimeZone: 'local',
      },
    }))
    await assertFails(setDoc(planItem, sharedPlan({
      time: { kind: 'date', localDate: '2026-02-31' },
    })))
    await assertFails(setDoc(planItem, sharedPlan({
      time: {
        kind: 'timed',
        startsAt: '2026-08-01T08:00:00.000Z',
        endsAt: '2026-08-01T08:00:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Europe/Istanbul',
      },
    })))
    await assertFails(setDoc(planItem, sharedPlan({
      time: {
        kind: 'timed',
        startsAt: '2026-08-01T08:05:00.000Z',
        endsAt: '2026-08-01T08:20:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Europe/Istanbul',
      },
    })))
    await assertFails(setDoc(planItem, personalPlan({
      travelFromPrevious: { mode: 'teleport', durationMinutes: 10 },
    })))
    await assertFails(setDoc(planItem, personalPlan({
      travelFromPrevious: { mode: 'walk', durationMinutes: 0 },
    })))
    await assertSucceeds(setDoc(planItem, personalPlan({
      travelFromPrevious: { mode: 'walk', durationMinutes: 25 },
    })))
  })

  it('allows only the trip owner to directly mutate shared plans', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()

    await assertSucceeds(updateDoc(
      doc(ownerDb, 'trips', 'public-trip', 'planItems', 'shared-plan'),
      { title: 'Yeni başlık' },
    ))
    await assertFails(updateDoc(
      doc(editorDb, 'trips', 'public-trip', 'planItems', 'shared-plan'),
      { title: 'Editör doğrudan yazamaz' },
    ))
    await assertFails(deleteDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planItems', 'shared-plan'),
    ))
  })

  it('allows every participant to own personal plans without giving the trip owner edit access', async () => {
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const newPlan = doc(viewerDb, 'trips', 'public-trip', 'planItems', 'viewer-plan')

    await assertSucceeds(setDoc(newPlan, personalPlan({
      ownerId: 'viewer',
      participantIds: ['viewer'],
      createdBy: 'viewer',
    })))
    await assertSucceeds(updateDoc(newPlan, { title: 'Kendi kartım' }))
    await assertFails(updateDoc(
      doc(ownerDb, 'trips', 'public-trip', 'planItems', 'personal-plan'),
      { title: 'Sahip başkasının kartını değiştiremez' },
    ))
  })

  it('allows a participant to create a non-public personal plan in a legacy sync batch', async () => {
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    const sourceRef = doc(db, 'trips', 'public-trip', 'planItems', 'viewer-private-plan')
    const publicRef = doc(db, 'trips', 'public-trip', 'publicPlanItems', 'viewer-private-plan')
    const batch = writeBatch(db)
    batch.set(sourceRef, personalPlan({
      ownerId: 'viewer',
      participantIds: ['viewer'],
      visibility: 'private',
      createdBy: 'viewer',
    }))
    batch.delete(publicRef)
    await assertSucceeds(batch.commit())
  })

  it('keeps private personal plans visible only to their owner', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    await assertSucceeds(getDoc(
      doc(editorDb, 'trips', 'public-trip', 'planItems', 'private-personal-plan'),
    ))
    await assertFails(getDoc(
      doc(ownerDb, 'trips', 'public-trip', 'planItems', 'private-personal-plan'),
    ))
  })

  it('publishes a sanitized profile projection atomically with its source plan', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const sourceRef = doc(ownerDb, 'trips', 'public-trip', 'planItems', 'new-profile-plan')
    const publicRef = doc(ownerDb, 'trips', 'public-trip', 'publicPlanItems', 'new-profile-plan')
    const source = sharedPlan({ visibility: 'profile', title: 'Profil planı' })
    const projection = {
      scope: source.scope,
      title: source.title,
      category: source.category,
      status: source.status,
      visibility: source.visibility,
      notes: source.notes,
      location: source.location,
      time: source.time,
    }
    const batch = writeBatch(ownerDb)
    batch.set(sourceRef, source)
    batch.set(publicRef, projection)
    await assertSucceeds(batch.commit())

    await assertFails(setDoc(
      doc(ownerDb, 'trips', 'public-trip', 'planItems', 'missing-projection'),
      { ...source, title: 'Eksik kopya' },
    ))

    await assertFails(updateDoc(publicRef, { title: 'Kaynakla uyuşmayan başlık' }))
  })

  it('requires the public projection to be deleted when a source plan becomes private', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    const sourceRef = doc(db, 'trips', 'public-trip', 'planItems', 'profile-plan')
    const publicRef = doc(db, 'trips', 'public-trip', 'publicPlanItems', 'profile-plan')

    await assertFails(updateDoc(sourceRef, { visibility: 'trip' }))

    const batch = writeBatch(db)
    batch.update(sourceRef, { visibility: 'trip' })
    batch.delete(publicRef)
    await assertSucceeds(batch.commit())
  })

  it('requires the public projection to be deleted with its source plan', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    const sourceRef = doc(db, 'trips', 'public-trip', 'planItems', 'profile-plan')
    const publicRef = doc(db, 'trips', 'public-trip', 'publicPlanItems', 'profile-plan')

    await assertFails(deleteDoc(sourceRef))

    const batch = writeBatch(db)
    batch.delete(sourceRef)
    batch.delete(publicRef)
    await assertSucceeds(batch.commit())
  })
})

describe('plan change proposals', () => {
  it('lets each participant change only their own vote and keeps decision records immutable', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const outsiderDb = testEnvironment.authenticatedContext('outsider').firestore()
    const proposalRef = doc(editorDb, 'trips', 'public-trip', 'planChangeProposals', 'voted')
    await assertSucceeds(setDoc(proposalRef, {
      proposerId: 'editor', targetItemId: 'shared-plan', action: 'update',
      patch: { title: 'Oylanan başlık' }, status: 'pending', votes: {},
    }))
    await assertSucceeds(updateDoc(doc(viewerDb, proposalRef.path), { 'votes.viewer': 'support' }))
    await assertFails(updateDoc(doc(editorDb, proposalRef.path), { 'votes.viewer': 'oppose' }))
    await assertFails(updateDoc(doc(viewerDb, proposalRef.path), { 'votes.viewer': 'invalid' }))

    const decisionRef = doc(ownerDb, 'trips', 'public-trip', 'planProposalDecisions', 'decision')
    await assertSucceeds(setDoc(decisionRef, {
      proposalId: 'voted', targetItemId: 'shared-plan', proposerId: 'editor', action: 'update',
      patch: { title: 'Oylanan başlık' }, votes: { viewer: 'support' }, outcome: 'rejected',
      decidedBy: 'owner', decidedAt: serverTimestamp(),
    }))
    await assertSucceeds(getDoc(doc(viewerDb, decisionRef.path)))
    await assertFails(getDoc(doc(outsiderDb, decisionRef.path)))
    await assertFails(updateDoc(decisionRef, { outcome: 'approved' }))
    await assertFails(deleteDoc(decisionRef))
  })

  it('allows editors to propose shared changes and only owners to decide', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const proposalData = {
      proposerId: 'editor',
      targetItemId: 'shared-plan',
      action: 'update',
      patch: { title: 'Önerilen başlık' },
      status: 'pending',
    }

    await assertSucceeds(setDoc(
      doc(editorDb, 'trips', 'public-trip', 'planChangeProposals', 'proposal'),
      proposalData,
    ))
    await assertFails(setDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planChangeProposals', 'forged'),
      { ...proposalData, proposerId: 'viewer' },
    ))
    await assertSucceeds(getDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planChangeProposals', 'proposal'),
    ))
    await assertFails(updateDoc(
      doc(editorDb, 'trips', 'public-trip', 'planChangeProposals', 'proposal'),
      { status: 'approved', decidedBy: 'editor' },
    ))
    await assertFails(updateDoc(
      doc(ownerDb, 'trips', 'public-trip', 'planChangeProposals', 'proposal'),
      { status: 'approved', decidedBy: 'owner' },
    ))

    const approvalBatch = writeBatch(ownerDb)
    approvalBatch.update(
      doc(ownerDb, 'trips', 'public-trip', 'planItems', 'shared-plan'),
      { title: 'Önerilen başlık' },
    )
    approvalBatch.update(
      doc(ownerDb, 'trips', 'public-trip', 'planChangeProposals', 'proposal'),
      { status: 'approved', decidedBy: 'owner' },
    )
    await assertSucceeds(approvalBatch.commit())
  })

  it('rejects forbidden or malformed shared update patches', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const proposals = collection(editorDb, 'trips', 'public-trip', 'planChangeProposals')
    const base = {
      proposerId: 'editor',
      targetItemId: 'shared-plan',
      action: 'update',
      status: 'pending',
    }

    await assertFails(setDoc(doc(proposals, 'scope'), { ...base, patch: { scope: 'personal' } }))
    await assertFails(setDoc(doc(proposals, 'members'), { ...base, patch: { participantIds: ['editor'] } }))
    await assertFails(setDoc(doc(proposals, 'time'), {
      ...base,
      patch: { time: { kind: 'timed', startsAt: 'invalid' } },
    }))
  })

  it('revalidates a create proposal whenever its patch is edited', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const proposalRef = doc(editorDb, 'trips', 'public-trip', 'planChangeProposals', 'new-plan_editor')

    await assertSucceeds(setDoc(proposalRef, {
      proposerId: 'editor',
      targetItemId: 'new-plan',
      action: 'create',
      patch: sharedPlan({ createdBy: 'editor' }),
      status: 'pending',
    }))
    await assertFails(updateDoc(proposalRef, {
      patch: sharedPlan({ createdBy: 'editor', time: { kind: 'date', localDate: 'tomorrow' } }),
    }))
  })

  it('lets an editor reuse their target proposal slot after a decision', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const proposalRef = doc(editorDb, 'trips', 'public-trip', 'planChangeProposals', 'shared-plan_editor')

    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'trips', 'public-trip', 'planChangeProposals', 'shared-plan_editor'), {
        proposerId: 'editor',
        targetItemId: 'shared-plan',
        action: 'update',
        patch: { title: 'İlk öneri' },
        status: 'rejected',
        decidedBy: 'owner',
      })
    })

    await assertSucceeds(setDoc(proposalRef, {
      proposerId: 'editor',
      targetItemId: 'shared-plan',
      action: 'delete',
      patch: {},
      status: 'pending',
    }, { merge: true }))
  })
})

describe('plan participation', () => {
  it('accepts requests only from trip participants for visible personal plans', async () => {
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const outsiderDb = testEnvironment.authenticatedContext('outsider').firestore()
    const request = {
      planItemId: 'personal-plan',
      requesterId: 'viewer',
      itemOwnerId: 'editor',
      status: 'pending',
    }
    await assertSucceeds(setDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planParticipationRequests', 'request'),
      request,
    ))
    await assertFails(setDoc(
      doc(outsiderDb, 'trips', 'public-trip', 'planParticipationRequests', 'outsider'),
      { ...request, requesterId: 'outsider' },
    ))
    await assertFails(setDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planParticipationRequests', 'private'),
      { ...request, planItemId: 'private-personal-plan' },
    ))
  })

  it('lets only the requester reopen a rejected participation request', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'trips', 'public-trip', 'planParticipationRequests', 'personal-plan_viewer'), {
        planItemId: 'personal-plan',
        requesterId: 'viewer',
        itemOwnerId: 'editor',
        status: 'rejected',
        decidedBy: 'editor',
      })
    })
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const requestPath = ['trips', 'public-trip', 'planParticipationRequests', 'personal-plan_viewer']

    await assertFails(updateDoc(doc(editorDb, ...requestPath), { status: 'pending' }))
    await assertSucceeds(updateDoc(doc(viewerDb, ...requestPath), { status: 'pending' }))
  })

  it('lets a participant leave while preventing unrelated participant-array edits', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await updateDoc(
        doc(context.firestore(), 'trips', 'public-trip', 'planItems', 'personal-plan'),
        { participantIds: ['editor', 'viewer'] },
      )
    })
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const ref = doc(viewerDb, 'trips', 'public-trip', 'planItems', 'personal-plan')
    await assertFails(updateDoc(ref, {
      participantIds: ['editor'],
      blockedParticipantIds: ['viewer'],
    }))
    const leaveBatch = writeBatch(viewerDb)
    leaveBatch.set(
      doc(viewerDb, 'trips', 'public-trip', 'planDepartures', 'personal-plan_viewer'),
      { planItemId: 'personal-plan', userId: 'viewer' },
    )
    leaveBatch.update(ref, {
      participantIds: ['editor'],
      blockedParticipantIds: ['viewer'],
    })
    await assertSucceeds(leaveBatch.commit())
    await assertFails(updateDoc(ref, {
      participantIds: [],
      blockedParticipantIds: ['viewer'],
    }))
  })

  it('lets a participant leave a legacy shared plan without details or expenses', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'trips', 'public-trip', 'planItems', 'legacy-shared'),
        {
          scope: 'shared',
          title: 'Eski ortak plan',
          category: 'activity',
          visibility: 'trip',
          time: { kind: 'date', localDate: '2026-08-02' },
        },
      )
    })
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    const batch = writeBatch(db)
    batch.set(doc(db, 'trips', 'public-trip', 'planDepartures', 'legacy-shared_viewer'), {
      planItemId: 'legacy-shared',
      userId: 'viewer',
    })
    batch.update(doc(db, 'trips', 'public-trip', 'planItems', 'legacy-shared'), {
      excludedParticipantIds: arrayUnion('viewer'),
    })
    await assertSucceeds(batch.commit())
  })

  it('does not let the creator leave their shared plan item', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    const batch = writeBatch(db)
    batch.set(doc(db, 'trips', 'public-trip', 'planDepartures', 'shared-plan_owner'), {
      planItemId: 'shared-plan',
      userId: 'owner',
    })
    batch.update(doc(db, 'trips', 'public-trip', 'planItems', 'shared-plan'), {
      excludedParticipantIds: arrayUnion('owner'),
    })
    await assertFails(batch.commit())
  })

  it('makes linked personal data inaccessible and rejects new writes after leaving', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await updateDoc(doc(db, 'trips', 'public-trip', 'planItems', 'personal-plan'), {
        participantIds: ['editor', 'viewer'],
      })
      await setDoc(doc(db, 'trips', 'public-trip', 'planParticipantDetails', 'personal-plan_viewer'), {
        planItemId: 'personal-plan', userId: 'viewer', note: 'Gizli not',
      })
      await setDoc(doc(db, 'expenses', 'linked-expense'), {
        tripId: 'public-trip', planItemId: 'personal-plan', ownerId: 'viewer',
        title: 'Taksi', amount: 100, visibility: 'private',
      })
    })
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    const batch = writeBatch(db)
    batch.set(doc(db, 'trips', 'public-trip', 'planDepartures', 'personal-plan_viewer'), {
      planItemId: 'personal-plan', userId: 'viewer',
    })
    batch.update(doc(db, 'trips', 'public-trip', 'planItems', 'personal-plan'), {
      participantIds: ['editor'], blockedParticipantIds: ['viewer'],
    })
    await assertSucceeds(batch.commit())

    await assertFails(getDoc(doc(db, 'expenses', 'linked-expense')))
    await assertFails(getDoc(
      doc(db, 'trips', 'public-trip', 'planParticipantDetails', 'personal-plan_viewer'),
    ))
    await assertFails(setDoc(doc(db, 'expenses', 'late-expense'), {
      tripId: 'public-trip', planItemId: 'personal-plan', ownerId: 'viewer',
      title: 'Geç yazım', amount: 50, visibility: 'private',
    }))
  })

  it('allows a personal card owner to add only active trip participants', async () => {
    const db = testEnvironment.authenticatedContext('editor').firestore()
    const ref = doc(db, 'trips', 'public-trip', 'planItems', 'personal-plan')
    await assertSucceeds(updateDoc(ref, { participantIds: ['editor', 'viewer'] }))
    await assertFails(updateDoc(ref, { participantIds: ['editor', 'outsider'] }))
  })

  it('keeps private personal cards exclusive to their owner', async () => {
    const db = testEnvironment.authenticatedContext('editor').firestore()
    await assertFails(updateDoc(
      doc(db, 'trips', 'public-trip', 'planItems', 'private-personal-plan'),
      { participantIds: ['editor', 'viewer'] },
    ))
  })

  it('allows only the trip owner to restore a departed participant', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await updateDoc(doc(db, 'trips', 'public-trip', 'planItems', 'personal-plan'), {
        participantIds: ['editor'], blockedParticipantIds: ['viewer'],
      })
      await setDoc(doc(db, 'trips', 'public-trip', 'planDepartures', 'personal-plan_viewer'), {
        planItemId: 'personal-plan', userId: 'viewer',
      })
    })
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    await assertFails(updateDoc(
      doc(editorDb, 'trips', 'public-trip', 'planItems', 'personal-plan'),
      { participantIds: ['editor', 'viewer'], blockedParticipantIds: [] },
    ))

    const batch = writeBatch(ownerDb)
    batch.update(doc(ownerDb, 'trips', 'public-trip', 'planItems', 'personal-plan'), {
      participantIds: ['editor', 'viewer'], blockedParticipantIds: [],
    })
    batch.delete(doc(ownerDb, 'trips', 'public-trip', 'planDepartures', 'personal-plan_viewer'))
    await assertSucceeds(batch.commit())
  })
})

describe('plan document privacy', () => {
  const privateDocument = {
    planItemId: 'shared-plan',
    ownerId: 'owner',
    title: 'Otel rezervasyonu',
    kind: 'reservation',
    url: 'https://example.test/booking',
    reservationCode: 'ABC-123',
    visibility: 'private',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  it('keeps a document private until its owner shares it with trip participants', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const publicDb = testEnvironment.unauthenticatedContext().firestore()
    const ownerRef = doc(ownerDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'booking')

    await assertSucceeds(setDoc(ownerRef, privateDocument))
    await assertSucceeds(getDocs(query(
      collection(ownerDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents'),
      where('ownerId', '==', 'owner'),
    )))
    await assertFails(getDoc(doc(editorDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'booking')))
    await assertFails(getDoc(doc(publicDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'booking')))

    await assertSucceeds(updateDoc(ownerRef, { visibility: 'trip' }))
    await assertSucceeds(getDoc(doc(editorDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'booking')))
    await assertSucceeds(getDocs(query(
      collection(editorDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents'),
      where('visibility', '==', 'trip'),
    )))
    await assertFails(getDoc(doc(publicDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'booking')))
  })

  it('preserves document ownership independently from the trip role', async () => {
    const viewerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const viewerRef = doc(viewerDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'viewer-ticket')
    const documentData = {
      ...privateDocument,
      ownerId: 'viewer',
      title: 'Müze bileti',
      kind: 'ticket',
      visibility: 'trip',
    }

    await assertSucceeds(setDoc(viewerRef, documentData))
    await assertFails(updateDoc(
      doc(editorDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'viewer-ticket'),
      { reservationCode: 'CHANGED' },
    ))
    await assertFails(setDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planItems', 'shared-plan', 'documents', 'forged'),
      { ...documentData, ownerId: 'owner' },
    ))
    await assertFails(setDoc(
      doc(viewerDb, 'trips', 'public-trip', 'planItems', 'private-personal-plan', 'documents', 'hidden'),
      { ...documentData, planItemId: 'private-personal-plan' },
    ))
  })
})

describe('friendship integrity', () => {
  it('only creates a friendship for the two users in the pending request', async () => {
    const db = testEnvironment.authenticatedContext('viewer').firestore()

    await assertFails(setDoc(doc(db, 'friendships', 'forged'), {
      acceptedBy: 'viewer',
      memberIds: ['viewer', 'attacker'],
      requestId: 'owner-to-viewer',
    }))
    await assertSucceeds(setDoc(doc(db, 'friendships', 'valid'), {
      acceptedBy: 'viewer',
      memberIds: ['owner', 'viewer'],
      requestId: 'owner-to-viewer',
    }))
  })
})
