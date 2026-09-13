import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { subscribeToPreparationItems } from '../../preparation/data/preparationRepository'
import { subscribeToPlanItems } from '../data/planRepository'
import { PLAN_CATEGORY_MAP } from '../domain/planItem'
import { formatPlanTime } from '../domain/planTime'
import { buildTodayView } from '../domain/todayView'
import { formatTravelDuration, TRAVEL_MODE_MAP } from '../domain/travel'

function PlanSummary({ item, prominent = false }) {
  const category = PLAN_CATEGORY_MAP[item.category] || PLAN_CATEGORY_MAP.other
  const time = formatPlanTime(item.time)
  return (
    <article className={`rounded-2xl border bg-white p-5 ${prominent ? 'border-teal-300 shadow-lg shadow-teal-900/5' : 'border-slate-200'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{category.icon} {category.label}</span>
        <span className="text-sm font-bold text-teal-700">{time.start}{time.end ? ` → ${time.end}` : ''}</span>
      </div>
      <h3 className="mt-3 text-xl font-black">{item.title}</h3>
      {item.location?.name && (
        <p className="mt-2 text-sm font-semibold text-slate-600">
          📍 {item.location.mapUrl
            ? <a href={item.location.mapUrl} target="_blank" rel="noreferrer" className="text-teal-700 underline">{item.location.name}</a>
            : item.location.name}
        </p>
      )}
      {item.travelFromPrevious?.durationMinutes > 0 && (
        <p className="mt-2 text-sm font-bold text-sky-800">
          {TRAVEL_MODE_MAP[item.travelFromPrevious.mode]?.icon || '➜'} Önceki plandan {formatTravelDuration(item.travelFromPrevious.durationMinutes)}
        </p>
      )}
      {item.notes && <p className="mt-3 text-sm text-slate-500">{item.notes}</p>}
    </article>
  )
}

export function TodayPage() {
  const { trip, user } = useOutletContext()
  const [items, setItems] = useState([])
  const [preparations, setPreparations] = useState([])
  const [error, setError] = useState('')
  const now = useMemo(() => new Date(), [])
  const view = useMemo(
    () => buildTodayView(items, user.uid, now, trip.defaultTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
    [items, now, trip.defaultTimeZone, user.uid],
  )

  useEffect(() => subscribeToPlanItems(trip.id, user.uid, setItems, (nextError) => setError(nextError.message)), [trip.id, user.uid])
  useEffect(() => subscribeToPreparationItems(trip.id, user.uid, setPreparations, (nextError) => setError(nextError.message)), [trip.id, user.uid])

  const pendingPreparations = preparations.filter((item) => !item.completed)

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Anlık gezi özeti</p>
      <h2 className="mt-2 text-3xl font-black">Bugün</h2>
      <p className="mt-2 text-sm text-slate-500">Katıldığın planlar ve tamamlaman gereken hazırlıklar tek ekranda.</p>
      <div className="mt-4"><ErrorMessage message={error} /></div>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black">Sıradaki</h3>
          <Link to="../calendar" className="text-sm font-bold text-teal-700">Takvimi aç</Link>
        </div>
        <div className="mt-3">
          {view.next ? <PlanSummary item={view.next} prominent /> : <EmptyState title="Yaklaşan plan yok" description="Yeni bir Plan Öğesi ekleyebilir veya takvimi kontrol edebilirsin." />}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <section>
          <h3 className="text-xl font-black">Bugünün akışı</h3>
          <div className="mt-3 space-y-3">
            {view.today.map((item) => <PlanSummary key={item.id} item={item} />)}
            {!view.today.length && <EmptyState title="Bugün için plan yok" description="Katıldığın bugünkü Plan Öğeleri burada görünür." />}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-black">Hazırlıklar</h3>
            <Link to="../preparation" className="text-sm font-bold text-teal-700">Tümünü aç</Link>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
            {pendingPreparations.slice(0, 5).map((item) => <p key={item.id} className="border-b border-slate-100 py-3 text-sm font-semibold last:border-0">○ {item.text}</p>)}
            {!pendingPreparations.length && <p className="text-sm text-slate-500">Bekleyen hazırlık yok.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}
