import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PlaceSearchField } from './PlaceSearchField'

const mocks = vi.hoisted(() => ({ searchPlaces: vi.fn() }))
vi.mock('../data/placeSearchRepository', () => ({ searchPlaces: mocks.searchPlaces }))

describe('PlaceSearchField', () => {
  it('searches only after explicit submit and returns the selected rich place', async () => {
    const place = { id: 'node-1', name: 'Galata Kulesi', address: 'Beyoğlu, İstanbul', lat: 41, lng: 29 }
    mocks.searchPlaces.mockResolvedValue([place])
    const onSelect = vi.fn()
    render(<PlaceSearchField onSelect={onSelect} />)

    fireEvent.change(screen.getByLabelText('Yer arama sorgusu'), { target: { value: 'Galata Kulesi' } })
    expect(mocks.searchPlaces).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Ara' }))
    await screen.findByText('Beyoğlu, İstanbul')
    fireEvent.click(screen.getByRole('button', { name: /Galata Kulesi/ }))

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(place))
    expect(mocks.searchPlaces).toHaveBeenCalledOnce()
  })
})
