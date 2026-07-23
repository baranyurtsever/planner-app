import { describe, expect, it } from 'vitest'
import {
  canEditExpense,
  canEditPlanItem,
  canManageTrip,
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

  it('lets owners and editors edit shared plan items', () => {
    expect(canEditPlanItem(trip, 'owner')).toBe(true)
    expect(canEditPlanItem(trip, 'editor')).toBe(true)
    expect(canEditPlanItem(trip, 'viewer')).toBe(false)
  })

  it('lets anonymous profile visitors see only public trips and plan items', () => {
    expect(canViewTrip(trip, null)).toBe(true)
    expect(canViewPlanItem(trip, { visibility: 'profile' }, null)).toBe(true)
    expect(canViewPlanItem(trip, { visibility: 'trip' }, null)).toBe(false)
    expect(canViewPlanItem({ ...trip, visibility: 'private' }, { visibility: 'profile' }, null)).toBe(false)
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
