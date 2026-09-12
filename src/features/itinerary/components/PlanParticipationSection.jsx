import { useEffect, useMemo, useState } from 'react'
import { createExpense, removeExpense, subscribeToTripExpenses } from '../../expenses/data/expenseRepository'
import { normalizedPlanScope } from '../domain/planItem'
import {
  decideParticipationRequest,
  includePlanParticipant,
  isPlanParticipant,
  leavePlanItem,
  requestPlanParticipation,
  saveOwnPlanDetails,
  subscribeToOwnPlanDetails,
  subscribeToParticipationRequests,
} from '../data/planParticipationRepository'

const leaveWarning = 'Bu Plan Öğesinden ayrılırsan bu öğeye bağlı kişisel harcamaların, notların ve bağlantıların kalıcı olarak silinecek. Kendin yeniden katılamazsın; yalnız Gezi Sahibi seni tekrar dahil edebilir.'

export function PlanParticipationSection({ trip, item, user }) {
  const [requests, setRequests] = useState([])
  const [details, setDetails] = useState({ note: '', links: [] })
  const [expenses, setExpenses] = useState([])
  const [memberId, setMemberId] = useState('')
  const [expense, setExpense] = useState({ title: '', amount: '', currency: 'TRY', visibility: 'private' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const scope = normalizedPlanScope(item)
  const participating = isPlanParticipant(item, user.uid)
  const participants = scope === 'shared'
    ? trip.memberIds.filter((id) => !(item.excludedParticipantIds || []).includes(id))
    : (item.participantIds || [])
  const leftParticipants = useMemo(() => Array.from(new Set([
    ...(item.excludedParticipantIds || []),
    ...(item.blockedParticipantIds || []),
  ])), [item.blockedParticipantIds, item.excludedParticipantIds])

  useEffect(
    () => subscribeToParticipationRequests(
      trip.id,
      (allRequests) => setRequests(allRequests.filter((request) => request.planItemId === item.id)),
      (nextError) => setError(nextError.message),
    ),
    [item.id, trip.id],
  )
  useEffect(() => {
    if (!participating) return undefined
    return subscribeToOwnPlanDetails(
      trip.id,
      item.id,
      user.uid,
      setDetails,
      (nextError) => setError(nextError.message),
    )
  }, [item.id, participating, trip.id, user.uid])
  useEffect(
    () => subscribeToTripExpenses(
      trip.id,
      user.uid,
      (allExpenses) => setExpenses(allExpenses.filter(
        (candidate) => candidate.ownerId === user.uid && candidate.planItemId === item.id,
      )),
      (nextError) => setError(nextError.message),
    ),
    [item.id, trip.id, user.uid],
  )

  async function run(action, successMessage) {
    setError('')
    try {
      await action()
      setMessage(successMessage)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function addExpense(event) {
    event.preventDefault()
    await run(
      () => createExpense({
        ...expense,
        amount: Number(expense.amount),
        tripId: trip.id,
        planItemId: item.id,
        kind: 'spent',
        category: item.category || 'general',
      }, user.uid),
      'Harcama bu karta bağlandı.',
    )
    setExpense({ title: '', amount: '', currency: 'TRY', visibility: 'private' })
  }

  const canRequest = scope === 'personal' &&
    item.ownerId !== user.uid &&
    !participating &&
    item.visibility !== 'private' &&
    !(item.blockedParticipantIds || []).includes(user.uid)
  const canAddParticipant = scope === 'personal' && item.ownerId === user.uid

  return (
    <section className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <h3 className="text-lg font-black">Katılım ve kişisel bilgiler</h3>
      <p className="mt-1 text-xs text-slate-500">Katılımcı kimlikleri yalnız gezi içinde görünür.</p>
      {error && <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
      {message && <p className="mt-3 text-sm font-semibold text-teal-700">{message}</p>}

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-black">Katılımcılar ({participants.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {participants.map((id) => <span key={id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{id}</span>)}
          </div>
          {canAddParticipant && (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                run(() => includePlanParticipant(trip.id, item.id, memberId.trim()), 'Katılımcı eklendi.')
                setMemberId('')
              }}
              className="mt-4 flex gap-2"
            >
              <input required value={memberId} onChange={(event) => setMemberId(event.target.value)} placeholder="Katılımcı kullanıcı kimliği" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">Ekle</button>
            </form>
          )}
          {canRequest && (
            <button type="button" onClick={() => run(() => requestPlanParticipation(trip.id, item, user.uid), 'Katılım isteği gönderildi.')} className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white">
              Katılım isteği gönder
            </button>
          )}
          {participating && !(scope === 'personal' && item.ownerId === user.uid) && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(leaveWarning)) run(() => leavePlanItem(trip.id, item, user.uid), 'Plan Öğesinden ayrıldın.')
              }}
              className="mt-4 block text-xs font-bold text-rose-700"
            >
              Bu plandan ayrıl
            </button>
          )}
          {trip.ownerId === user.uid && leftParticipants.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-500">Yalnız Gezi Sahibi yeniden dahil edebilir</p>
              {leftParticipants.map((id) => (
                <button type="button" key={id} onClick={() => run(() => includePlanParticipant(trip.id, item.id, id), `${id} yeniden dahil edildi.`)} className="mt-2 mr-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-bold">
                  {id} dahil et
                </button>
              ))}
            </div>
          )}
        </div>

        {item.ownerId === user.uid && requests.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black">Katılım istekleri</p>
            {requests.map((request) => (
              <div key={request.id} className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold">{request.requesterId}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => run(() => decideParticipationRequest(trip.id, item, request, 'approved', user.uid), 'İstek kabul edildi.')} className="text-xs font-bold text-teal-700">Kabul</button>
                  <button type="button" onClick={() => run(() => decideParticipationRequest(trip.id, item, request, 'rejected', user.uid), 'İstek reddedildi.')} className="text-xs font-bold text-rose-700">Reddet</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {participating && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              run(() => saveOwnPlanDetails(trip.id, item.id, user.uid, details), 'Kişisel bilgiler kaydedildi.')
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-black">Yalnız sana ait not ve bağlantılar</p>
            <textarea value={details.note || ''} onChange={(event) => setDetails({ ...details, note: event.target.value })} placeholder="Kişisel not" className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm" />
            <textarea
              value={(details.links || []).join('\n')}
              onChange={(event) => setDetails({ ...details, links: event.target.value.split('\n') })}
              placeholder="Her satıra bir bağlantı"
              className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
            <button type="submit" className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Kişisel bilgileri kaydet</button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-black">Bu karta bağlı harcamaların</p>
            <form onSubmit={addExpense} className="mt-3 grid grid-cols-[1fr_90px] gap-2">
              <input required value={expense.title} onChange={(event) => setExpense({ ...expense, title: event.target.value })} placeholder="Harcama" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input required type="number" min="0" step="0.01" value={expense.amount} onChange={(event) => setExpense({ ...expense, amount: event.target.value })} placeholder="Tutar" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <select value={expense.visibility} onChange={(event) => setExpense({ ...expense, visibility: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="private">Yalnızca ben</option>
                <option value="trip">Gezi katılımcıları</option>
                <option value="profile">Profilde açık</option>
              </select>
              <button type="submit" className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Ekle</button>
            </form>
            <div className="mt-3 space-y-2">
              {expenses.map((linkedExpense) => (
                <div key={linkedExpense.id} className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <span>{linkedExpense.title}</span>
                  <span className="font-bold">{Number(linkedExpense.amount).toLocaleString('tr-TR')} {linkedExpense.currency} <button type="button" onClick={() => removeExpense(linkedExpense.id)} className="ml-2 text-rose-600">Sil</button></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
