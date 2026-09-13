import { describe, expect, it } from 'vitest'
import { analyzeTravelGaps, formatTravelDuration, normalizeTravelFromPrevious } from './travel'

const timed = (id, startsAt, endsAt, travelFromPrevious) => ({
  id,
  title: id,
  time: { kind: 'timed', startsAt, endsAt },
  travelFromPrevious,
})

describe('travel planning', () => {
  it('normalizes invalid travel input without undefined fields', () => {
    expect(normalizeTravelFromPrevious({ mode: 'teleport', durationMinutes: -4 })).toEqual({
      mode: 'none',
      durationMinutes: 0,
    })
  })

  it('warns when the gap before a plan is shorter than its travel duration', () => {
    const warnings = analyzeTravelGaps([
      timed('museum', '2026-09-13T08:00:00.000Z', '2026-09-13T09:00:00.000Z'),
      timed('food', '2026-09-13T09:20:00.000Z', '2026-09-13T10:00:00.000Z', { mode: 'walk', durationMinutes: 35 }),
    ])

    expect(warnings.get('food')).toMatchObject({ availableMinutes: 20, requiredMinutes: 35, shortageMinutes: 15, kind: 'tight' })
  })

  it('does not warn when enough transfer time is available', () => {
    const warnings = analyzeTravelGaps([
      timed('museum', '2026-09-13T08:00:00.000Z', '2026-09-13T09:00:00.000Z'),
      timed('food', '2026-09-13T10:00:00.000Z', '2026-09-13T11:00:00.000Z', { mode: 'drive', durationMinutes: 30 }),
    ])
    expect(warnings.size).toBe(0)
    expect(formatTravelDuration(95)).toBe('1 sa 35 dk')
  })
})
