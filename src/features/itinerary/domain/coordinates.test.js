import { describe, expect, it } from 'vitest'
import { hasValidCoordinates } from './coordinates'

describe('route coordinates', () => {
  it('excludes absent and out-of-range positions without excluding the equator', () => {
    for (const location of [undefined, { lat: null, lng: null }, { lat: '', lng: '' }, { lat: ' ', lng: 10 }, { lat: 91, lng: 10 }, { lat: 10, lng: 181 }]) {
      expect(hasValidCoordinates(location)).toBe(false)
    }
    expect(hasValidCoordinates({ lat: 0, lng: 0 })).toBe(true)
    expect(hasValidCoordinates({ lat: '13.7563', lng: '100.5018' })).toBe(true)
  })
})
