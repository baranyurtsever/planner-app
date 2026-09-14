import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PublicLayout } from './PublicLayout'

vi.mock('../../features/auth/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
}))
vi.mock('../../features/auth/authState', () => ({
  useAuth: () => ({ user: { uid: 'traveler' }, loading: false }),
}))

describe('PublicLayout', () => {
  it('returns an authenticated profile visitor to the app', () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Gezilerime dön' })).toHaveAttribute('href', '/app/trips')
    expect(screen.queryByRole('link', { name: 'Giriş yap' })).not.toBeInTheDocument()
  })
})
