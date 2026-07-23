import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import {
  archiveTrip,
  removeTripMember,
  subscribeToTrip,
  updateTripMember,
} from '../data/tripRepository'
import { canManageTrip } from '../../../shared/domain/access'

const tabs = [
  ['list', 'Liste'],
  ['calendar', 'Takvim'],
  ['route', 'Rota'],
  ['budget', 'Bütçe'],
  ['preparation', 'Hazırlık'],
  ['settings', 'Ayarlarım'],
]

export function TripLayout() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trip, setTrip] = useState()
  const [error, setError] = useState('')
  const [memberId, setMemberId] = useState('')
  const [memberRole, setMemberRole] = useState('viewer')

  useEffect(
    () =>
      subscribeToTrip(
        tripId,
        setTrip,
        (subscriptionError) => setError(subscriptionError.message),
      ),
    [tripId],
  )

  async function archive() {
    if (!window.confirm('Bu Gezi arşivlensin mi?')) return
    await archiveTrip(tripId)
    navigate('/app/trips')
  }

  async function saveMember(event) {
    event.preventDefault()
    setError('')
    try {
      await updateTripMember(trip, memberId.trim(), memberRole)
      setMemberId('')
      setMemberRole('viewer')
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  if (error) return <ErrorMessage message={error} />
  if (trip === undefined) return <LoadingScreen label="Gezi yükleniyor…" />
  if (!trip) return <ErrorMessage message="Gezi bulunamadı." />

  return (
    <section>
      <div className="rounded-3xl bg-teal-900 p-6 text-white md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">
              {trip.locationName || 'Peregrin Gezi'}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{trip.name}</h1>
          </div>
          {canManageTrip(trip, user.uid) && (
            <button
              onClick={archive}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-bold hover:bg-white/10"
            >
              Arşivle
            </button>
          )}
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
      {trip.ownerId === user.uid && (
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Sahip alanı</p>
          <h2 className="mt-2 text-2xl font-black">Katılımcılar ve roller</h2>
          <p className="mt-2 text-sm text-slate-500">
            Firebase kullanıcı kimliğiyle katılımcı ekleyebilir ve rolünü değiştirebilirsin.
          </p>
          <form onSubmit={saveMember} className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              required
              aria-label="Katılımcı kullanıcı kimliği"
              placeholder="Kullanıcı kimliği"
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3"
            />
            <select
              aria-label="Katılımcı rolü"
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="editor">Düzenleyici</option>
              <option value="viewer">Katılımcı</option>
            </select>
            <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">
              Ekle / güncelle
            </button>
          </form>
          <div className="mt-5 divide-y divide-slate-100">
            {trip.memberIds.map((id) => (
              <div key={id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="break-all text-sm font-semibold">{id}</p>
                  <p className="text-xs text-slate-400">
                    {trip.memberRoles[id] === 'owner'
                      ? 'Sahip'
                      : trip.memberRoles[id] === 'editor'
                        ? 'Düzenleyici'
                        : 'Katılımcı'}
                  </p>
                </div>
                {id !== trip.ownerId && (
                  <button
                    onClick={() => removeTripMember(trip, id)}
                    className="text-sm font-bold text-rose-600"
                  >
                    Çıkar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
