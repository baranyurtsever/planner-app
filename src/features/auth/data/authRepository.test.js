import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  deleteUser: vi.fn(),
  sendEmailVerification: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

const firestoreMocks = vi.hoisted(() => ({
  runTransaction: vi.fn(),
}))

vi.mock('firebase/auth', () => authMocks)
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...parts) => parts.slice(1).join('/')),
  runTransaction: firestoreMocks.runTransaction,
  serverTimestamp: vi.fn(() => 'server-time'),
}))
vi.mock('../../../infrastructure/firebase/authClient', () => ({ auth: {} }))
vi.mock('../../../infrastructure/firebase/firestoreClient', () => ({ db: {} }))

import { register } from './authRepository'

describe('authRepository registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const user = { uid: 'user-1', email: 'ada@example.com' }
    authMocks.createUserWithEmailAndPassword.mockResolvedValue({ user })
    firestoreMocks.runTransaction.mockImplementation(async (_db, callback) => {
      await callback({
        get: vi.fn().mockResolvedValue({ exists: () => false }),
        set: vi.fn(),
      })
    })
  })

  it('sends an address verification email after registration succeeds', async () => {
    const user = await register({
      email: 'ada@example.com',
      password: 'secret123',
      displayName: 'Ada',
      username: 'ada',
    })

    expect(authMocks.sendEmailVerification).toHaveBeenCalledWith(user)
  })
})
