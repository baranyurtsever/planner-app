import { describe, expect, it } from 'vitest'
import {
  createDateOnlyPlanTime,
  createTimedPlanTime,
  formatCalendarTimeLabel,
  formatPlanTime,
  utcToZonedLocal,
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

  it('requires at least 15 minutes on the 15-minute grid', () => {
    const base = {
      startsAt: '2026-08-10T07:00:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Europe/Istanbul',
    }

    expect(() => createTimedPlanTime({ ...base, endsAt: base.startsAt })).toThrow('en az 15 dakika')
    expect(() => createTimedPlanTime({
      ...base,
      startsAt: '2026-08-10T07:05:00.000Z',
      endsAt: '2026-08-10T07:20:00.000Z',
    })).toThrow('15 dakikalık')
  })

  it('keeps date-only plans free of timezone conversion', () => {
    expect(createDateOnlyPlanTime('2026-08-10')).toEqual({
      kind: 'date',
      localDate: '2026-08-10',
    })
  })

  it('rejects calendar dates that do not exist', () => {
    expect(() => createDateOnlyPlanTime('2026-02-31')).toThrow('Geçersiz takvim tarihi')
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

  it('labels each edge in its own timezone when a Plan Item crosses zones', () => {
    expect(formatCalendarTimeLabel({
      kind: 'timed',
      startsAt: '2026-07-23T20:00:00.000Z',
      endsAt: '2026-07-24T01:00:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Asia/Bangkok',
    }, 'en-US')).toBe('23:00 GMT+3–08:00 GMT+7')
  })

  it('converts a destination-local wall clock value to a UTC instant', () => {
    expect(zonedLocalToUtc('2026-08-10T10:00', 'Europe/Istanbul')).toBe(
      '2026-08-10T07:00:00.000Z',
    )
  })

  it('rejects a wall clock in a DST gap and chooses the earlier overlap instant', () => {
    expect(() => zonedLocalToUtc('2026-03-08T02:30', 'America/New_York')).toThrow('saat diliminde bulunmuyor')
    expect(zonedLocalToUtc('2026-11-01T01:30', 'America/New_York')).toBe('2026-11-01T05:30:00.000Z')
  })

  it('converts a UTC instant back to an editable destination-local value', () => {
    expect(utcToZonedLocal('2026-08-10T07:00:00.000Z', 'Europe/Istanbul')).toBe(
      '2026-08-10T10:00',
    )
  })
})
