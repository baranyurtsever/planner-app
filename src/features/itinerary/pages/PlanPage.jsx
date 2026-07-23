import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { canEditPlanItem } from '../../../shared/domain/access'
import {
  createDateOnlyPlanTime,
  createTimedPlanTime,
  formatPlanTime,
  utcToZonedLocal,
  zonedLocalToUtc,
} from '../domain/planTime'
import {
  removePlanItem,
  savePlanItem,
  subscribeToPlanItems,
} from '../data/planRepository'

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const initialForm = {
  title: '',
  category: 'activity',
  visibility: 'trip',
  notes: '',
  locationName: '',
  locationLat: '',
  locationLng: '',
  mapUrl: '',
  dateOnly: false,
  localDate: '',
  startsAtLocal: '',
  endsAtLocal: '',
  startTimeZone: localTimeZone,
  endTimeZone: localTimeZone,
}

export function PlanPage() {
  const { trip, user } = useOutletContext()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const editable = canEditPlanItem(trip, user.uid)

  useEffect(
    () => subscribeToPlanItems(trip.id, setItems, (subscriptionError) => setError(subscriptionError.message)),
    [trip.id],
  )

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const time = form.dateOnly
        ? createDateOnlyPlanTime(form.localDate)
        : createTimedPlanTime({
            startsAt: zonedLocalToUtc(form.startsAtLocal, form.startTimeZone),
            endsAt: zonedLocalToUtc(form.endsAtLocal, form.endTimeZone),
            startTimeZone: form.startTimeZone,
            endTimeZone: form.endTimeZone,
          })
      await savePlanItem(trip.id, { ...form, time })
      setForm(initialForm)
      setShowForm(false)
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  function startEditing(item) {
    const dateOnly = item.time.kind === 'date'
    setForm({
      id: item.id,
      title: item.title,
      category: item.category,
      visibility: item.visibility,
      notes: item.notes || '',
      locationName: item.location?.name || '',
      locationLat: item.location?.lat ?? '',
      locationLng: item.location?.lng ?? '',
      mapUrl: item.location?.mapUrl || '',
      dateOnly,
      localDate: dateOnly ? item.time.localDate : '',
      startsAtLocal: dateOnly ? '' : utcToZonedLocal(item.time.startsAt, item.time.startTimeZone),
      endsAtLocal: dateOnly ? '' : utcToZonedLocal(item.time.endsAt, item.time.endTimeZone),
      startTimeZone: dateOnly ? localTimeZone : item.time.startTimeZone,
      endTimeZone: dateOnly ? localTimeZone : item.time.endTimeZone,
    })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Ortak alan</p>
          <h2 className="mt-2 text-3xl font-black">Plan Öğeleri</h2>
        </div>
        {editable && (
          <button
            onClick={() => setShowForm((current) => !current)}
            className="rounded-full bg-teal-800 px-5 py-3 text-sm font-bold text-white"
          >
            Plan ekle
          </button>
        )}
      </div>

      <div className="mt-5"><ErrorMessage message={error} /></div>

      {showForm && (
        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
          <input
            required
            aria-label="Plan başlığı"
            placeholder="Plan başlığı"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <select
            aria-label="Plan kategorisi"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="activity">Etkinlik</option>
            <option value="flight">Uçuş</option>
            <option value="stay">Konaklama</option>
            <option value="transport">Ulaşım</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.dateOnly}
              onChange={(event) => setForm({ ...form, dateOnly: event.target.checked })}
            />
            Yalnızca tarih
          </label>
          <select
            aria-label="Plan görünürlüğü"
            value={form.visibility}
            onChange={(event) => setForm({ ...form, visibility: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="trip">Yalnızca katılımcılar</option>
            <option value="profile">Profili görüntüleyen herkes</option>
          </select>
          {form.dateOnly ? (
            <input
              required
              type="date"
              aria-label="Plan tarihi"
              value={form.localDate}
              onChange={(event) => setForm({ ...form, localDate: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
          ) : (
            <>
              <label className="text-sm font-semibold text-slate-600">
                Başlangıç
                <input
                  required
                  type="datetime-local"
                  value={form.startsAtLocal}
                  onChange={(event) => setForm({ ...form, startsAtLocal: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Başlangıç saat dilimi
                <input
                  required
                  value={form.startTimeZone}
                  onChange={(event) => setForm({ ...form, startTimeZone: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Bitiş
                <input
                  required
                  type="datetime-local"
                  value={form.endsAtLocal}
                  onChange={(event) => setForm({ ...form, endsAtLocal: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Bitiş saat dilimi
                <input
                  required
                  value={form.endTimeZone}
                  onChange={(event) => setForm({ ...form, endTimeZone: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
            </>
          )}
          <textarea
            aria-label="Plan notu"
            placeholder="Not"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
          />
          <input
            aria-label="Konum adı"
            placeholder="Konum adı"
            value={form.locationName}
            onChange={(event) => setForm({ ...form, locationName: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            type="url"
            aria-label="Harita bağlantısı"
            placeholder="Google Maps / harita bağlantısı"
            value={form.mapUrl}
            onChange={(event) => setForm({ ...form, mapUrl: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <label className="text-sm font-semibold text-slate-600">
            Enlem
            <input
              type="number"
              step="any"
              value={form.locationLat}
              onChange={(event) => setForm({ ...form, locationLat: event.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Boylam
            <input
              type="number"
              step="any"
              value={form.locationLng}
              onChange={(event) => setForm({ ...form, locationLng: event.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white md:col-span-2">Kaydet</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const displayTime = formatPlanTime(item.time)
          return (
            <article key={item.id} className="flex items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.category}</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {item.visibility === 'profile' ? 'Herkese açık' : 'Katılımcılar'}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {displayTime.start}{displayTime.end ? ` → ${displayTime.end}` : ''}
                </p>
                {item.notes && <p className="mt-3 text-sm text-slate-600">{item.notes}</p>}
                {item.location?.name && <p className="mt-2 text-sm font-semibold text-teal-700">📍 {item.location.name}</p>}
              </div>
              {editable && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => startEditing(item)} className="text-sm font-bold text-teal-700">
                    Düzenle
                  </button>
                  <button onClick={() => removePlanItem(trip.id, item.id)} className="text-sm font-bold text-rose-600">
                    Sil
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {!items.length && !showForm && (
        <div className="mt-6"><EmptyState title="Plan henüz boş" description="İlk ortak Plan Öğesini ekle." /></div>
      )}
    </div>
  )
}
