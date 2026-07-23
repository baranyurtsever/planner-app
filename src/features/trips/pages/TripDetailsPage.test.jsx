import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TripDetailsView } from './TripDetailsPage'

const trip = {
  id: 'trip',
  name: 'Bangkok 2027',
  locationName: 'Bangkok',
  visibility: 'profile',
  status: 'active',
  ownerId: 'owner',
  memberIds: ['owner', 'viewer'],
  memberRoles: { owner: 'owner', viewer: 'viewer' },
}

describe('TripDetailsView', () => {
  it('keeps participant management in the details page for the owner', () => {
    const onSaveMember = vi.fn()
    render(
      <TripDetailsView
        trip={trip}
        user={{ uid: 'owner' }}
        onArchive={vi.fn()}
        onRemoveMember={vi.fn()}
        onSaveMember={onSaveMember}
      />,
    )

    fireEvent.change(screen.getByLabelText('Katılımcı kullanıcı kimliği'), {
      target: { value: 'editor' },
    })
    fireEvent.change(screen.getByLabelText('Katılımcı rolü'), {
      target: { value: 'editor' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ekle / güncelle' }))

    expect(onSaveMember).toHaveBeenCalledWith('editor', 'editor')
    expect(screen.getByRole('button', { name: 'Arşivle' })).toBeInTheDocument()
  })

  it('shows details without owner controls to another participant', () => {
    render(
      <TripDetailsView
        trip={trip}
        user={{ uid: 'viewer' }}
        onArchive={vi.fn()}
        onRemoveMember={vi.fn()}
        onSaveMember={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Gezi Detayları' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Katılımcı kullanıcı kimliği')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Arşivle' })).not.toBeInTheDocument()
  })
})
