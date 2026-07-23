import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { subscribeToTrip } from '../data/tripRepository'

const tabs = [
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
      <div className="rounded-3xl bg-teal-900 p-6 text-white md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">
            {trip.locationName || 'Peregrin Gezi'}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{trip.name}</h1>
        </div>
        <nav className="mt-8 flex gap-2 overflow-x-auto">
          {tabs.map(([path, label]) => (
            <NavLink
              key={path}
              to={`/app/trips/${tripId}/${path}`}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-bold ${
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
