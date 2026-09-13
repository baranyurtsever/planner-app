import { describe, expect, it } from 'vitest'
import { buildTodayView, planItemOccursToday } from './todayView'

const timed = (id, startsAt, endsAt, startTimeZone = 'Asia/Bangkok', overrides = {}) => ({
  id,
  scope: 'shared',
  excludedParticipantIds: [],
  time: { kind: 'timed', startsAt, endsAt, startTimeZone, endTimeZone: startTimeZone },
  ...overrides,
})

describe('today view', () => {
  it('uses each timed item timezone and the trip timezone for date-only items', () => {
    const now = new Date('2026-09-13T18:30:00.000Z')
    expect(planItemOccursToday(
      timed('bangkok', '2026-09-13T18:00:00.000Z', '2026-09-13T20:00:00.000Z'),
      now,
      'Europe/Istanbul',
    )).toBe(true)
    expect(planItemOccursToday(
      { time: { kind: 'date', localDate: '2026-09-13' } },
      now,
      'Europe/Istanbul',
    )).toBe(true)
  })

  it('excludes plans the user does not participate in and finds the next absolute instant', () => {
    const now = new Date('2026-09-13T08:00:00.000Z')
    const result = buildTodayView([
      timed('excluded', '2026-09-13T08:15:00.000Z', '2026-09-13T09:00:00.000Z', 'Europe/Istanbul', { excludedParticipantIds: ['viewer'] }),
      timed('next', '2026-09-13T08:30:00.000Z', '2026-09-13T09:30:00.000Z', 'Europe/Istanbul'),
      timed('personal', '2026-09-13T08:10:00.000Z', '2026-09-13T09:00:00.000Z', 'Europe/Istanbul', { scope: 'personal', participantIds: ['owner'] }),
    ], 'viewer', now, 'Europe/Istanbul')

    expect(result.today.map((item) => item.id)).toEqual(['next'])
    expect(result.next.id).toBe('next')
  })
})
