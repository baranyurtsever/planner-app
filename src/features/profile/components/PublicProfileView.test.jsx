import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PublicProfileView } from './PublicProfileView'

describe('PublicProfileView', () => {
  it('renders profile-visible trips without exposing edit actions', () => {
    render(
      <PublicProfileView
        profile={{ displayName: 'Ada', username: 'ada', bio: 'Yolda.' }}
        trips={[{ id: 'trip-1', name: 'Bangkok', locationName: 'Tayland' }]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Bangkok/ })).toHaveAttribute(
      'href',
      '/u/ada/trips/trip-1',
    )
    expect(screen.queryByRole('button', { name: /düzenle/i })).not.toBeInTheDocument()
  })
})
