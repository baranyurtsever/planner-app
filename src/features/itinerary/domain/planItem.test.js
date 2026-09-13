import { describe, expect, it } from 'vitest'
import { publicPlanFields } from './planItem'

describe('publicPlanFields', () => {
  it('never emits undefined fields for a legacy shared plan', () => {
    const fields = publicPlanFields({
      title: 'Bangkok akşamı',
      category: 'legacy-category',
      visibility: 'profile',
      location: { name: 'Bangkok' },
      time: { kind: 'date', localDate: '2026-07-23' },
    })

    expect(fields.scope).toBe('shared')
    expect(fields.category).toBe('other')
    expect(fields.travelFromPrevious).toEqual({ mode: 'none', durationMinutes: 0 })
    expect(Object.values(fields)).not.toContain(undefined)
  })

  it('publishes normalized public place details without participant identity', () => {
    const fields = publicPlanFields({
      ownerId: 'owner', title: 'Müze', category: 'museum', visibility: 'profile',
      location: { name: 'Louvre', address: 'Paris', website: 'https://louvre.fr', phone: '+33 1', openingHours: '09:00-18:00', lat: 48.86, lng: 2.33 },
      time: { kind: 'date', localDate: '2026-09-13' }, participantIds: ['owner', 'friend'],
    })

    expect(fields.location).toMatchObject({ name: 'Louvre', address: 'Paris', website: 'https://louvre.fr/', phone: '+33 1' })
    expect(fields).not.toHaveProperty('participantIds')
    expect(fields).not.toHaveProperty('ownerId')
  })
})
