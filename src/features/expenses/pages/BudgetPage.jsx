import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { canEditExpense } from '../../../shared/domain/access'
import { ProfileIdentity } from '../../profile/components/ProfileIdentity'
import { useProfilesById } from '../../profile/hooks/useProfilesById'
import {
  createExpense,
  removeExpense,
  subscribeToTripExpenses,
  updateExpense,
} from '../data/expenseRepository'
import { calculateSettlement, COMMON_CURRENCIES } from '../domain/settlement'

function emptyForm(trip) {
  return {
  title: '',
  amount: '',
  currency: 'TRY',
  visibility: 'private',
  kind: 'spent',
  category: 'general',
  splitParticipantIds: [...trip.memberIds],
  exchangeRate: '1',
  }
}

export function BudgetPage() {
  const { trip, user } = useOutletContext()
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(() => emptyForm(trip))
  const [error, setError] = useState('')
  const profilesById = useProfilesById(trip.memberIds)
  const settlementCurrency = trip.settlementCurrency || 'TRY'

  useEffect(
    () => subscribeToTripExpenses(trip.id, user.uid, setExpenses, (subscriptionError) => setError(subscriptionError.message)),
    [trip.id, user.uid],
  )

  const totals = useMemo(() => Object.entries(expenses.reduce((sum, expense) => {
    const currency = expense.currency
    const kind = ['planned', 'spent', 'income'].includes(expense.kind) ? expense.kind : 'spent'
    sum[currency] ||= { planned: 0, spent: 0, income: 0 }
    sum[currency][kind] += Number(expense.amount)
    return sum
  }, {})), [expenses])
  const settlements = useMemo(
    () => [...new Set([
      settlementCurrency,
      ...expenses.filter((expense) => expense.splitParticipantIds?.length).map((expense) => expense.settlementCurrency).filter(Boolean),
    ])].map((currency) => ({
      currency,
      ...calculateSettlement(expenses, trip.memberIds, currency),
    })),
    [expenses, settlementCurrency, trip.memberIds],
  )
  const canSplit = form.kind === 'spent' && form.visibility === 'trip'

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      if (form.id) {
        const { id, ...changes } = form
        await updateExpense(id, changes, user.uid, trip)
      } else {
        await createExpense({ ...form, tripId: trip.id }, user.uid, trip)
      }
      setForm(emptyForm(trip))
    } catch (createError) {
      setError(createError.message)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Kullanıcıya ait</p>
        <h2 className="mt-2 text-3xl font-black">Harcamalar</h2>
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <input
            required
            aria-label="Harcama başlığı"
            placeholder="Harcama başlığı"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <input
              required
              min="0"
              step="0.01"
              type="number"
              aria-label="Tutar"
              placeholder="Tutar"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <input
              required
              aria-label="Para birimi"
              value={form.currency}
              onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })}
              className="rounded-xl border border-slate-200 px-4 py-3"
              list="expense-currencies"
            />
          </div>
          <datalist id="expense-currencies">{COMMON_CURRENCIES.map((currency) => <option key={currency} value={currency} />)}</datalist>
          <div className="grid grid-cols-2 gap-3">
            <select
              aria-label="Bütçe kalemi türü"
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="planned">Planlanan</option>
              <option value="spent">Harcanan</option>
              <option value="income">Gelir</option>
            </select>
            <select
              aria-label="Bütçe kategorisi"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="general">Genel</option>
              <option value="transport">Ulaşım</option>
              <option value="stay">Konaklama</option>
              <option value="food">Yeme içme</option>
              <option value="activity">Etkinlik</option>
              <option value="shopping">Alışveriş</option>
            </select>
          </div>
          <select
            aria-label="Harcama görünürlüğü"
            value={form.visibility}
            onChange={(event) => setForm({ ...form, visibility: event.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="private">Yalnızca ben</option>
            <option value="trip">Gezi katılımcıları</option>
            <option value="profile">Profili görüntüleyen herkes</option>
          </select>
          {canSplit && (
            <fieldset className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
              <legend className="px-1 text-sm font-black text-teal-950">Hesaplaşma katılımcıları</legend>
              <p className="mb-3 text-xs text-teal-800">Tutar seçilen kişiler arasında eşit bölünür. Ödemeyi Harcama Sahibi yapmış sayılır.</p>
              <div className="space-y-2">
                {trip.memberIds.map((memberId) => (
                  <label key={memberId} className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={form.splitParticipantIds.includes(memberId)} onChange={(event) => setForm({
                      ...form,
                      splitParticipantIds: event.target.checked
                        ? [...new Set([...form.splitParticipantIds, memberId])]
                        : form.splitParticipantIds.filter((id) => id !== memberId),
                    })} />
                    <ProfileIdentity profile={profilesById[memberId]} compact />
                  </label>
                ))}
              </div>
              {form.currency !== settlementCurrency && (
                <label className="mt-4 block text-sm font-semibold text-slate-600">
                  1 {form.currency || '—'} kaç {settlementCurrency}?
                  <input required min="0.000001" step="any" type="number" aria-label="Dönüşüm kuru" value={form.exchangeRate} onChange={(event) => setForm({ ...form, exchangeRate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3" />
                  <span className="mt-1 block text-xs font-normal text-slate-500">Bu kur Harcamaya kaydedilir ve sonradan otomatik değişmez.</span>
                </label>
              )}
            </fieldset>
          )}
          <button className="w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">{form.id ? 'Bütçe kalemini güncelle' : 'Bütçe kalemi ekle'}</button>
          {form.id && <button type="button" onClick={() => setForm(emptyForm(trip))} className="w-full text-sm font-bold text-slate-500">Düzenlemeyi iptal et</button>}
        </form>
        <div className="mt-4"><ErrorMessage message={error} /></div>
      </div>

      <div>
        <section className="mb-5 rounded-3xl border border-teal-200 bg-teal-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Hesap kapatma</p>
          <h3 className="mt-2 text-xl font-black">Kim kime ne ödeyecek?</h3>
          <div className="mt-3 space-y-4">
            {settlements.map((settlement) => (
              <div key={settlement.currency}>
                <p className="mb-2 text-xs font-black text-teal-800">{settlement.currency}</p>
                <div className="space-y-2">
                  {settlement.transfers.map((transfer) => (
                    <div key={`${transfer.fromUserId}-${transfer.toUserId}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm">
                      <ProfileIdentity profile={profilesById[transfer.fromUserId]} compact />
                      <span className="text-slate-500">→</span>
                      <ProfileIdentity profile={profilesById[transfer.toUserId]} compact />
                      <strong className="ml-auto">{transfer.amount.toLocaleString('tr-TR')} {transfer.currency}</strong>
                    </div>
                  ))}
                  {!settlement.transfers.length && <p className="text-sm text-slate-500">Paylaştırılmış ortak harcama yok veya hesaplar dengede.</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-3 xl:grid-cols-2">
          {totals.map(([currency, values]) => (
            <div key={currency} className="rounded-2xl bg-amber-100 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">{currency}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500">Planlanan</p><p className="text-lg font-black">{values.planned.toLocaleString('tr-TR')}</p></div>
                <div><p className="text-slate-500">Harcanan</p><p className="text-lg font-black text-rose-700">{values.spent.toLocaleString('tr-TR')}</p></div>
                <div><p className="text-slate-500">Gelir</p><p className="text-lg font-black text-emerald-700">{values.income.toLocaleString('tr-TR')}</p></div>
                <div>
                  <p className="text-slate-500">Kalan</p>
                  <p className="text-lg font-black text-teal-800">
                    {(values.planned - values.spent + values.income).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {expenses.map((expense) => (
            <article key={expense.id} className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <h3 className="font-black">{expense.title}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {expense.kind === 'planned' ? 'Planlanan' : expense.kind === 'income' ? 'Gelir' : 'Harcanan'} · {expense.category || 'general'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {expense.visibility === 'private'
                    ? 'Yalnızca ben'
                    : expense.visibility === 'trip'
                      ? 'Gezi katılımcıları'
                      : 'Profili görüntüleyen herkes'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black">{Number(expense.amount).toLocaleString('tr-TR')} {expense.currency}</p>
                {expense.visibility === 'trip' && expense.kind === 'spent' && expense.splitParticipantIds?.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">{expense.splitParticipantIds.length} kişi · {(Number(expense.amount) * Number(expense.exchangeRate || 1)).toLocaleString('tr-TR')} {expense.settlementCurrency || settlementCurrency}</p>
                )}
                {canEditExpense(expense, user.uid) && (
                  <div className="mt-1 flex justify-end gap-3">
                    <button onClick={() => setForm({
                      id: expense.id,
                      title: expense.title,
                      amount: String(expense.amount),
                      currency: expense.currency,
                      visibility: expense.visibility,
                      kind: expense.kind || 'spent',
                      category: expense.category || 'general',
                      splitParticipantIds: expense.splitParticipantIds || [],
                      exchangeRate: String(expense.exchangeRate || 1),
                    })} className="text-xs font-bold text-teal-700">Düzenle</button>
                    <button onClick={() => removeExpense(expense.id)} className="text-xs font-bold text-rose-600">Sil</button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {!expenses.length && <EmptyState title="Harcama yok" description="İlk kişisel Harcamanı ekle." />}
        </div>
      </div>
    </div>
  )
}
