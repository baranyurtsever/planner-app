import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { subscribeToPlanItems } from '../data/planRepository'
import { formatPlanTime } from '../domain/planTime'
import { moveWeek, planItemDate, weekDates } from '../domain/calendar'

const today = () => new Date().toISOString().slice(0, 10)

export function CalendarPage() {
  const { trip } = useOutletContext()
  const [anchor, setAnchor] = useState(today)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const days = useMemo(() => weekDates(anchor), [anchor])

  useEffect(
    () => subscribeToPlanItems(trip.id, setItems, (nextError) => setError(nextError.message)),
    [trip.id],
  )

  const itemsByDate = useMemo(() => items.reduce((groups, item) => {
    const date = planItemDate(item)
    groups[date] = [...(groups[date] || []), item]
    return groups
  }, {}), [items])

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Ortak plan</p>
          <h2 className="mt-2 text-3xl font-black">Haftalık Takvim</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAnchor(moveWeek(anchor, -1))} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold">←</button>
          <button onClick={() => setAnchor(today())} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold">Bugün</button>
          <button onClick={() => setAnchor(moveWeek(anchor, 1))} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold">→</button>
        </div>
      </div>
      <div className="mt-4"><ErrorMessage message={error} /></div>

      <div className="mt-6 overflow-x-auto pb-3">
        <div className="grid min-w-[980px] grid-cols-7 gap-3">
          {days.map((date) => (
            <section key={date} className={`min-h-[420px] rounded-2xl border p-3 ${date === today() ? 'border-teal-400 bg-teal-50/40' : 'border-slate-200 bg-white'}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' })}
              </p>
              <p className="mt-1 text-lg font-black">{new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
              <div className="mt-4 space-y-2">
                {(itemsByDate[date] || []).map((item) => {
                  const display = formatPlanTime(item.time)
                  return (
                    <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <p className="text-xs font-bold text-teal-700">{item.time.kind === 'date' ? 'Tüm gün' : display.start.split(',').pop()}</p>
                      <h3 className="mt-1 text-sm font-black">{item.title}</h3>
                      {item.location?.name && <p className="mt-1 text-xs text-slate-500">{item.location.name}</p>}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      {!items.length && <EmptyState title="Takvim boş" description="Liste sekmesinden ilk Plan Öğesini ekle." />}
    </section>
  )
}
