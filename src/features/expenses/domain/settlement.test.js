import { describe, expect, it } from 'vitest'
import { calculateSettlement, normalizeExpenseForWrite } from './settlement'

describe('expense settlement', () => {
  const trip = { memberIds: ['ada', 'berk', 'cem'], settlementCurrency: 'EUR' }

  it('freezes the entered conversion rate and participant set', () => {
    expect(normalizeExpenseForWrite({
      title: 'Akşam yemeği', amount: '1200', currency: 'TRY', kind: 'spent', visibility: 'trip',
      exchangeRate: '0.02', splitParticipantIds: ['ada', 'berk', 'outsider'],
    }, 'ada', trip)).toMatchObject({
      amount: 1200, currency: 'TRY', ownerId: 'ada', settlementCurrency: 'EUR', exchangeRate: 0.02,
      splitParticipantIds: ['ada', 'berk'],
    })
  })

  it('keeps private and profile expenses out of identity-bearing settlement data', () => {
    expect(normalizeExpenseForWrite({
      title: 'Bilet', amount: 20, currency: 'EUR', kind: 'spent', visibility: 'profile',
      splitParticipantIds: ['ada', 'berk'],
    }, 'ada', trip).splitParticipantIds).toEqual([])
  })

  it('reduces equal shares to who should pay whom', () => {
    const result = calculateSettlement([{
      ownerId: 'ada', amount: 90, kind: 'spent', visibility: 'trip', exchangeRate: 1,
      splitParticipantIds: ['ada', 'berk', 'cem'],
    }], trip.memberIds, 'EUR')
    expect(result.balances).toEqual({ ada: 60, berk: -30, cem: -30 })
    expect(result.transfers).toEqual([
      { fromUserId: 'berk', toUserId: 'ada', amount: 30, currency: 'EUR' },
      { fromUserId: 'cem', toUserId: 'ada', amount: 30, currency: 'EUR' },
    ])
  })
})
