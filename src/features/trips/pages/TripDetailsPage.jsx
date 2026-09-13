import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ErrorMessage } from '../../../shared/components/Feedback'
import { canManageTrip } from '../../../shared/domain/access'
import { ProfileIdentity } from '../../profile/components/ProfileIdentity'
import { getProfileByUsername } from '../../profile/data/profileRepository'
import { useProfilesById } from '../../profile/hooks/useProfilesById'
import { createTimeZoneOptions } from '../../itinerary/domain/timeZones'
import {
  archiveTrip,
  removeTripMember,
  updateTrip,
  updateTripMember,
} from '../data/tripRepository'
import {
  cancelTripInvitation,
  sendTripInvitation,
  subscribeToTripInvitations,
} from '../data/tripInvitationRepository'

const roleLabels = {
  owner: 'Sahip',
  editor: 'Düzenleyici',
  viewer: 'Katılımcı',
}

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const defaultTimeZoneOptions = createTimeZoneOptions()

export function TripDetailsView({
  trip,
  user,
  onArchive,
  onRemoveMember,
  onChangeMemberRole,
  onInviteMember,
  onCancelInvitation,
  onSaveTrip,
  pendingInvitations = [],
  profilesById = {},
}) {
  const [memberUsername, setMemberUsername] = useState('')
  const [memberRole, setMemberRole] = useState('viewer')
  const [tripForm, setTripForm] = useState({
    name: trip.name,
    locationName: trip.locationName || '',
    visibility: trip.visibility,
    defaultTimeZone: trip.defaultTimeZone || localTimeZone,
  })
  const owner = canManageTrip(trip, user.uid)

  function submitMember(event) {
    event.preventDefault()
    onInviteMember(memberUsername.trim(), memberRole)
    setMemberUsername('')
    setMemberRole('viewer')
  }

  return (
    <section>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Gezi alanı</p>
        <h2 className="mt-2 text-3xl font-black">Gezi Detayları</h2>
        <p className="mt-2 text-sm text-slate-500">Gezi bilgileri, katılımcılar ve roller tek yerde.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Varsayılan saat dilimi</p>
          <p className="mt-2 text-sm font-black">{defaultTimeZoneOptions.find((option) => option.value === trip.defaultTimeZone)?.label || trip.defaultTimeZone || localTimeZone}</p>
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
          <input required aria-label="Gezi adı" value={tripForm.name} onChange={(event) => setTripForm({ ...tripForm, name: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-4 py-3" />
          <input aria-label="Gezi konumu" value={tripForm.locationName} onChange={(event) => setTripForm({ ...tripForm, locationName: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-4 py-3" />
          <select aria-label="Gezi görünürlüğü" value={tripForm.visibility} onChange={(event) => setTripForm({ ...tripForm, visibility: event.target.value })} className="min-w-0 rounded-xl border border-slate-200 px-4 py-3">
            <option value="private">Gizli</option>
            <option value="profile">Profilde açık</option>
          </select>
          <select aria-label="Varsayılan saat dilimi" value={tripForm.defaultTimeZone} onChange={(event) => setTripForm({ ...tripForm, defaultTimeZone: event.target.value })} className="min-w-0 max-w-full rounded-xl border border-slate-200 px-4 py-3 md:col-span-3">
            {defaultTimeZoneOptions.map((timeZone) => <option key={timeZone.value} value={timeZone.value}>{timeZone.label}</option>)}
          </select>
          <button className="rounded-xl bg-teal-800 px-5 py-3 font-bold text-white md:col-span-3">Gezi bilgilerini kaydet</button>
        </form>
      )}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Ekip</p>
        <h3 className="mt-2 text-2xl font-black">Katılımcılar ve roller</h3>
        <p className="mt-2 text-sm text-slate-500">
          {owner
            ? 'Kullanıcı adıyla davet gönder; üyelik yalnız davet kabul edilince başlar.'
            : 'Geziye katılan kişileri ve rollerini burada görebilirsin.'}
        </p>

        {owner && (
          <form onSubmit={submitMember} className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              required
              aria-label="Katılımcı kullanıcı adı"
              placeholder="Kullanıcı adı"
              value={memberUsername}
              onChange={(event) => setMemberUsername(event.target.value)}
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
              Davet gönder
            </button>
          </form>
        )}

        <div className="mt-5 divide-y divide-slate-100">
          {trip.memberIds.map((id) => (
            <div key={id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-black text-teal-800">
                  {(profilesById[id]?.displayName || profilesById[id]?.username || 'P').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <ProfileIdentity profile={profilesById[id]} />
                  {owner && id !== trip.ownerId ? (
                    <select aria-label={`${profilesById[id]?.displayName || 'Katılımcı'} rolü`} value={trip.memberRoles[id]} onChange={(event) => onChangeMemberRole(id, event.target.value)} className="mt-1 rounded-lg border border-slate-200 px-2 py-1 text-xs">
                      <option value="editor">Düzenleyici</option>
                      <option value="viewer">Katılımcı</option>
                    </select>
                  ) : <p className="text-xs text-slate-400">{roleLabels[trip.memberRoles[id]]}</p>}
                </div>
              </div>
              {owner && id !== trip.ownerId && (
                <button onClick={() => onRemoveMember(id)} className="text-sm font-bold text-rose-600">
                  Çıkar
                </button>
              )}
            </div>
          ))}
        </div>

        {owner && pendingInvitations.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-sm font-black">Bekleyen davetler</p>
            <div className="mt-2 divide-y divide-slate-100">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <ProfileIdentity profile={profilesById[invitation.inviteeId]} />
                    <p className="text-xs text-slate-400">{roleLabels[invitation.role]} olarak davet edildi</p>
                  </div>
                  <button type="button" onClick={() => onCancelInvitation(invitation)} className="text-sm font-bold text-rose-600">Daveti iptal et</button>
                </div>
              ))}
            </div>
          </div>
        )}
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
  const [pendingInvitations, setPendingInvitations] = useState([])
  const owner = canManageTrip(trip, user.uid)
  const profilesById = useProfilesById([
    ...trip.memberIds,
    ...pendingInvitations.map((invitation) => invitation.inviteeId),
  ])

  useEffect(() => {
    if (!owner) return undefined
    return subscribeToTripInvitations(
      trip.id,
      user.uid,
      setPendingInvitations,
      (nextError) => setError(nextError.message),
    )
  }, [owner, trip.id, user.uid])

  async function archive() {
    if (!window.confirm('Bu Gezi arşivlensin mi?')) return
    try {
      await archiveTrip(trip.id)
      navigate('/app/trips')
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function inviteMember(username, role) {
    setError('')
    try {
      const profile = await getProfileByUsername(username)
      if (!profile) throw new Error('Bu kullanıcı adıyla eşleşen bir profil bulunamadı.')
      await sendTripInvitation(trip, user.uid, profile.id, role)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function changeMemberRole(memberId, role) {
    setError('')
    try {
      await updateTripMember(trip, memberId, role)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function cancelInvitation(invitation) {
    setError('')
    try {
      await cancelTripInvitation(invitation, user.uid)
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
        defaultTimeZone: changes.defaultTimeZone,
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
        onChangeMemberRole={changeMemberRole}
        onInviteMember={inviteMember}
        onCancelInvitation={cancelInvitation}
        onSaveTrip={saveTrip}
        pendingInvitations={pendingInvitations}
        profilesById={profilesById}
      />
      <div className="mt-4"><ErrorMessage message={error} /></div>
    </>
  )
}
