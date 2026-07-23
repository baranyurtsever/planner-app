import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { canEditExpense } from '../../../shared/domain/access'
import {
  createExpense,
  removeExpense,
  subscribeToTripExpenses,
} from '../data/expenseRepository'

const initialForm = {
  title: '',
  amount: '',
  currency: 'TRY',
  visibility: 'private',
  kind: 'spent',
  category: 'general',
}

export function BudgetPage() {
  const { trip, user } = useOutletContext()
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

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

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await createExpense({ ...form, tripId: trip.id }, user.uid)
      setForm(initialForm)
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
            />
          </div>
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
          <button className="w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Bütçe kalemi ekle</button>
        </form>
        <div className="mt-4"><ErrorMessage message={error} /></div>
      </div>

      <div>
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
                {canEditExpense(expense, user.uid) && (
                  <button onClick={() => removeExpense(expense.id)} className="mt-1 text-xs font-bold text-rose-600">Sil</button>
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
