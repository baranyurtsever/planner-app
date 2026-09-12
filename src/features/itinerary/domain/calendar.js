import { utcToZonedLocal } from './planTime'

function toLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function localToday(now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function normalizeCalendarDate(value, fallback = localToday()) {
  return isCalendarDate(value) ? value : fallback
}

export function addCalendarDays(value, amount) {
  const [year, month, day] = normalizeCalendarDate(value).split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + amount, 12))
  return date.toISOString().slice(0, 10)
}

export function startOfWeek(value) {
  const date = new Date(`${value}T12:00:00`)
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset)
  return toLocalDate(date)
}

export function weekDates(value) {
  const start = new Date(`${startOfWeek(value)}T12:00:00`)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return toLocalDate(date)
  })
}

export function planItemDate(item) {
  if (item.time.kind === 'date') return item.time.localDate
  return utcToZonedLocal(item.time.startsAt, item.time.startTimeZone).slice(0, 10)
}

export function calendarIntervals(item) {
  if (item.time.kind !== 'timed') return []
  const startLocal = utcToZonedLocal(item.time.startsAt, item.time.startTimeZone)
  const endLocal = utcToZonedLocal(item.time.endsAt, item.time.startTimeZone)
  const startDate = startLocal.slice(0, 10)
  const endDate = endLocal.slice(0, 10)
  const toMinute = (value) => {
    const [hour, minute] = value.slice(11).split(':').map(Number)
    return hour * 60 + minute
  }
  const intervals = []
  let date = startDate
  while (date <= endDate) {
    const startMinute = date === startDate ? toMinute(startLocal) : 0
    const endMinute = date === endDate ? toMinute(endLocal) : 24 * 60
    if (endMinute > startMinute) intervals.push({ ...item, localDate: date, startMinute, endMinute })
    date = addCalendarDays(date, 1)
  }
  return intervals
}

export function moveWeek(value, amount) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + amount * 7)
  return toLocalDate(date)
}
