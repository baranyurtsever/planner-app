import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProposalPanel } from './ProposalPanel'
import { voteOnPlanProposal } from '../data/planRepository'

vi.mock('../data/planRepository', () => ({
  approvePlanProposal: vi.fn(),
  rejectPlanProposal: vi.fn(),
  voteOnPlanProposal: vi.fn(),
  withdrawPlanProposal: vi.fn(),
}))

vi.mock('../../profile/hooks/useProfilesById', () => ({
  useProfilesById: () => ({
    owner: { displayName: 'Gezi Sahibi' },
    'editor-a': { displayName: 'Ada' },
    'editor-b': { displayName: 'Berk' },
  }),
}))

const trip = {
  id: 'trip',
  ownerId: 'owner',
  memberIds: ['owner', 'editor-a', 'editor-b'],
  memberRoles: { owner: 'owner' },
}

describe('ProposalPanel', () => {
  it('groups proposals for one Plan Item and compares current and proposed values', async () => {
    render(
      <ProposalPanel
        trip={trip}
        user={{ uid: 'owner' }}
        items={[{ id: 'plan', title: 'Eski başlık', notes: 'Eski not' }]}
        proposals={[
          { id: 'p1', targetItemId: 'plan', proposerId: 'editor-a', action: 'update', patch: { title: 'Yeni başlık' }, votes: { owner: 'support' } },
          { id: 'p2', targetItemId: 'plan', proposerId: 'editor-b', action: 'update', patch: { notes: 'Yeni not' } },
        ]}
      />,
    )

    expect(screen.getAllByRole('heading', { name: 'Eski başlık' })).toHaveLength(1)
    expect(screen.getByText('Eski başlık → Yeni başlık')).toBeInTheDocument()
    expect(screen.getByText('Eski not → Yeni not')).toBeInTheDocument()
    expect(screen.getByText(/Ada/)).toBeInTheDocument()
    expect(screen.getByText(/Berk/)).toBeInTheDocument()
    expect(screen.getByText('1 destek · 0 karşı')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Destekliyorum' })).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Karşıyım' })[0])
    await waitFor(() => expect(voteOnPlanProposal).toHaveBeenCalledWith('trip', 'p1', 'owner', 'oppose'))
  })

  it('shows immutable decisions with their vote snapshot', () => {
    render(
      <ProposalPanel
        trip={trip}
        user={{ uid: 'editor-a' }}
        items={[]}
        proposals={[]}
        decisions={[{
          id: 'decision', targetItemId: 'removed', proposerId: 'editor-b', action: 'delete',
          patch: {}, votes: { owner: 'support', 'editor-a': 'oppose' }, outcome: 'rejected',
        }]}
      />,
    )

    expect(screen.getByText('Karar geçmişi')).toBeInTheDocument()
    expect(screen.getByText('Reddedildi')).toBeInTheDocument()
    expect(screen.getByText(/1 destek · 1 karşı/)).toBeInTheDocument()
  })
})
