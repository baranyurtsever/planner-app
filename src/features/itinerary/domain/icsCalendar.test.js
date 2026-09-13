import { describe, expect, it } from 'vitest'
import { buildIcsCalendar, exportablePlanItems } from './icsCalendar'

describe('ICS calendar export', () => {
  it('exports timed and date-only events without private notes', () => {
    const ics = buildIcsCalendar([
      {
        id: 'flight', title: 'İstanbul, Bangkok', notes: 'Gizli PNR', status: 'todo',
        location: { name: 'IST; Terminal' },
        time: { kind: 'timed', startsAt: '2026-09-13T08:15:00.000Z', endsAt: '2026-09-13T17:30:00.000Z', startTimeZone: 'Europe/Istanbul', endTimeZone: 'Asia/Bangkok' },
      },
      { id: 'museum', title: 'Müze', status: 'todo', location: {}, time: { kind: 'date', localDate: '2026-09-14' } },
    ], { calendarName: 'Bangkok 2027', now: new Date('2026-09-01T00:00:00.000Z') })

    expect(ics).toContain('DTSTART:20260913T081500Z')
    expect(ics).toContain('X-PEREGRIN-START-TIMEZONE:Europe/Istanbul')
    expect(ics).toContain('X-PEREGRIN-END-TIMEZONE:Asia/Bangkok')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260914')
    expect(ics).toContain('DTEND;VALUE=DATE:20260915')
    expect(ics).toContain('SUMMARY:İstanbul\\, Bangkok')
    expect(ics).toContain('LOCATION:IST\\; Terminal')
    expect(ics).not.toContain('Gizli PNR')
    expect(ics.endsWith('\r\n')).toBe(true)
  })

  it('exports only items the user participates in', () => {
    const items = exportablePlanItems([
      { id: 'shared', scope: 'shared', excludedParticipantIds: [] },
      { id: 'left', scope: 'shared', excludedParticipantIds: ['viewer'] },
      { id: 'personal', scope: 'personal', participantIds: ['owner'] },
    ], 'viewer')
    expect(items.map((item) => item.id)).toEqual(['shared'])
  })
})
