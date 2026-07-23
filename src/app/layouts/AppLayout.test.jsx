import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout'

vi.mock('../../features/auth/data/authRepository', () => ({ logout: vi.fn() }))

describe('AppLayout', () => {
  it('keeps trips, people, and profile navigation visible', () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Geziler' })).toHaveAttribute('href', '/app/trips')
    expect(screen.getByRole('link', { name: 'Kişiler' })).toHaveAttribute('href', '/app/people')
    expect(screen.getByRole('link', { name: 'Profilim' })).toHaveAttribute('href', '/app/profile')
  })
})
