import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import {
  createPreparationItem,
  removePreparationItem,
  subscribeToPreparationItems,
  togglePreparationItem,
} from '../data/preparationRepository'

export function PreparationPage() {
  const { trip, user } = useOutletContext()
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [error, setError] = useState('')

  useEffect(
    () => subscribeToPreparationItems(trip.id, user.uid, setItems, (subscriptionError) => setError(subscriptionError.message)),
    [trip.id, user.uid],
  )

  async function submit(event) {
    event.preventDefault()
    try {
      await createPreparationItem({ tripId: trip.id, text, category }, user.uid)
      setText('')
    } catch (createError) {
      setError(createError.message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Yalnızca sana ait</p>
      <h2 className="mt-2 text-3xl font-black">Hazırlık Öğeleri</h2>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
        <input
          required
          aria-label="Hazırlık öğesi"
          placeholder="Pasaportu kontrol et"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3"
        />
        <select
          aria-label="Hazırlık kategorisi"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          <option value="general">Genel</option>
          <option value="document">Belge</option>
          <option value="luggage">Valiz</option>
          <option value="health">Sağlık</option>
        </select>
        <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Ekle</button>
      </form>
      <div className="mt-4"><ErrorMessage message={error} /></div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => togglePreparationItem(item)}
              className="h-5 w-5 accent-teal-700"
            />
            <div className="flex-1">
              <p className={item.completed ? 'text-slate-400 line-through' : 'font-semibold'}>{item.text}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{item.category}</p>
            </div>
            <button onClick={() => removePreparationItem(item.id)} className="text-sm font-bold text-rose-600">Sil</button>
          </article>
        ))}
        {!items.length && <EmptyState title="Liste boş" description="Hazırlıkların yalnızca sana görünür." />}
      </div>
    </div>
  )
}
