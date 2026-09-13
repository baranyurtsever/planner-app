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
  defaultTimeZone: 'Europe/Istanbul',
}

describe('TripDetailsView', () => {
  it('keeps participant management in the details page for the owner', () => {
    const onSaveMember = vi.fn()
    const onSaveTrip = vi.fn()
    render(
      <TripDetailsView
        trip={trip}
        user={{ uid: 'owner' }}
        profilesById={{
          owner: { displayName: 'Ada Lovelace', username: 'ada' },
          viewer: { displayName: 'Grace Hopper', username: 'grace' },
        }}
        onArchive={vi.fn()}
        onRemoveMember={vi.fn()}
        onSaveMember={onSaveMember}
        onSaveTrip={onSaveTrip}
      />,
    )

    fireEvent.change(screen.getByLabelText('Katılımcı kullanıcı adı'), {
      target: { value: 'editor_user' },
    })
    fireEvent.change(screen.getByLabelText('Katılımcı rolü'), {
      target: { value: 'editor' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ekle / güncelle' }))

    expect(onSaveMember).toHaveBeenCalledWith('editor_user', 'editor')
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('@ada')).toBeInTheDocument()
    expect(screen.queryByText('owner')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Gezi adı'), { target: { value: 'Bangkok 2028' } })
    fireEvent.change(screen.getByLabelText('Gezi görünürlüğü'), { target: { value: 'private' } })
    fireEvent.change(screen.getByLabelText('Varsayılan saat dilimi'), { target: { value: 'Asia/Bangkok' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gezi bilgilerini kaydet' }))
    expect(onSaveTrip).toHaveBeenCalledWith({
      name: 'Bangkok 2028',
      locationName: 'Bangkok',
      visibility: 'private',
      defaultTimeZone: 'Asia/Bangkok',
    })
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
        onSaveTrip={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Gezi Detayları' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Katılımcı kullanıcı adı')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Gezi adı')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Arşivle' })).not.toBeInTheDocument()
  })
})
