import { describe, expect, it, vi } from 'vitest'
import { changedPlanContentPatch } from './planRepository'

vi.mock('../../../infrastructure/firebase/firestoreClient', () => ({ db: {} }))

const original = {
  scope: 'personal',
  ownerId: 'owner',
  title: 'Eski başlık',
  category: 'activity',
  status: 'todo',
  visibility: 'trip',
  notes: '',
  location: { name: '', mapUrl: '', lat: null, lng: null },
  time: { kind: 'date', localDate: '2026-09-12' },
  participantIds: ['owner', 'viewer'],
  excludedParticipantIds: [],
  blockedParticipantIds: [],
}

describe('changedPlanContentPatch', () => {
  it('keeps concurrent participation state out of a stale editor patch', () => {
    const staleEditorValue = {
      ...original,
      title: 'Yeni başlık',
      participantIds: ['owner'],
      blockedParticipantIds: ['viewer'],
    }

    expect(changedPlanContentPatch(original, staleEditorValue, 'owner')).toEqual({
      title: 'Yeni başlık',
    })
  })
})
