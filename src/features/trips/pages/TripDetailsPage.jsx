import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ErrorMessage } from '../../../shared/components/Feedback'
import { canManageTrip } from '../../../shared/domain/access'
import {
  archiveTrip,
  removeTripMember,
  updateTrip,
  updateTripMember,
} from '../data/tripRepository'

const roleLabels = {
  owner: 'Sahip',
  editor: 'Düzenleyici',
  viewer: 'Katılımcı',
}

export function TripDetailsView({
  trip,
  user,
  onArchive,
  onRemoveMember,
  onSaveMember,
  onSaveTrip,
}) {
  const [memberId, setMemberId] = useState('')
  const [memberRole, setMemberRole] = useState('viewer')
  const [tripForm, setTripForm] = useState({
    name: trip.name,
    locationName: trip.locationName || '',
    visibility: trip.visibility,
  })
  const owner = canManageTrip(trip, user.uid)

  function submitMember(event) {
    event.preventDefault()
    onSaveMember(memberId.trim(), memberRole)
    setMemberId('')
    setMemberRole('viewer')
  }

  return (
    <section>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Gezi alanı</p>
        <h2 className="mt-2 text-3xl font-black">Gezi Detayları</h2>
        <p className="mt-2 text-sm text-slate-500">Gezi bilgileri, katılımcılar ve roller tek yerde.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Gezi</p>
          <p className="mt-2 text-lg font-black">{trip.name}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Konum</p>
          <p className="mt-2 text-lg font-black">{trip.locationName || 'Belirtilmedi'}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Görünürlük</p>
          <p className="mt-2 text-lg font-black">{trip.visibility === 'profile' ? 'Profilde açık' : 'Gizli'}</p>
        </article>
      </div>

      {owner && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSaveTrip(tripForm)
          }}
          className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-3"
        >
          <input required aria-label="Gezi adı" value={tripForm.name} onChange={(event) => setTripForm({ ...tripForm, name: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input aria-label="Gezi konumu" value={tripForm.locationName} onChange={(event) => setTripForm({ ...tripForm, locationName: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <select aria-label="Gezi görünürlüğü" value={tripForm.visibility} onChange={(event) => setTripForm({ ...tripForm, visibility: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3">
            <option value="private">Gizli</option>
            <option value="profile">Profilde açık</option>
          </select>
          <button className="rounded-xl bg-teal-800 px-5 py-3 font-bold text-white md:col-span-3">Gezi bilgilerini kaydet</button>
        </form>
      )}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Ekip</p>
        <h3 className="mt-2 text-2xl font-black">Katılımcılar ve roller</h3>
        <p className="mt-2 text-sm text-slate-500">
          {owner
            ? 'Firebase kullanıcı kimliğiyle katılımcı ekleyebilir ve rolünü değiştirebilirsin.'
            : 'Geziye katılan kişileri ve rollerini burada görebilirsin.'}
        </p>

        {owner && (
          <form onSubmit={submitMember} className="mt-5 flex flex-col gap-3 md:flex-row">
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
        )}

        <div className="mt-5 divide-y divide-slate-100">
          {trip.memberIds.map((id) => (
            <div key={id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="break-all text-sm font-semibold">{id}</p>
                <p className="text-xs text-slate-400">{roleLabels[trip.memberRoles[id]]}</p>
              </div>
              {owner && id !== trip.ownerId && (
                <button onClick={() => onRemoveMember(id)} className="text-sm font-bold text-rose-600">
                  Çıkar
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {owner && (
        <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-700">Gezi yönetimi</p>
          <h3 className="mt-2 text-xl font-black">Geziyi arşivle</h3>
          <p className="mt-2 text-sm text-slate-600">Gezi aktif listelerden kaldırılır; kayıtlar korunur.</p>
          <button onClick={onArchive} className="mt-4 rounded-full bg-rose-700 px-5 py-2 text-sm font-bold text-white">
            Arşivle
          </button>
        </section>
      )}
    </section>
  )
}

export function TripDetailsPage() {
  const { trip, user } = useOutletContext()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function archive() {
    if (!window.confirm('Bu Gezi arşivlensin mi?')) return
    try {
      await archiveTrip(trip.id)
      navigate('/app/trips')
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function saveMember(memberId, role) {
    setError('')
    try {
      await updateTripMember(trip, memberId, role)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function removeMember(memberId) {
    setError('')
    try {
      await removeTripMember(trip, memberId)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function saveTrip(changes) {
    setError('')
    try {
      await updateTrip(trip.id, {
        name: changes.name.trim(),
        locationName: changes.locationName.trim(),
        visibility: changes.visibility,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  return (
    <>
      <TripDetailsView
        trip={trip}
        user={user}
        onArchive={archive}
        onRemoveMember={removeMember}
        onSaveMember={saveMember}
        onSaveTrip={saveTrip}
      />
      <div className="mt-4"><ErrorMessage message={error} /></div>
    </>
  )
}
