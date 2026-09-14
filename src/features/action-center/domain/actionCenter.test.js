import { describe, expect, it } from 'vitest'
import { pendingActionCount, upcomingPlans } from './actionCenter'

describe('action center', () => {
  it('counts only records waiting for an action', () => {
    expect(pendingActionCount({
      invitations: [{}], friendRequests: [{}, {}], proposalsByTrip: { a: [{}] }, requestsByTrip: { a: [{}] },
    })).toBe(5)
  })

  it('orders plans in the next seven local days across trips', () => {
    const plans = upcomingPlans({
      a: [{ id: 'later', time: { kind: 'date', localDate: '2026-09-17' } }],
      b: [{ id: 'first', time: { kind: 'timed', startsAt: '2026-09-15T08:00:00.000Z' } }],
    }, [{ id: 'a', name: 'Roma' }, { id: 'b', name: 'Paris' }], new Date('2026-09-14T10:00:00'))
    expect(plans.map((item) => [item.id, item.tripName])).toEqual([['first', 'Paris'], ['later', 'Roma']])
  })
})
