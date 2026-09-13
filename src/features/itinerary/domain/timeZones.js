const fallbackTimeZones = [
  'UTC',
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Bangkok',
  'Asia/Tokyo',
  'America/New_York',
  'America/Los_Angeles',
]

function utcOffsetLabel(timeZone, date = new Date()) {
  const zoneName = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value || 'GMT'

  if (zoneName === 'GMT') return 'UTC+00:00'
  const match = zoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/)
  if (!match) return zoneName.replace('GMT', 'UTC')
  const [, sign, hours, minutes = '00'] = match
  return `UTC${sign}${hours.padStart(2, '0')}:${minutes}`
}

function timeZoneSortValue(timeZone, date) {
  const label = utcOffsetLabel(timeZone, date)
  const match = label.match(/^UTC([+-])(\d{2}):(\d{2})$/)
  if (!match) return 0
  const [, sign, hours, minutes] = match
  return (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes))
}

export function createTimeZoneOptions(date = new Date()) {
  const supported = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : fallbackTimeZones
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const timeZones = Array.from(new Set(['UTC', localTimeZone, ...supported]))

  return timeZones
    .map((value) => ({ value, label: `${utcOffsetLabel(value, date)} — ${value}` }))
    .sort((left, right) =>
      timeZoneSortValue(left.value, date) - timeZoneSortValue(right.value, date) ||
      left.value.localeCompare(right.value),
    )
}
