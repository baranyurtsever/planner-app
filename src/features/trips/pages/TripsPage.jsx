import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { EmptyState, ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { createTrip, subscribeToUserTrips } from '../data/tripRepository'
import { TripCreateForm } from '../components/TripCreateForm'

export function TripsPage() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(
    () =>
      subscribeToUserTrips(
        user.uid,
        (nextTrips) => {
          setTrips(nextTrips)
          setLoading(false)
        },
        (subscriptionError) => {
          setError(subscriptionError.message)
          setLoading(false)
        },
      ),
    [user.uid],
  )

  async function submit(form) {
    setError('')
    try {
      await createTrip(form, user.uid)
      setShowForm(false)
    } catch (createError) {
      setError(createError.message)
    }
  }

  if (loading) return <LoadingScreen label="Geziler yükleniyor…" />

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Çalışma alanın</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Geziler</h1>
        </div>
        <button
          onClick={() => setShowForm((current) => !current)}
          className="rounded-full bg-teal-800 px-5 py-3 text-sm font-bold text-white hover:bg-teal-900"
        >
          Yeni Gezi
        </button>
      </div>

      <div className="mt-5">
        <ErrorMessage message={error} />
      </div>

      {showForm && <TripCreateForm onSubmit={submit} />}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <Link
            key={trip.id}
            to={`/app/trips/${trip.id}/list`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                {trip.memberRoles[user.uid] === 'owner'
                  ? 'Sahip'
                  : trip.memberRoles[user.uid] === 'editor'
                    ? 'Düzenleyici'
                    : 'Katılımcı'}
              </span>
              <span className="text-xs text-slate-400">
                {trip.visibility === 'profile' ? 'Profilde' : 'Gizli'}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-black">{trip.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{trip.locationName || 'Konum eklenmedi'}</p>
          </Link>
        ))}
      </div>

      {!trips.length && (
        <div className="mt-8">
          <EmptyState title="Henüz Gezi yok" description="İlk ortak çalışma alanını oluştur." />
        </div>
      )}
    </section>
  )
}
