import { normalizeTravelFromPrevious } from './travel'

export const PLAN_SCOPES = Object.freeze({
  SHARED: 'shared',
  PERSONAL: 'personal',
})

export const PLAN_STATUSES = Object.freeze({
  TODO: 'todo',
  DONE: 'done',
  POSTPONED: 'postponed',
  CANCELLED: 'cancelled',
})

export const PLAN_CATEGORIES = Object.freeze([
  { value: 'flight', label: 'Uçuş', icon: '✈', color: 'indigo' },
  { value: 'stay', label: 'Konaklama', icon: '▣', color: 'purple' },
  { value: 'transport', label: 'Ulaşım', icon: '➜', color: 'sky' },
  { value: 'food', label: 'Yeme–İçme', icon: '●', color: 'rose' },
  { value: 'museum', label: 'Müze', icon: '◆', color: 'emerald' },
  { value: 'activity', label: 'Tur/Aktivite', icon: '✦', color: 'teal' },
  { value: 'entertainment', label: 'Eğlence', icon: '★', color: 'violet' },
  { value: 'shopping', label: 'Alışveriş', icon: '▱', color: 'amber' },
  { value: 'health', label: 'Sağlık', icon: '✚', color: 'red' },
  { value: 'other', label: 'Diğer', icon: '•', color: 'slate' },
])

export const PLAN_CATEGORY_MAP = Object.freeze(
  Object.fromEntries(PLAN_CATEGORIES.map((category) => [category.value, category])),
)
const PLAN_CATEGORY_VALUES = new Set(PLAN_CATEGORIES.map((category) => category.value))

export function normalizedPlanScope(item) {
  return item?.scope === PLAN_SCOPES.PERSONAL ? PLAN_SCOPES.PERSONAL : PLAN_SCOPES.SHARED
}

export function normalizePlanItemForWrite(planItem, userId) {
  const scope = normalizedPlanScope(planItem)
  const lat = Number(planItem.locationLat ?? planItem.location?.lat)
  const lng = Number(planItem.locationLng ?? planItem.location?.lng)
  const hasCoordinates =
    (planItem.locationLat ?? planItem.location?.lat ?? '') !== '' &&
    (planItem.locationLng ?? planItem.location?.lng ?? '') !== ''

  return {
    scope,
    ownerId: scope === PLAN_SCOPES.PERSONAL ? (planItem.ownerId || userId) : null,
    title: planItem.title.trim(),
    category: PLAN_CATEGORY_VALUES.has(planItem.category) ? planItem.category : 'other',
    status: planItem.status || PLAN_STATUSES.TODO,
    visibility: scope === PLAN_SCOPES.PERSONAL
      ? (planItem.visibility || 'private')
      : (planItem.visibility === 'profile' ? 'profile' : 'trip'),
    notes: planItem.notes?.trim() || '',
    location: {
      name: (planItem.locationName ?? planItem.location?.name ?? '').trim(),
      mapUrl: (planItem.mapUrl ?? planItem.location?.mapUrl ?? '').trim(),
      lat: hasCoordinates && Number.isFinite(lat) ? lat : null,
      lng: hasCoordinates && Number.isFinite(lng) ? lng : null,
    },
    travelFromPrevious: normalizeTravelFromPrevious(planItem.travelFromPrevious),
    time: planItem.time,
    participantMode: scope === PLAN_SCOPES.SHARED ? 'all' : 'selected',
    participantIds: scope === PLAN_SCOPES.PERSONAL
      ? Array.from(new Set([planItem.ownerId || userId, ...(planItem.participantIds || [])]))
      : [],
    excludedParticipantIds: planItem.excludedParticipantIds || [],
    blockedParticipantIds: planItem.blockedParticipantIds || [],
  }
}

export function publicPlanFields(planItem) {
  const normalized = normalizePlanItemForWrite(planItem, planItem.ownerId)
  return {
    scope: normalized.scope,
    title: normalized.title,
    category: normalized.category,
    status: normalized.status,
    visibility: 'profile',
    notes: normalized.notes,
    location: normalized.location,
    travelFromPrevious: normalized.travelFromPrevious,
    time: normalized.time,
  }
}
