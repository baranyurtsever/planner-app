import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { subscribeToPlanItems } from '../data/planRepository'
import { planItemDate } from '../domain/calendar'
import { formatPlanTime } from '../domain/planTime'

export function RoutePage() {
  const { trip } = useOutletContext()
  const [items, setItems] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [error, setError] = useState('')

  useEffect(
    () => subscribeToPlanItems(trip.id, setItems, (nextError) => setError(nextError.message)),
    [trip.id],
  )

  const datedItems = useMemo(
    () => items.filter((item) => !selectedDate || planItemDate(item) === selectedDate),
    [items, selectedDate],
  )
  const stops = datedItems.filter((item) =>
    Number.isFinite(Number(item.location?.lat)) && Number.isFinite(Number(item.location?.lng)),
  )
  const positions = stops.map((item) => [Number(item.location.lat), Number(item.location.lng)])
  const center = positions[0] || [41.0082, 28.9784]
  const dates = Array.from(new Set(items.map(planItemDate))).sort()

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Konumlu planlar</p>
          <h2 className="mt-2 text-3xl font-black">Rota</h2>
        </div>
        <select
          aria-label="Rota tarihi"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <option value="">Tüm günler</option>
          {dates.map((date) => <option key={date} value={date}>{date}</option>)}
        </select>
      </div>
      <div className="mt-4"><ErrorMessage message={error} /></div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {datedItems.map((item, index) => {
            const display = formatPlanTime(item.time)
            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-800 text-sm font-black text-white">{index + 1}</span>
                  <div>
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{display.start}</p>
                    <p className="mt-1 text-sm font-semibold text-teal-700">{item.location?.name || 'Konum eklenmedi'}</p>
                    {item.location?.mapUrl && <a href={item.location.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-teal-700">Haritada aç ↗</a>}
                  </div>
                </div>
              </article>
            )
          })}
          {!datedItems.length && <EmptyState title="Bu tarihte rota yok" description="Liste sekmesinden konumlu bir Plan Öğesi ekle." />}
        </div>

        <div className="h-[620px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          <MapContainer key={`${center[0]}-${center[1]}-${selectedDate}`} center={center} zoom={positions.length ? 12 : 3} className="h-full w-full">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {positions.length > 1 && <Polyline positions={positions} pathOptions={{ color: '#0f766e', weight: 4 }} />}
            {stops.map((item, index) => (
              <CircleMarker key={item.id} center={positions[index]} radius={10} pathOptions={{ color: '#0f766e', fillColor: '#0f766e', fillOpacity: 0.9 }}>
                <Popup><strong>{index + 1}. {item.title}</strong><br />{item.location.name}</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  )
}
