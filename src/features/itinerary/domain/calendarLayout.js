import { zonedLocalToUtc } from './planTime'

export const CALENDAR_SNAP_MINUTES = 15
export const CALENDAR_ROW_HEIGHT = 64

export function snapCalendarMinute(value) {
  const snapped = Math.round(Number(value) / CALENDAR_SNAP_MINUTES) * CALENDAR_SNAP_MINUTES
  return Math.max(0, Math.min(24 * 60 - CALENDAR_SNAP_MINUTES, snapped))
}

function overlaps(left, right) {
  return left.startMinute < right.endMinute && right.startMinute < left.endMinute
}

function layoutCluster(cluster) {
  const columns = []
  const placements = new Map()

  for (const item of cluster) {
    let column = columns.findIndex((items) => items.every((candidate) => !overlaps(item, candidate)))
    if (column === -1) {
      column = columns.length
      columns.push([])
    }
    columns[column].push(item)
    placements.set(item.id, { column })
  }

  const columnCount = columns.length
  for (const item of cluster) {
    const placement = placements.get(item.id)
    let columnSpan = 1
    for (let column = placement.column + 1; column < columnCount; column += 1) {
      if (columns[column].some((candidate) => overlaps(item, candidate))) break
      columnSpan += 1
    }
    placements.set(item.id, {
      column: placement.column,
      columnCount,
      columnSpan,
      leftPercent: (placement.column / columnCount) * 100,
      widthPercent: (columnSpan / columnCount) * 100,
    })
  }

  return placements
}

export function layoutOverlappingItems(items) {
  const sorted = [...items].sort((left, right) =>
    left.startMinute - right.startMinute ||
    left.endMinute - right.endMinute ||
    left.id.localeCompare(right.id),
  )
  const clusters = []
  let cluster = []
  let clusterEnd = -1

  for (const item of sorted) {
    if (cluster.length && item.startMinute >= clusterEnd) {
      clusters.push(cluster)
      cluster = []
      clusterEnd = -1
    }
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.endMinute)
  }
  if (cluster.length) clusters.push(cluster)

  return Object.fromEntries(
    clusters.flatMap((itemsInCluster) => [...layoutCluster(itemsInCluster).entries()]),
  )
}

export function moveTimedPlan(time, { localDate, startMinute }) {
  const snappedStart = snapCalendarMinute(startMinute)
  const hours = String(Math.floor(snappedStart / 60)).padStart(2, '0')
  const minutes = String(snappedStart % 60).padStart(2, '0')
  const startsAt = zonedLocalToUtc(`${localDate}T${hours}:${minutes}`, time.startTimeZone)
  const duration = Date.parse(time.endsAt) - Date.parse(time.startsAt)
  return {
    ...time,
    startsAt,
    endsAt: new Date(Date.parse(startsAt) + duration).toISOString(),
  }
}

export function resizeTimedPlan(time, { edge, localDate, minute }) {
  const snappedMinute = snapCalendarMinute(minute)
  const hours = String(Math.floor(snappedMinute / 60)).padStart(2, '0')
  const minutes = String(snappedMinute % 60).padStart(2, '0')
  const timeZone = edge === 'start' ? time.startTimeZone : time.endTimeZone
  const instant = zonedLocalToUtc(`${localDate}T${hours}:${minutes}`, timeZone)
  const minimumDuration = CALENDAR_SNAP_MINUTES * 60 * 1000

  if (edge === 'start') {
    const latestStart = Date.parse(time.endsAt) - minimumDuration
    return { ...time, startsAt: new Date(Math.min(Date.parse(instant), latestStart)).toISOString() }
  }

  const earliestEnd = Date.parse(time.startsAt) + minimumDuration
  return { ...time, endsAt: new Date(Math.max(Date.parse(instant), earliestEnd)).toISOString() }
}
