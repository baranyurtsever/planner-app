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
})
