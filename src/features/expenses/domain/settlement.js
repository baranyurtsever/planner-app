export const COMMON_CURRENCIES = Object.freeze(['TRY', 'EUR', 'USD', 'GBP', 'THB', 'JPY', 'CHF', 'CAD', 'AUD'])

export function normalizeCurrency(value, fallback = 'TRY') {
  const currency = String(value || '').trim().toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : fallback
}

export function normalizeExpenseForWrite(expense, userId, trip) {
  const currency = normalizeCurrency(expense.currency)
  const settlementCurrency = normalizeCurrency(trip?.settlementCurrency, 'TRY')
  const canSplit = expense.kind === 'spent' && expense.visibility === 'trip'
  const memberIds = new Set(trip?.memberIds || [])
  const splitParticipantIds = canSplit
    ? [...new Set(expense.splitParticipantIds || [])].filter((id) => memberIds.has(id))
    : []
  const exchangeRate = currency === settlementCurrency ? 1 : Number(expense.exchangeRate)
  if (canSplit && splitParticipantIds.length === 0) throw new Error('Hesaplaşma için en az bir katılımcı seç.')
  if (canSplit && (!Number.isFinite(exchangeRate) || exchangeRate <= 0)) {
    throw new Error(`1 ${currency} için ${settlementCurrency} kurunu gir.`)
  }
  return {
    ...expense,
    title: expense.title.trim(),
    amount: Number(expense.amount),
    currency,
    ownerId: userId,
    splitParticipantIds,
    settlementCurrency,
    exchangeRate: canSplit ? exchangeRate : 1,
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateSettlement(expenses, memberIds, settlementCurrency = 'TRY') {
  const targetCurrency = normalizeCurrency(settlementCurrency)
  const balances = Object.fromEntries(memberIds.map((id) => [id, 0]))
  expenses.forEach((expense) => {
    if (expense.kind !== 'spent' || expense.visibility !== 'trip' || !expense.splitParticipantIds?.length) return
    if (normalizeCurrency(expense.settlementCurrency, targetCurrency) !== targetCurrency) return
    const participants = expense.splitParticipantIds.filter((id) => id in balances)
    if (!participants.length || !(expense.ownerId in balances)) return
    const converted = Number(expense.amount) * Number(expense.exchangeRate || 1)
    if (!Number.isFinite(converted) || converted <= 0) return
    const share = converted / participants.length
    balances[expense.ownerId] += converted
    participants.forEach((id) => { balances[id] -= share })
  })

  const creditors = Object.entries(balances).filter(([, value]) => value > 0.005).map(([id, value]) => ({ id, value }))
  const debtors = Object.entries(balances).filter(([, value]) => value < -0.005).map(([id, value]) => ({ id, value: -value }))
  const transfers = []
  let creditorIndex = 0
  let debtorIndex = 0
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const amount = Math.min(creditors[creditorIndex].value, debtors[debtorIndex].value)
    transfers.push({
      fromUserId: debtors[debtorIndex].id,
      toUserId: creditors[creditorIndex].id,
      amount: roundMoney(amount),
      currency: targetCurrency,
    })
    creditors[creditorIndex].value -= amount
    debtors[debtorIndex].value -= amount
    if (creditors[creditorIndex].value <= 0.005) creditorIndex += 1
    if (debtors[debtorIndex].value <= 0.005) debtorIndex += 1
  }
  return { balances: Object.fromEntries(Object.entries(balances).map(([id, value]) => [id, roundMoney(value)])), transfers }
}
