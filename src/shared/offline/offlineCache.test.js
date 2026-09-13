import { beforeEach, describe, expect, it } from 'vitest'
import { cachePlansForOffline, cacheTripForOffline, clearOfflineUserCache, getOfflinePlans, getOfflineTrip } from './offlineCache'

describe('user-scoped offline cache', () => {
  beforeEach(() => {
    const values = new Map()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key) => values.get(key) ?? null,
        setItem(key, value) { values.set(key, String(value)); this[key] = String(value) },
        removeItem(key) { values.delete(key); delete this[key] },
        clear: () => values.clear(),
      },
    })
  })

  it('separates users and removes private details from cached plans', () => {
    cacheTripForOffline({
      id: 'trip', name: 'Bangkok', memberIds: ['owner', 'viewer'],
      memberRoles: { owner: 'owner', viewer: 'viewer' }, ownerId: 'owner', status: 'active', visibility: 'private',
    }, 'owner')
    cachePlansForOffline('trip', 'owner', [{
      id: 'plan', title: 'Uçuş', category: 'flight', status: 'todo', scope: 'shared', visibility: 'trip',
      notes: 'Gizli not', participantIds: [], excludedParticipantIds: [], location: { name: 'IST', mapUrl: '' },
      time: { kind: 'date', localDate: '2026-09-13' },
    }])

    expect(getOfflineTrip('viewer', 'trip')).toBeNull()
    expect(getOfflinePlans('owner', 'trip')[0]).not.toHaveProperty('notes')
    expect(getOfflineTrip('owner', 'trip').memberIds).toEqual(['owner'])
    clearOfflineUserCache('owner')
    expect(getOfflineTrip('owner', 'trip')).toBeNull()
  })
})
