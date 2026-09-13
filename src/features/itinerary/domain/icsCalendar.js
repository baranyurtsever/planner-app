import { addCalendarDays } from './calendar'
import { participatesInPlanItem } from './todayView'

function escapeText(value = '') {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
}

function utcStamp(value) {
  return new Date(value).toISOString().replaceAll('-', '').replaceAll(':', '').replace('.000', '')
}

function dateStamp(value) {
  return value.replaceAll('-', '')
}

function eventLines(item, now) {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeText(`${item.id}@peregrin.app`)}`,
    `DTSTAMP:${utcStamp(now)}`,
    `SUMMARY:${escapeText(item.title)}`,
  ]
  if (item.time.kind === 'date') {
    lines.push(`DTSTART;VALUE=DATE:${dateStamp(item.time.localDate)}`)
    lines.push(`DTEND;VALUE=DATE:${dateStamp(addCalendarDays(item.time.localDate, 1))}`)
  } else {
    lines.push(`DTSTART:${utcStamp(item.time.startsAt)}`)
    lines.push(`DTEND:${utcStamp(item.time.endsAt)}`)
    lines.push(`X-PEREGRIN-START-TIMEZONE:${escapeText(item.time.startTimeZone)}`)
    lines.push(`X-PEREGRIN-END-TIMEZONE:${escapeText(item.time.endTimeZone)}`)
  }
  if (item.location?.name) lines.push(`LOCATION:${escapeText(item.location.name)}`)
  if (item.status === 'cancelled') lines.push('STATUS:CANCELLED')
  lines.push('END:VEVENT')
  return lines
}

export function buildIcsCalendar(items, { calendarName = 'Peregrin Gezi', now = new Date() } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Peregrin//Travel Planner//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    ...items.flatMap((item) => eventLines(item, now)),
    'END:VCALENDAR',
  ]
  return `${lines.join('\r\n')}\r\n`
}

export function exportablePlanItems(items, userId) {
  return items.filter((item) => participatesInPlanItem(item, userId))
}

export function downloadIcsCalendar(items, calendarName, filename = 'peregrin-takvim.ics') {
  const blob = new Blob([buildIcsCalendar(items, { calendarName })], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
