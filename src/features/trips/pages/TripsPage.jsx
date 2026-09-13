import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { EmptyState, ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { createTrip, duplicateTrip, subscribeToUserTrips } from '../data/tripRepository'
import { TripCreateForm } from '../components/TripCreateForm'
import { completeRegistration } from '../../auth/data/authRepository'

function pendingRegistrationCompletion() {
  try {
    return JSON.parse(window.sessionStorage.getItem('registration-completion'))
  } catch {
    return null
  }
}

export function TripsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [registrationCompletion, setRegistrationCompletion] = useState(pendingRegistrationCompletion)
  const [duplicateSource, setDuplicateSource] = useState(null)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateStartDate, setDuplicateStartDate] = useState(new Date().toISOString().slice(0, 10))

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

  async function retryRegistrationCompletion() {
    setError('')
    const warnings = await completeRegistration(user, registrationCompletion.displayName)
    if (warnings.length) {
      const next = { ...registrationCompletion, warnings }
      window.sessionStorage.setItem('registration-completion', JSON.stringify(next))
      setRegistrationCompletion(next)
      return
    }
    window.sessionStorage.removeItem('registration-completion')
    setRegistrationCompletion(null)
  }

  async function submitDuplicate(event) {
    event.preventDefault()
    setError('')
    try {
      const tripId = await duplicateTrip(duplicateSource, { name: duplicateName, startDate: duplicateStartDate }, user.uid)
      setDuplicateSource(null)
      navigate(`/app/trips/${tripId}/today`)
    } catch (duplicateError) {
      setError(duplicateError.message)
    }
  }

  if (loading) return <LoadingScreen label="Geziler yükleniyor…" />

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Çalışma alanın</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Geziler</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Birlikte planladığınız rotalar, sıradaki duraklar ve sana ait detaylar.</p>
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

      {registrationCompletion && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Hesabın oluşturuldu; profil veya doğrulama e-postası adımı tamamlanamadı.</p>
          <button type="button" onClick={() => retryRegistrationCompletion().catch((nextError) => setError(nextError.message))} className="mt-2 font-bold underline">Kayıt adımlarını yeniden dene</button>
        </div>
      )}

      {showForm && <TripCreateForm onSubmit={submit} />}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <article key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
          <Link to={`/app/trips/${trip.id}/today`} className="block">
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
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold">
              <span className="text-slate-500">{trip.memberIds.length} katılımcı</span>
              <span className="text-teal-800">Geziyi aç <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
          {trip.ownerId === user.uid && <button type="button" onClick={() => { setDuplicateSource(trip); setDuplicateName(`${trip.name} (kopya)`) }} className="mt-4 text-sm font-bold text-teal-700">Geziyi çoğalt</button>}
          </article>
        ))}
      </div>

      {!trips.length && (
        <div className="mt-8">
          <EmptyState title="Henüz Gezi yok" description="İlk ortak çalışma alanını oluştur." />
        </div>
      )}

      {duplicateSource && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={submitDuplicate} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Geziyi çoğalt</p>
            <h2 className="mt-2 text-2xl font-black">Yeni Geziyi ayarla</h2>
            <p className="mt-2 text-sm text-slate-500">Yalnız ortak plan iskeleti kopyalanır. Katılımcılar, harcamalar, belgeler, öneriler ve özel notlar taşınmaz.</p>
            <label className="mt-5 block text-sm font-semibold text-slate-600">Yeni Gezi adı<input required aria-label="Kopya Gezi adı" value={duplicateName} onChange={(event) => setDuplicateName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="mt-4 block text-sm font-semibold text-slate-600">Yeni başlangıç tarihi<input required aria-label="Kopya başlangıç tarihi" type="date" value={duplicateStartDate} onChange={(event) => setDuplicateStartDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <p className="mt-3 text-xs text-slate-500">Saat dilimi: {duplicateSource.defaultTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDuplicateSource(null)} className="rounded-xl border border-slate-200 px-5 py-3 font-bold">Vazgeç</button><button className="rounded-xl bg-teal-800 px-5 py-3 font-bold text-white">Çoğalt</button></div>
          </form>
        </div>
      )}
    </section>
  )
}
