import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PeoplePage } from './PeoplePage'

const mocks = vi.hoisted(() => ({
  acceptTripInvitation: vi.fn(),
  rejectTripInvitation: vi.fn(),
}))

vi.mock('../../auth/authState', () => ({
  useAuth: () => ({ user: { uid: 'guest' } }),
}))

vi.mock('../../profile/data/profileRepository', () => ({
  getProfileById: vi.fn(),
  getProfileByUsername: vi.fn(),
}))

vi.mock('../data/friendshipRepository', () => ({
  acceptFriendRequest: vi.fn(),
  rejectFriendRequest: vi.fn(),
  removeFriendship: vi.fn(),
  sendFriendRequest: vi.fn(),
  subscribeToFriendships: (_userId, callback) => {
    callback([])
    return vi.fn()
  },
  subscribeToIncomingFriendRequests: (_userId, callback) => {
    callback([])
    return vi.fn()
  },
}))

vi.mock('../../trips/data/tripInvitationRepository', () => ({
  acceptTripInvitation: mocks.acceptTripInvitation,
  rejectTripInvitation: mocks.rejectTripInvitation,
  subscribeToIncomingTripInvitations: (_userId, callback) => {
    callback([{
      id: 'trip_guest',
      tripId: 'trip',
      tripName: 'Bangkok',
      inviteeId: 'guest',
      inviterId: 'owner',
      role: 'viewer',
      status: 'pending',
    }])
    return vi.fn()
  },
}))

describe('PeoplePage trip invitations', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows an incoming invitation and accepts it', async () => {
    render(<MemoryRouter><PeoplePage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Gezi davetleri' })).toBeInTheDocument()
    expect(screen.getByText('Bangkok')).toBeInTheDocument()
    expect(screen.getByText('Katılımcı olarak davet edildin')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Geziye katıl' }))

    await waitFor(() => expect(mocks.acceptTripInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'trip_guest' }),
      'guest',
    ))
  })
})
