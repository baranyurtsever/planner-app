export const TRAVEL_MODES = Object.freeze([
  { value: 'none', label: 'Belirtilmedi', icon: '—' },
  { value: 'walk', label: 'Yürüyüş', icon: '🚶' },
  { value: 'transit', label: 'Toplu taşıma', icon: '🚇' },
  { value: 'drive', label: 'Araç / taksi', icon: '🚕' },
  { value: 'bike', label: 'Bisiklet', icon: '🚲' },
  { value: 'flight', label: 'Uçuş', icon: '✈️' },
  { value: 'other', label: 'Diğer', icon: '➜' },
])

export const TRAVEL_MODE_MAP = Object.freeze(
  Object.fromEntries(TRAVEL_MODES.map((mode) => [mode.value, mode])),
)

const VALID_MODES = new Set(TRAVEL_MODES.map((mode) => mode.value))

export function normalizeTravelFromPrevious(value) {
  const duration = Number(value?.durationMinutes)
  return {
    mode: VALID_MODES.has(value?.mode) ? value.mode : 'none',
    durationMinutes: Number.isFinite(duration) ? Math.max(0, Math.min(7 * 24 * 60, Math.round(duration))) : 0,
  }
}

export function formatTravelDuration(minutes) {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0))
  const hours = Math.floor(safeMinutes / 60)
  const remainder = safeMinutes % 60
  if (!hours) return `${remainder} dk`
  if (!remainder) return `${hours} sa`
  return `${hours} sa ${remainder} dk`
}

export function analyzeTravelGaps(items) {
  const timed = items
    .filter((item) => item.time?.kind === 'timed')
    .sort((left, right) => Date.parse(left.time.startsAt) - Date.parse(right.time.startsAt))
  const warnings = new Map()

  timed.forEach((item, index) => {
    if (index === 0) return
    const travel = normalizeTravelFromPrevious(item.travelFromPrevious)
    if (!travel.durationMinutes) return
    const previous = timed[index - 1]
    const availableMinutes = Math.floor((Date.parse(item.time.startsAt) - Date.parse(previous.time.endsAt)) / 60_000)
    if (availableMinutes >= travel.durationMinutes) return
    warnings.set(item.id, {
      item,
      previous,
      availableMinutes,
      requiredMinutes: travel.durationMinutes,
      shortageMinutes: travel.durationMinutes - availableMinutes,
      kind: availableMinutes < 0 ? 'overlap' : 'tight',
    })
  })

  return warnings
}
