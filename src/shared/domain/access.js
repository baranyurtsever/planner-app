export const TRIP_ROLES = Object.freeze({
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
})

export const VISIBILITY = Object.freeze({
  PRIVATE: 'private',
  TRIP: 'trip',
  PROFILE: 'profile',
})

export const PLAN_SCOPE = Object.freeze({
  SHARED: 'shared',
  PERSONAL: 'personal',
})

export function tripRole(trip, userId) {
  if (!trip || !userId) return null
  if (trip.ownerId === userId) return TRIP_ROLES.OWNER
  return trip.memberRoles?.[userId] ?? null
}

export function isTripParticipant(trip, userId) {
  return tripRole(trip, userId) !== null
}

export function canManageTrip(trip, userId) {
  return trip?.status !== 'archived' && tripRole(trip, userId) === TRIP_ROLES.OWNER
}

export function canEditPlanItem(trip, userId) {
  if (trip?.status === 'archived') return false
  const role = tripRole(trip, userId)
  return role === TRIP_ROLES.OWNER || role === TRIP_ROLES.EDITOR
}

export function canCreatePersonalPlanItem(trip, userId) {
  return trip?.status !== 'archived' && isTripParticipant(trip, userId)
}

export function canDirectEditPlanItem(trip, planItem, userId) {
  if (trip?.status === 'archived' || !planItem || !userId) return false
  const scope = planItem.scope || PLAN_SCOPE.SHARED
  if (scope === PLAN_SCOPE.PERSONAL) return planItem.ownerId === userId
  return tripRole(trip, userId) === TRIP_ROLES.OWNER
}

export function canProposePlanChange(trip, planItem, userId) {
  if (trip?.status === 'archived' || !planItem) return false
  const scope = planItem.scope || PLAN_SCOPE.SHARED
  return scope === PLAN_SCOPE.SHARED && tripRole(trip, userId) === TRIP_ROLES.EDITOR
}

export function canViewTrip(trip, userId) {
  if (!trip) return false
  if (isTripParticipant(trip, userId)) return true
  return trip.status !== 'archived' && trip.visibility === VISIBILITY.PROFILE
}

export function canViewPlanItem(trip, planItem, userId) {
  if (!canViewTrip(trip, userId)) return false
  if (
    (planItem?.scope || PLAN_SCOPE.SHARED) === PLAN_SCOPE.PERSONAL &&
    planItem?.visibility === VISIBILITY.PRIVATE
  ) {
    return planItem.ownerId === userId
  }
  if (isTripParticipant(trip, userId)) return true
  return planItem?.visibility === VISIBILITY.PROFILE
}

export function canEditExpense(expense, userId) {
  return Boolean(userId && expense?.ownerId === userId)
}

export function canViewExpense(trip, expense, userId) {
  if (!trip || !expense) return false
  if (canEditExpense(expense, userId)) return true
  if (!canViewTrip(trip, userId)) return false
  if (isTripParticipant(trip, userId)) {
    return expense.visibility === VISIBILITY.TRIP || expense.visibility === VISIBILITY.PROFILE
  }
  return expense.visibility === VISIBILITY.PROFILE
}
