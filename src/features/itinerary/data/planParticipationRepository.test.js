import { beforeEach, describe, expect, it, vi } from 'vitest'
import { leavePlanItem, requestPlanParticipation } from './planParticipationRepository'

const mocks = vi.hoisted(() => ({
  batchDelete: vi.fn(),
  batchSet: vi.fn(),
  batchUpdate: vi.fn(),
  commit: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}))

vi.mock('../../../infrastructure/firebase/firestoreClient', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  arrayRemove: vi.fn(),
  arrayUnion: (value) => ({ operation: 'arrayUnion', value }),
  collection: (...segments) => ({ segments }),
  doc: (...segments) => ({ segments }),
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  onSnapshot: vi.fn(),
  query: (...parts) => ({ parts }),
  serverTimestamp: () => 'timestamp',
  setDoc: mocks.setDoc,
  updateDoc: mocks.updateDoc,
  where: (...parts) => ({ parts }),
  writeBatch: () => ({
    delete: mocks.batchDelete,
    set: mocks.batchSet,
    update: mocks.batchUpdate,
    commit: mocks.commit,
  }),
}))

describe('leavePlanItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getDocs.mockResolvedValue({ forEach: vi.fn() })
    mocks.getDoc.mockResolvedValue({ exists: () => false })
    mocks.commit.mockResolvedValue()
  })

  it('does not enqueue a forbidden delete when personal details do not exist', async () => {
    await leavePlanItem('trip', {
      id: 'plan',
      scope: 'shared',
      excludedParticipantIds: [],
    }, 'viewer')

    expect(mocks.batchDelete).not.toHaveBeenCalled()
    expect(mocks.batchUpdate).toHaveBeenCalledOnce()
    expect(mocks.commit).toHaveBeenCalledOnce()
  })

  it('rejects a departure when the user created the plan item', async () => {
    await expect(leavePlanItem('trip', {
      id: 'plan',
      scope: 'shared',
      createdBy: 'viewer',
      excludedParticipantIds: [],
    }, 'viewer')).rejects.toThrow('Plan Öğesini oluşturan kişi plandan ayrılamaz.')

    expect(mocks.getDocs).not.toHaveBeenCalled()
    expect(mocks.commit).not.toHaveBeenCalled()
  })
})

describe('requestPlanParticipation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.setDoc.mockResolvedValue()
    mocks.updateDoc.mockResolvedValue()
  })

  const item = {
    id: 'plan',
    scope: 'personal',
    ownerId: 'owner',
    visibility: 'trip',
    participantIds: ['owner'],
    blockedParticipantIds: [],
  }

  it('does not write again when the deterministic request is already pending', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ status: 'pending' }) })

    await expect(requestPlanParticipation('trip', item, 'viewer')).resolves.toEqual({ kind: 'pending' })
    expect(mocks.setDoc).not.toHaveBeenCalled()
    expect(mocks.updateDoc).not.toHaveBeenCalled()
  })

  it('reopens a rejected request instead of trying to create it again', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ status: 'rejected' }) })

    await expect(requestPlanParticipation('trip', item, 'viewer')).resolves.toEqual({ kind: 'reopened' })
    expect(mocks.updateDoc).toHaveBeenCalledOnce()
    expect(mocks.setDoc).not.toHaveBeenCalled()
  })
})
