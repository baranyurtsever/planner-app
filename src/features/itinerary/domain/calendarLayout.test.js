import { describe, expect, it } from 'vitest'
import {
  layoutOverlappingItems,
  moveTimedPlan,
  resizeTimedPlan,
  snapCalendarMinute,
} from './calendarLayout'

describe('calendar interaction math', () => {
  it('snaps movement to 15 minute increments', () => {
    expect(snapCalendarMinute(22)).toBe(15)
    expect(snapCalendarMinute(23)).toBe(30)
    expect(snapCalendarMinute(1439)).toBe(1425)
  })

  it('moves an item to another local day while preserving its duration', () => {
    const moved = moveTimedPlan({
      kind: 'timed',
      startsAt: '2026-07-23T07:00:00.000Z',
      endsAt: '2026-07-23T08:30:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Europe/Istanbul',
    }, {
      localDate: '2026-07-25',
      startMinute: 14 * 60 + 15,
    })

    expect(moved.startsAt).toBe('2026-07-25T11:15:00.000Z')
    expect(Date.parse(moved.endsAt) - Date.parse(moved.startsAt)).toBe(90 * 60 * 1000)
  })

  it('resizes only the requested edge and enforces a 15 minute minimum', () => {
    const time = {
      kind: 'timed',
      startsAt: '2026-07-23T07:00:00.000Z',
      endsAt: '2026-07-23T08:00:00.000Z',
      startTimeZone: 'Europe/Istanbul',
      endTimeZone: 'Europe/Istanbul',
    }

    expect(resizeTimedPlan(time, {
      edge: 'start',
      localDate: '2026-07-23',
      minute: 10 * 60 + 45,
    }).startsAt).toBe('2026-07-23T07:45:00.000Z')

    expect(resizeTimedPlan(time, {
      edge: 'end',
      localDate: '2026-07-23',
      minute: 10 * 60,
    }).endsAt).toBe('2026-07-23T07:15:00.000Z')
  })
})

describe('overlap layout', () => {
  it('places concurrent cards side by side', () => {
    const result = layoutOverlappingItems([
      { id: 'a', startMinute: 9 * 60, endMinute: 11 * 60 },
      { id: 'b', startMinute: 9 * 60 + 30, endMinute: 10 * 60 + 30 },
    ])

    expect(result.a).toMatchObject({ column: 0, columnCount: 2, columnSpan: 1 })
    expect(result.b).toMatchObject({ column: 1, columnCount: 2, columnSpan: 1 })
  })

  it('expands a card into columns that stay free for its full duration', () => {
    const result = layoutOverlappingItems([
      { id: 'long', startMinute: 8 * 60 + 45, endMinute: 12 * 60 },
      { id: 'early', startMinute: 9 * 60, endMinute: 10 * 60 },
      { id: 'overlap', startMinute: 9 * 60 + 30, endMinute: 10 * 60 + 30 },
      { id: 'short', startMinute: 10 * 60 + 30, endMinute: 11 * 60 },
    ])

    expect(result.long.columnCount).toBe(3)
    expect(result.short).toMatchObject({ column: 1, columnSpan: 2 })
  })

  it('uses stable ordering for cards with equal start times', () => {
    const result = layoutOverlappingItems([
      { id: 'b', startMinute: 600, endMinute: 660 },
      { id: 'a', startMinute: 600, endMinute: 660 },
    ])

    expect(result.a.column).toBe(0)
    expect(result.b.column).toBe(1)
  })
})
