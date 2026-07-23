import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { EmptyState, ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { createTrip, subscribeToUserTrips } from '../data/tripRepository'

export function TripsPage() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', locationName: '', visibility: 'private' })

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

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await createTrip(form, user.uid)
      setForm({ name: '', locationName: '', visibility: 'private' })
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

      {showForm && (
        <form
          onSubmit={submit}
          className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto_auto]"
        >
          <input
            required
            aria-label="Gezi adı"
            placeholder="Gezi adı"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            aria-label="Konum"
            placeholder="Konum"
            value={form.locationName}
            onChange={(event) => setForm({ ...form, locationName: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <select
            aria-label="Gezi görünürlüğü"
            value={form.visibility}
            onChange={(event) => setForm({ ...form, visibility: event.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="private">Gizli</option>
            <option value="profile">Profilde görünür</option>
          </select>
          <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Oluştur</button>
        </form>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <Link
            key={trip.id}
            to={`/app/trips/${trip.id}/plan`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                {trip.memberRoles[user.uid] === 'owner'
                  ? 'Sahip'
                  : trip.memberRoles[user.uid] === 'editor'
                    ? 'Düzenleyici'
                    : 'Gözlemci'}
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
