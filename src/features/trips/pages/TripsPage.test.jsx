import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TripsPage } from './TripsPage'

const mocks = vi.hoisted(() => ({ completeRegistration: vi.fn() }))

vi.mock('../../auth/authState', () => ({ useAuth: () => ({ user: { uid: 'owner' } }) }))
vi.mock('../../auth/data/authRepository', () => ({ completeRegistration: mocks.completeRegistration }))
vi.mock('../data/tripRepository', () => ({
  createTrip: vi.fn(),
  subscribeToUserTrips: (_userId, callback) => {
    callback([])
    return vi.fn()
  },
}))

describe('TripsPage registration recovery', () => {
  beforeEach(() => {
    sessionStorage.setItem('registration-completion', JSON.stringify({ displayName: 'Ada', warnings: ['verification-email'] }))
    mocks.completeRegistration.mockResolvedValue([])
  })

  it('shows and retries incomplete registration steps', async () => {
    render(<MemoryRouter><TripsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Kayıt adımlarını yeniden dene' }))

    await waitFor(() => expect(mocks.completeRegistration).toHaveBeenCalledWith({ uid: 'owner' }, 'Ada'))
    expect(sessionStorage.getItem('registration-completion')).toBeNull()
  })
})
