import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { subscribeToTrip } from '../data/tripRepository'

const tabs = [
  ['today', 'Bugün'],
  ['list', 'Liste'],
  ['calendar', 'Takvim'],
  ['route', 'Rota'],
  ['budget', 'Bütçe'],
  ['preparation', 'Hazırlık'],
  ['details', 'Gezi Detayları'],
  ['settings', 'Ayarlarım'],
]

export function TripLayout() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const [trip, setTrip] = useState()
  const [error, setError] = useState('')

  useEffect(
    () =>
      subscribeToTrip(
        tripId,
        setTrip,
        (subscriptionError) => setError(subscriptionError.message),
      ),
    [tripId],
  )

  if (error) return <ErrorMessage message={error} />
  if (trip === undefined) return <LoadingScreen label="Gezi yükleniyor…" />
  if (!trip) return <ErrorMessage message="Gezi bulunamadı." />

  return (
    <section>
      <div className="trip-hero rounded-3xl p-5 text-white shadow-lg shadow-teal-950/10 md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">
            {trip.locationName || 'Peregrin Gezi'}
          </p>
          <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">{trip.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-teal-50">
            <span className="rounded-full border border-white/20 px-3 py-1.5">{trip.memberIds.length} katılımcı</span>
            <span className="rounded-full border border-white/20 px-3 py-1.5">{trip.visibility === 'profile' ? 'Profilde görünür' : 'Gizli Gezi'}</span>
          </div>
        </div>
        <nav aria-label="Gezi bölümleri" className="mt-6 flex flex-wrap gap-2 pb-1">
          {tabs.map(([path, label]) => (
            <NavLink
              key={path}
              to={`/app/trips/${tripId}/${path}`}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  isActive ? 'bg-white text-teal-900' : 'bg-white/10 text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-8">
        <Outlet context={{ trip, user }} />
      </div>
    </section>
  )
}
