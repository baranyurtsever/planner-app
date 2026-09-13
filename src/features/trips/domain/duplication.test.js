import { describe, expect, it } from 'vitest'
import { daysBetween, duplicateSharedPlanItem, shiftPlanTime } from './duplication'

describe('trip duplication', () => {
  it('shifts dates while preserving local wall-clock time and timezones', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
    const shifted = shiftPlanTime({
      kind: 'timed',
      startsAt: '2026-03-28T08:00:00.000Z',
      endsAt: '2026-03-28T09:00:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Europe/Istanbul',
    }, 2)
    expect(shifted).toEqual({
      kind: 'timed',
      startsAt: '2026-03-30T08:00:00.000Z',
      endsAt: '2026-03-30T09:00:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Europe/Istanbul',
    })
  })

  it('clears notes and participation state from copied shared plans', () => {
    const copied = duplicateSharedPlanItem({
      scope: 'shared', ownerId: null, notes: 'Özel bilgi', excludedParticipantIds: ['viewer'],
      blockedParticipantIds: ['editor'], participantIds: [], time: { kind: 'date', localDate: '2026-09-10' },
    }, 'new-owner', 5)
    expect(copied).toMatchObject({
      notes: '', createdBy: 'new-owner', excludedParticipantIds: [], blockedParticipantIds: [],
      time: { kind: 'date', localDate: '2026-09-15' },
    })
  })
})
