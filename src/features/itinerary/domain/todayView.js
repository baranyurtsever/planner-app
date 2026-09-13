import { localToday } from './calendar'
import { utcToZonedLocal } from './planTime'

export function participatesInPlanItem(item, userId) {
  if ((item.scope || 'shared') === 'personal') return item.participantIds?.includes(userId) ?? false
  return !(item.excludedParticipantIds || []).includes(userId)
}

export function planItemOccursToday(item, now, defaultTimeZone) {
  if (item.time.kind === 'date') return item.time.localDate === localToday(now, defaultTimeZone)
  const itemToday = localToday(now, item.time.startTimeZone)
  return utcToZonedLocal(item.time.startsAt, item.time.startTimeZone).slice(0, 10) === itemToday
}

export function buildTodayView(items, userId, now = new Date(), defaultTimeZone) {
  const participating = items.filter((item) => participatesInPlanItem(item, userId))
  const today = participating
    .filter((item) => planItemOccursToday(item, now, defaultTimeZone))
    .sort((left, right) => {
      if (left.time.kind === 'date') return -1
      if (right.time.kind === 'date') return 1
      return Date.parse(left.time.startsAt) - Date.parse(right.time.startsAt)
    })
  const next = participating
    .filter((item) => item.time.kind === 'timed' && Date.parse(item.time.endsAt) > now.getTime())
    .sort((left, right) => Date.parse(left.time.startsAt) - Date.parse(right.time.startsAt))[0] || null
  return { today, next }
}
