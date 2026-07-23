import { describe, expect, it } from 'vitest'
import { moveWeek, planItemDate, startOfWeek, weekDates } from './calendar'

describe('calendar domain', () => {
  it('builds a Monday-first week', () => {
    expect(startOfWeek('2026-07-23')).toBe('2026-07-20')
    expect(weekDates('2026-07-23')).toEqual([
      '2026-07-20',
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
      '2026-07-24',
      '2026-07-25',
      '2026-07-26',
    ])
  })

  it('moves by complete weeks', () => {
    expect(moveWeek('2026-07-23', 1)).toBe('2026-07-30')
  })

  it('uses the plan start timezone when choosing its calendar date', () => {
    expect(planItemDate({
      time: {
        kind: 'timed',
        startsAt: '2026-07-22T22:30:00.000Z',
        startTimeZone: 'Europe/Istanbul',
      },
    })).toBe('2026-07-23')
  })
})
