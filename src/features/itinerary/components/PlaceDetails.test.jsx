import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlaceDetails } from './PlaceDetails'

describe('PlaceDetails', () => {
  it('shows useful place links and suppresses unsafe URLs', () => {
    render(<PlaceDetails location={{
      name: 'Galata Kulesi', address: 'Beyoğlu, İstanbul', openingHours: '09:00-20:30',
      mapUrl: 'https://www.openstreetmap.org/way/1', website: 'javascript:alert(1)', phone: '+90 212 123 45 67',
    }} />)

    expect(screen.getByText('Beyoğlu, İstanbul')).toBeInTheDocument()
    expect(screen.getByText(/09:00-20:30/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Haritada aç ↗' })).toHaveAttribute('href', 'https://www.openstreetmap.org/way/1')
    expect(screen.queryByRole('link', { name: 'Web sitesi ↗' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ara:/ })).toHaveAttribute('href', 'tel:+902121234567')
  })
})
