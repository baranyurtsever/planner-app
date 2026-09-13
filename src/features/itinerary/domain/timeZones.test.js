import { describe, expect, it } from 'vitest'
import { createTimeZoneOptions } from './timeZones'

describe('time zone options', () => {
  it('labels IANA zones with the UTC offset valid on the selected date', () => {
    const options = createTimeZoneOptions(new Date('2026-09-13T12:00:00.000Z'))

    expect(options).toContainEqual({
      value: 'Europe/Istanbul',
      label: 'UTC+03:00 — Europe/Istanbul',
    })
    expect(options).toContainEqual({
      value: 'America/New_York',
      label: 'UTC-04:00 — America/New_York',
    })
  })
})
