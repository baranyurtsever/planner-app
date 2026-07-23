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

export function normalizedPlanScope(item) {
  return item?.scope === PLAN_SCOPES.PERSONAL ? PLAN_SCOPES.PERSONAL : PLAN_SCOPES.SHARED
}
