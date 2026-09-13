import { describe, expect, it } from 'vitest'
import { normalizePlaceSearchResult, normalizePlanLocation } from './place'

describe('place normalization', () => {
  it('maps Nominatim fields into a stable Plan location', () => {
    expect(normalizePlaceSearchResult({
      osm_type: 'way', osm_id: 42, name: 'Galata Kulesi',
      display_name: 'Galata Kulesi, Beyoğlu, İstanbul', lat: '41.0256', lon: '28.9741', type: 'attraction',
      extratags: { website: 'https://example.com', phone: '+90 212', opening_hours: 'Mo-Su 08:30-23:00' },
    })).toMatchObject({
      id: 'way-42', name: 'Galata Kulesi', address: 'Galata Kulesi, Beyoğlu, İstanbul',
      lat: 41.0256, lng: 28.9741, category: 'attraction', phone: '+90 212', openingHours: 'Mo-Su 08:30-23:00',
      mapUrl: 'https://www.openstreetmap.org/way/42', website: 'https://example.com/',
    })
  })

  it('drops unsafe URLs from stored locations', () => {
    expect(normalizePlanLocation({
      locationName: 'Test', mapUrl: 'javascript:alert(1)', locationWebsite: 'data:text/html,test',
    })).toMatchObject({ name: 'Test', mapUrl: '', website: '' })
  })
})
