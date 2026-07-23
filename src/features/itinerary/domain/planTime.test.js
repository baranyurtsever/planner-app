import { describe, expect, it } from 'vitest'
import {
  createDateOnlyPlanTime,
  createTimedPlanTime,
  formatPlanTime,
  zonedLocalToUtc,
} from './planTime'

describe('plan time', () => {
  it('stores timed plans as UTC instants with explicit IANA zones', () => {
    expect(
      createTimedPlanTime({
        startsAt: '2026-08-10T07:00:00.000Z',
        endsAt: '2026-08-10T14:30:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Asia/Bangkok',
      }),
    ).toEqual({
      kind: 'timed',
      startsAt: '2026-08-10T07:00:00.000Z',
      endsAt: '2026-08-10T14:30:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Asia/Bangkok',
    })
  })

  it('rejects an end instant before the start instant', () => {
    expect(() =>
      createTimedPlanTime({
        startsAt: '2026-08-10T14:30:00.000Z',
        endsAt: '2026-08-10T07:00:00.000Z',
        startTimeZone: 'Europe/Istanbul',
        endTimeZone: 'Asia/Bangkok',
      }),
    ).toThrow('Bitiş zamanı başlangıçtan önce olamaz.')
  })

  it('keeps date-only plans free of timezone conversion', () => {
    expect(createDateOnlyPlanTime('2026-08-10')).toEqual({
      kind: 'date',
      localDate: '2026-08-10',
    })
  })

  it('formats the same instant in the requested timezone', () => {
    const planTime = createTimedPlanTime({
      startsAt: '2026-08-10T07:00:00.000Z',
      endsAt: '2026-08-10T08:00:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Europe/Istanbul',
    })

    expect(formatPlanTime(planTime, 'tr-TR').start).toContain('10:00')
  })

  it('converts a destination-local wall clock value to a UTC instant', () => {
    expect(zonedLocalToUtc('2026-08-10T10:00', 'Europe/Istanbul')).toBe(
      '2026-08-10T07:00:00.000Z',
    )
  })
})
