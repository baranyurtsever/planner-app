function assertValidTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format()
  } catch {
    throw new Error(`Geçersiz saat dilimi: ${timeZone}`)
  }
}

function assertUtcInstant(value, fieldName) {
  if (typeof value !== 'string' || !value.endsWith('Z') || Number.isNaN(Date.parse(value))) {
    throw new Error(`${fieldName} geçerli bir UTC zamanı olmalıdır.`)
  }
}

export function createTimedPlanTime({ startsAt, endsAt, startTimeZone, endTimeZone }) {
  assertUtcInstant(startsAt, 'Başlangıç')
  assertUtcInstant(endsAt, 'Bitiş')
  assertValidTimeZone(startTimeZone)
  assertValidTimeZone(endTimeZone)

  if (Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new Error('Bitiş zamanı başlangıçtan sonra olmalıdır.')
  }

  return {
    kind: 'timed',
    startsAt,
    endsAt,
    startTimeZone,
    endTimeZone,
  }
}

export function createDateOnlyPlanTime(localDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new Error('Tarih YYYY-AA-GG biçiminde olmalıdır.')
  }
  const [year, month, day] = localDate.split('-').map(Number)
  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day) {
    throw new Error('Geçersiz takvim tarihi.')
  }

  return { kind: 'date', localDate }
}

export function zonedLocalToUtc(localDateTime, timeZone) {
  assertValidTimeZone(timeZone)
  const match = localDateTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!match) throw new Error('Yerel zaman YYYY-AA-GGTHH:DD biçiminde olmalıdır.')

  const [, year, month, day, hour, minute] = match.map(Number)
  const desiredWallClock = Date.UTC(year, month - 1, day, hour, minute)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  function offsetAt(instant) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(instant))
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    )
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    )
    return representedAsUtc - instant
  }

  const firstPass = desiredWallClock - offsetAt(desiredWallClock)
  const finalInstant = desiredWallClock - offsetAt(firstPass)
  const result = new Date(finalInstant).toISOString()
  if (utcToZonedLocal(result, timeZone) !== localDateTime) {
    throw new Error('Bu yerel saat seçilen saat diliminde bulunmuyor.')
  }
  return result
}

export function utcToZonedLocal(instant, timeZone) {
  assertUtcInstant(instant, 'Zaman')
  assertValidTimeZone(timeZone)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(instant))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

export function formatPlanTime(planTime, locale = 'tr-TR') {
  if (planTime.kind === 'date') {
    return { start: planTime.localDate, end: null }
  }

  const format = (instant, timeZone) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(new Date(instant))

  return {
    start: format(planTime.startsAt, planTime.startTimeZone),
    end: format(planTime.endsAt, planTime.endTimeZone),
  }
}

export function formatCalendarTimeLabel(planTime, locale = 'tr-TR') {
  if (planTime.kind !== 'timed') return ''
  const showZones = planTime.startTimeZone !== planTime.endTimeZone
  const formatEdge = (instant, timeZone) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        ...(showZones ? { timeZoneName: 'short' } : {}),
      }).formatToParts(new Date(instant)).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
    )
    return `${parts.hour}:${parts.minute}${parts.timeZoneName ? ` ${parts.timeZoneName}` : ''}`
  }
  return `${formatEdge(planTime.startsAt, planTime.startTimeZone)}–${formatEdge(planTime.endsAt, planTime.endTimeZone)}`
}
