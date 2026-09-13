import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TripsPage } from './TripsPage'

const mocks = vi.hoisted(() => ({ completeRegistration: vi.fn(), duplicateTrip: vi.fn(), trips: [] }))

vi.mock('../../auth/authState', () => ({ useAuth: () => ({ user: { uid: 'owner' } }) }))
vi.mock('../../auth/data/authRepository', () => ({ completeRegistration: mocks.completeRegistration }))
vi.mock('../data/tripRepository', () => ({
  createTrip: vi.fn(),
  duplicateTrip: mocks.duplicateTrip,
  subscribeToUserTrips: (_userId, callback) => {
    callback(mocks.trips)
    return vi.fn()
  },
}))

describe('TripsPage registration recovery', () => {
  beforeEach(() => {
    mocks.trips = []
    mocks.duplicateTrip.mockReset()
    sessionStorage.setItem('registration-completion', JSON.stringify({ displayName: 'Ada', warnings: ['verification-email'] }))
    mocks.completeRegistration.mockResolvedValue([])
  })

  it('shows and retries incomplete registration steps', async () => {
    render(<MemoryRouter><TripsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Kayıt adımlarını yeniden dene' }))

    await waitFor(() => expect(mocks.completeRegistration).toHaveBeenCalledWith({ uid: 'owner' }, 'Ada'))
    expect(sessionStorage.getItem('registration-completion')).toBeNull()
  })

  it('duplicates an owned trip with an explicit name and start date', async () => {
    sessionStorage.clear()
    const trip = {
      id: 'trip', name: 'Bangkok', locationName: 'Tayland', ownerId: 'owner',
      memberIds: ['owner'], memberRoles: { owner: 'owner' }, visibility: 'private',
      defaultTimeZone: 'Asia/Bangkok',
    }
    mocks.trips = [trip]
    mocks.duplicateTrip.mockResolvedValue('copy')
    render(<MemoryRouter><TripsPage /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Geziyi çoğalt' }))
    expect(screen.getByText('Saat dilimi: Asia/Bangkok')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Kopya Gezi adı'), { target: { value: 'Bangkok 2027' } })
    fireEvent.change(screen.getByLabelText('Kopya başlangıç tarihi'), { target: { value: '2027-05-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Çoğalt' }))

    await waitFor(() => expect(mocks.duplicateTrip).toHaveBeenCalledWith(
      trip,
      { name: 'Bangkok 2027', startDate: '2027-05-01' },
      'owner',
    ))
  })
})
