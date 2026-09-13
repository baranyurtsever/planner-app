import { addCalendarDays } from '../../itinerary/domain/calendar'
import { utcToZonedLocal, zonedLocalToUtc } from '../../itinerary/domain/planTime'

export function planLocalDate(item) {
  return item.time.kind === 'date'
    ? item.time.localDate
    : utcToZonedLocal(item.time.startsAt, item.time.startTimeZone).slice(0, 10)
}

export function daysBetween(sourceDate, targetDate) {
  return Math.round((Date.parse(`${targetDate}T00:00:00.000Z`) - Date.parse(`${sourceDate}T00:00:00.000Z`)) / 86_400_000)
}

export function shiftPlanTime(time, dayOffset) {
  if (time.kind === 'date') return { ...time, localDate: addCalendarDays(time.localDate, dayOffset) }
  const shiftEdge = (instant, timeZone) => {
    const local = utcToZonedLocal(instant, timeZone)
    return zonedLocalToUtc(`${addCalendarDays(local.slice(0, 10), dayOffset)}${local.slice(10)}`, timeZone)
  }
  return {
    ...time,
    startsAt: shiftEdge(time.startsAt, time.startTimeZone),
    endsAt: shiftEdge(time.endsAt, time.endTimeZone),
  }
}

export function duplicateSharedPlanItem(item, userId, dayOffset) {
  return {
    ...item,
    ownerId: null,
    notes: '',
    time: shiftPlanTime(item.time, dayOffset),
    participantMode: 'all',
    participantIds: [],
    excludedParticipantIds: [],
    blockedParticipantIds: [],
    createdBy: userId,
  }
}
