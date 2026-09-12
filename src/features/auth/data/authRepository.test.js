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
    authMocks.deleteUser.mockResolvedValue()
    authMocks.updateProfile.mockResolvedValue()
    authMocks.sendEmailVerification.mockResolvedValue()
    firestoreMocks.runTransaction.mockImplementation(async (_db, callback) => {
      await callback({
        get: vi.fn().mockResolvedValue({ exists: () => false }),
        set: vi.fn(),
      })
    })
  })

  it('sends an address verification email after registration succeeds', async () => {
    const result = await register({
      email: 'ada@example.com',
      password: 'secret123',
      displayName: 'Ada',
      username: 'ada',
    })

    expect(authMocks.sendEmailVerification).toHaveBeenCalledWith(result.user)
    expect(result.warnings).toEqual([])
  })

  it('deletes the auth user only when the durable profile transaction fails', async () => {
    const failure = new Error('profile write failed')
    firestoreMocks.runTransaction.mockRejectedValue(failure)

    await expect(register({
      email: 'ada@example.com',
      password: 'secret123',
      displayName: 'Ada',
      username: 'ada',
    })).rejects.toThrow('profile write failed')
    expect(authMocks.deleteUser).toHaveBeenCalledOnce()
  })

  it.each([
    ['profile', authMocks.updateProfile],
    ['verification-email', authMocks.sendEmailVerification],
  ])('keeps the registered account when the %s step fails', async (stage, failingStep) => {
    failingStep.mockRejectedValue(new Error(`${stage} failed`))

    const result = await register({
      email: 'ada@example.com',
      password: 'secret123',
      displayName: 'Ada',
      username: 'ada',
    })

    expect(result.user.uid).toBe('user-1')
    expect(result.warnings).toContain(stage)
    expect(authMocks.deleteUser).not.toHaveBeenCalled()
  })
})
