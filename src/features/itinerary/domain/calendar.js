import { utcToZonedLocal } from './planTime'

function toLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export function moveWeek(value, amount) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + amount * 7)
  return toLocalDate(date)
}
