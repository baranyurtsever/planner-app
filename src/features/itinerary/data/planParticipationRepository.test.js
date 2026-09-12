import { beforeEach, describe, expect, it, vi } from 'vitest'
import { leavePlanItem } from './planParticipationRepository'

const mocks = vi.hoisted(() => ({
  batchDelete: vi.fn(),
  batchUpdate: vi.fn(),
  commit: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
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
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  where: (...parts) => ({ parts }),
  writeBatch: () => ({
    delete: mocks.batchDelete,
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
})
