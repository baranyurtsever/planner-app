import fs from 'node:fs'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

let environment

const sharedPlan = {
  scope: 'shared', ownerId: null, title: 'Akşam yemeği', category: 'food', status: 'todo',
  visibility: 'trip', notes: '', location: { name: '', mapUrl: '', lat: null, lng: null },
  time: { kind: 'date', localDate: '2026-09-12' }, participantMode: 'all', participantIds: [],
  excludedParticipantIds: [], blockedParticipantIds: [], createdBy: 'owner',
}

const personalPlan = {
  ...sharedPlan, scope: 'personal', ownerId: 'editor', title: 'Kişisel tur',
  participantMode: 'selected', participantIds: ['editor'], createdBy: 'editor',
}

async function loadRepository(path, database) {
  vi.resetModules()
  vi.doMock('../../src/infrastructure/firebase/firestoreClient', () => ({ db: database }))
  return import(path)
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-peregrin-repository-workflow',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  })
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'trips', 'trip'), {
      ownerId: 'owner', memberIds: ['owner', 'editor', 'viewer'],
      memberRoles: { owner: 'owner', editor: 'editor', viewer: 'viewer' },
      name: 'Bangkok', locationName: 'Tayland', visibility: 'private', status: 'active',
    })
    await setDoc(doc(db, 'trips', 'trip', 'planItems', 'shared'), sharedPlan)
    await setDoc(doc(db, 'trips', 'trip', 'planItems', 'personal'), personalPlan)
    await setDoc(doc(db, 'profiles', 'guest'), { username: 'guest', displayName: 'Davetli' })
  })
})

afterAll(async () => environment.cleanup())

describe('authenticated repository workflow', () => {
  it('duplicates a trip with shifted shared plans and no participants or personal plans', async () => {
    const ownerDb = environment.authenticatedContext('owner').firestore()
    const trips = await loadRepository('../../src/features/trips/data/tripRepository.js', ownerDb)
    const tripId = await trips.duplicateTrip({
      id: 'trip', ownerId: 'owner', memberIds: ['owner', 'editor', 'viewer'],
      memberRoles: { owner: 'owner', editor: 'editor', viewer: 'viewer' },
      name: 'Bangkok', locationName: 'Tayland', status: 'active', defaultTimeZone: 'Asia/Bangkok',
    }, { name: 'Bangkok yeniden', startDate: '2026-10-01' }, 'owner')

    const copiedTrip = (await getDoc(doc(ownerDb, 'trips', tripId))).data()
    const copiedPlans = await getDocs(query(
      collection(ownerDb, 'trips', tripId, 'planItems'),
      where('visibility', 'in', ['trip', 'profile']),
    ))
    expect(copiedTrip).toMatchObject({ name: 'Bangkok yeniden', memberIds: ['owner'], visibility: 'private' })
    expect(copiedPlans.size).toBe(1)
    expect(copiedPlans.docs[0].data()).toMatchObject({
      scope: 'shared', notes: '', time: { kind: 'date', localDate: '2026-10-01' },
      excludedParticipantIds: [], blockedParticipantIds: [],
    })
  })

  it('creates and atomically accepts a trip invitation', async () => {
    const trip = {
      id: 'trip', name: 'Bangkok', ownerId: 'owner', memberIds: ['owner', 'editor', 'viewer'],
      memberRoles: { owner: 'owner', editor: 'editor', viewer: 'viewer' }, status: 'active',
    }
    const ownerDb = environment.authenticatedContext('owner').firestore()
    const guestDb = environment.authenticatedContext('guest').firestore()
    const ownerInvitations = await loadRepository('../../src/features/trips/data/tripInvitationRepository.js', ownerDb)
    const invitationId = await ownerInvitations.sendTripInvitation(trip, 'owner', 'guest', 'viewer')
    expect(invitationId).toBe('trip_guest')

    const invitation = (await getDoc(doc(guestDb, 'tripInvitations', invitationId))).data()
    const guestInvitations = await loadRepository('../../src/features/trips/data/tripInvitationRepository.js', guestDb)
    await guestInvitations.acceptTripInvitation({ id: invitationId, ...invitation }, 'guest')

    const acceptedTrip = (await getDoc(doc(guestDb, 'trips', 'trip'))).data()
    expect(acceptedTrip.memberIds).toContain('guest')
    expect(acceptedTrip.memberRoles.guest).toBe('viewer')
  })

  it('runs owner/editor/viewer proposal and participation boundaries through the emulator', async () => {
    const trip = {
      id: 'trip', ownerId: 'owner', memberIds: ['owner', 'editor', 'viewer'],
      memberRoles: { owner: 'owner', editor: 'editor', viewer: 'viewer' }, status: 'active',
    }
    const ownerDb = environment.authenticatedContext('owner').firestore()
    const editorDb = environment.authenticatedContext('editor').firestore()
    const viewerDb = environment.authenticatedContext('viewer').firestore()

    const editorPlans = await loadRepository('../../src/features/itinerary/data/planRepository.js', editorDb)
    const proposal = await editorPlans.changePlanItem(trip, { id: 'shared', ...sharedPlan }, 'editor', { title: 'Önerilen yemek' })
    expect(proposal).toMatchObject({ kind: 'proposal', id: 'shared_editor' })

    const viewerPlans = await loadRepository('../../src/features/itinerary/data/planRepository.js', viewerDb)
    await expect(viewerPlans.changePlanItem(trip, { id: 'shared', ...sharedPlan }, 'viewer', { title: 'İzinsiz' })).rejects.toThrow()
    await viewerPlans.voteOnPlanProposal('trip', proposal.id, 'viewer', 'support')

    const ownerPlans = await loadRepository('../../src/features/itinerary/data/planRepository.js', ownerDb)
    await ownerPlans.approvePlanProposal('trip', proposal.id, 'owner')
    expect((await getDoc(doc(ownerDb, 'trips', 'trip', 'planItems', 'shared'))).data().title).toBe('Önerilen yemek')
    const decisions = await getDocs(collection(ownerDb, 'trips', 'trip', 'planProposalDecisions'))
    expect(decisions.docs[0].data()).toMatchObject({ outcome: 'approved', votes: { viewer: 'support' } })

    const viewerParticipation = await loadRepository('../../src/features/itinerary/data/planParticipationRepository.js', viewerDb)
    await viewerParticipation.requestPlanParticipation('trip', { id: 'personal', ...personalPlan }, 'viewer')
    const editorParticipation = await loadRepository('../../src/features/itinerary/data/planParticipationRepository.js', editorDb)
    await editorParticipation.decideParticipationRequest('trip', { id: 'personal', ...personalPlan }, {
      id: 'personal_viewer', requesterId: 'viewer',
    }, 'approved', 'editor')
    const joined = (await getDoc(doc(viewerDb, 'trips', 'trip', 'planItems', 'personal'))).data()
    expect(joined.participantIds).toContain('viewer')

    await viewerParticipation.leavePlanItem('trip', { id: 'personal', ...joined }, 'viewer')
    const left = (await getDoc(doc(viewerDb, 'trips', 'trip', 'planItems', 'personal'))).data()
    expect(left.participantIds).not.toContain('viewer')
    expect(left.blockedParticipantIds).toContain('viewer')
  })
})
