import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ActionCenterPage } from './ActionCenterPage'

const mocks = vi.hoisted(() => ({ acceptTripInvitation: vi.fn() }))

vi.mock('../../auth/authState', () => ({ useAuth: () => ({ user: { uid: 'owner' } }) }))
vi.mock('../../profile/hooks/useProfilesById', () => ({ useProfilesById: () => ({ friend: { displayName: 'Ada' } }) }))
vi.mock('../../trips/data/tripInvitationRepository', () => ({
  acceptTripInvitation: mocks.acceptTripInvitation,
  rejectTripInvitation: vi.fn(),
}))
vi.mock('../../social/data/friendshipRepository', () => ({ acceptFriendRequest: vi.fn(), rejectFriendRequest: vi.fn() }))
vi.mock('../../itinerary/data/planParticipationRepository', () => ({ decideParticipationRequest: vi.fn() }))
vi.mock('../../itinerary/components/ProposalPanel', () => ({ ProposalPanel: () => <div>Öneri oylaması</div> }))

const actionCenter = {
  error: '',
  invitations: [{ id: 'invite', tripId: 'trip', tripName: 'Bangkok', inviteeId: 'owner', role: 'viewer' }],
  friendRequests: [{ id: 'friend-request', fromId: 'friend', toId: 'owner' }],
  trips: [{ id: 'trip', name: 'Bangkok', ownerId: 'owner', memberIds: ['owner'], memberRoles: { owner: 'owner' } }],
  proposalsByTrip: { trip: [{ id: 'proposal' }] },
  requestsByTrip: { trip: [] },
  itemsByTrip: { trip: [] },
  upcoming: [{ id: 'plan', tripId: 'trip', tripName: 'Bangkok', title: 'Uçuş', time: { kind: 'date', localDate: '2026-09-15' } }],
}

describe('ActionCenterPage', () => {
  it('combines pending actions and upcoming plans', async () => {
    render(
      <MemoryRouter initialEntries={['/actions']}>
        <Routes>
          <Route element={<Outlet context={{ actionCenter }} />}>
            <Route path="actions" element={<ActionCenterPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'İşlem Merkezi' })).toBeInTheDocument()
    expect(screen.getByText('Öneri oylaması')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Uçuş/ })).toHaveAttribute('href', '/app/trips/trip/calendar')
    fireEvent.click(screen.getAllByRole('button', { name: 'Kabul et' })[0])
    await waitFor(() => expect(mocks.acceptTripInvitation).toHaveBeenCalledWith(actionCenter.invitations[0], 'owner'))
  })
})
