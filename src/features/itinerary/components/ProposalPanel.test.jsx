import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProposalPanel } from './ProposalPanel'

vi.mock('../data/planRepository', () => ({
  approvePlanProposal: vi.fn(),
  rejectPlanProposal: vi.fn(),
  withdrawPlanProposal: vi.fn(),
}))

const trip = {
  id: 'trip',
  ownerId: 'owner',
  memberRoles: { owner: 'owner' },
}

describe('ProposalPanel', () => {
  it('groups proposals for one Plan Item and compares current and proposed values', () => {
    render(
      <ProposalPanel
        trip={trip}
        user={{ uid: 'owner' }}
        items={[{ id: 'plan', title: 'Eski başlık', notes: 'Eski not' }]}
        proposals={[
          { id: 'p1', targetItemId: 'plan', proposerId: 'editor-a', action: 'update', patch: { title: 'Yeni başlık' } },
          { id: 'p2', targetItemId: 'plan', proposerId: 'editor-b', action: 'update', patch: { notes: 'Yeni not' } },
        ]}
      />,
    )

    expect(screen.getAllByRole('heading', { name: 'Eski başlık' })).toHaveLength(1)
    expect(screen.getByText('Eski başlık → Yeni başlık')).toBeInTheDocument()
    expect(screen.getByText('Eski not → Yeni not')).toBeInTheDocument()
    expect(screen.getByText(/@editor-a/)).toBeInTheDocument()
    expect(screen.getByText(/@editor-b/)).toBeInTheDocument()
  })
})
