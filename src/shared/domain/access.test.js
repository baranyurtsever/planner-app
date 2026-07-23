import { describe, expect, it } from 'vitest'
import {
  canEditExpense,
  canCreatePersonalPlanItem,
  canDirectEditPlanItem,
  canManageTrip,
  canProposePlanChange,
  canViewExpense,
  canViewPlanItem,
  canViewTrip,
} from './access'

const trip = {
  ownerId: 'owner',
  memberRoles: {
    owner: 'owner',
    editor: 'editor',
    viewer: 'viewer',
  },
  visibility: 'profile',
  status: 'active',
}

describe('trip access', () => {
  it('lets only the owner manage trip membership and lifecycle', () => {
    expect(canManageTrip(trip, 'owner')).toBe(true)
    expect(canManageTrip(trip, 'editor')).toBe(false)
    expect(canManageTrip(trip, 'viewer')).toBe(false)
  })

  it('lets only owners directly edit shared plan items', () => {
    const item = { scope: 'shared' }
    expect(canDirectEditPlanItem(trip, item, 'owner')).toBe(true)
    expect(canDirectEditPlanItem(trip, item, 'editor')).toBe(false)
    expect(canProposePlanChange(trip, item, 'editor')).toBe(true)
    expect(canProposePlanChange(trip, item, 'viewer')).toBe(false)
  })

  it('lets every participant create and manage only their own personal items', () => {
    expect(canCreatePersonalPlanItem(trip, 'viewer')).toBe(true)
    expect(canDirectEditPlanItem(trip, { scope: 'personal', ownerId: 'viewer' }, 'viewer')).toBe(true)
    expect(canDirectEditPlanItem(trip, { scope: 'personal', ownerId: 'viewer' }, 'owner')).toBe(false)
  })

  it('lets anonymous profile visitors see only public trips and plan items', () => {
    expect(canViewTrip(trip, null)).toBe(true)
    expect(canViewPlanItem(trip, { visibility: 'profile' }, null)).toBe(true)
    expect(canViewPlanItem(trip, { visibility: 'trip' }, null)).toBe(false)
    expect(canViewPlanItem({ ...trip, visibility: 'private' }, { visibility: 'profile' }, null)).toBe(false)
    expect(canViewPlanItem(trip, { scope: 'personal', ownerId: 'viewer', visibility: 'private' }, 'editor')).toBe(false)
  })
})

describe('expense access', () => {
  const expense = { ownerId: 'viewer', visibility: 'private' }

  it('never transfers edit rights when visibility changes', () => {
    expect(canEditExpense(expense, 'viewer')).toBe(true)
    expect(canEditExpense({ ...expense, visibility: 'profile' }, 'owner')).toBe(false)
  })

  it('supports private, trip, and profile visibility', () => {
    expect(canViewExpense(trip, expense, 'viewer')).toBe(true)
    expect(canViewExpense(trip, expense, 'editor')).toBe(false)
    expect(canViewExpense(trip, { ...expense, visibility: 'trip' }, 'editor')).toBe(true)
    expect(canViewExpense(trip, { ...expense, visibility: 'profile' }, null)).toBe(true)
    expect(canViewExpense({ ...trip, visibility: 'private' }, { ...expense, visibility: 'profile' }, null)).toBe(false)
  })
})
