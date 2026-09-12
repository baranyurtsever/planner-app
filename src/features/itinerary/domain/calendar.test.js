import { describe, expect, it } from 'vitest'
import {
  calendarIntervals,
  localToday,
  moveWeek,
  normalizeCalendarDate,
  planItemDate,
  startOfWeek,
  weekDates,
} from './calendar'

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

  it('computes today in the requested local timezone and rejects invalid URL dates', () => {
    const instant = new Date('2026-07-22T22:30:00.000Z')
    expect(localToday(instant, 'Europe/Istanbul')).toBe('2026-07-23')
    expect(normalizeCalendarDate('2026-02-31', '2026-07-23')).toBe('2026-07-23')
    expect(normalizeCalendarDate('not-a-date', '2026-07-23')).toBe('2026-07-23')
  })

  it('splits an overnight event into local-day segments', () => {
    expect(calendarIntervals({
      id: 'night',
      time: {
        kind: 'timed',
        startsAt: '2026-07-23T20:00:00.000Z',
        endsAt: '2026-07-24T02:00:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Europe/Istanbul',
      },
    })).toMatchObject([
      { localDate: '2026-07-23', startMinute: 1380, endMinute: 1440 },
      { localDate: '2026-07-24', startMinute: 0, endMinute: 300 },
    ])
  })

  it('uses the start-zone timeline for a flight ending in another timezone', () => {
    expect(calendarIntervals({
      id: 'flight',
      time: {
        kind: 'timed',
        startsAt: '2026-07-23T20:00:00.000Z',
        endsAt: '2026-07-24T01:00:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Asia/Bangkok',
      },
    })).toMatchObject([
      { localDate: '2026-07-23', startMinute: 1380, endMinute: 1440 },
      { localDate: '2026-07-24', startMinute: 0, endMinute: 240 },
    ])
  })
})
