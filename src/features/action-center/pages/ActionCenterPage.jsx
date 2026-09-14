import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { useAuth } from '../../auth/authState'
import { ProfileIdentity } from '../../profile/components/ProfileIdentity'
import { useProfilesById } from '../../profile/hooks/useProfilesById'
import { acceptFriendRequest, rejectFriendRequest } from '../../social/data/friendshipRepository'
import { acceptTripInvitation, rejectTripInvitation } from '../../trips/data/tripInvitationRepository'
import { ProposalPanel } from '../../itinerary/components/ProposalPanel'
import { decideParticipationRequest } from '../../itinerary/data/planParticipationRepository'
import { formatPlanTime } from '../../itinerary/domain/planTime'

const roleLabels = { editor: 'Düzenleyici', viewer: 'Katılımcı' }

export function ActionCenterPage() {
  const { actionCenter } = useOutletContext()
  const { user } = useAuth()
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const profileIds = [
    ...actionCenter.friendRequests.map((request) => request.fromId),
    ...Object.values(actionCenter.requestsByTrip).flat().map((request) => request.requesterId),
  ]
  const profilesById = useProfilesById(profileIds)

  async function run(id, action) {
    setBusyId(id)
    setError('')
    try {
      await action()
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setBusyId('')
    }
  }

  const tripsWithProposals = actionCenter.trips.filter((trip) => actionCenter.proposalsByTrip[trip.id]?.length)
  const ownedRequests = actionCenter.trips.flatMap((trip) =>
    (actionCenter.requestsByTrip[trip.id] || []).map((request) => ({ ...request, trip })),
  )

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Geziler arası</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">İşlem Merkezi</h1>
      <p className="mt-2 text-sm text-slate-500">Cevabını bekleyen kayıtlar ve önündeki yedi gün tek yerde.</p>
      <div className="mt-4"><ErrorMessage message={error || actionCenter.error} /></div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black">Davetler ve arkadaşlıklar</h2>
          <div className="mt-4 space-y-3">
            {actionCenter.invitations.map((invitation) => (
              <article key={invitation.id} className="rounded-2xl bg-teal-50 p-4">
                <p className="font-black">{invitation.tripName}</p>
                <p className="mt-1 text-sm text-slate-500">{roleLabels[invitation.role]} olarak davet edildin.</p>
                <div className="mt-3 flex gap-3">
                  <button disabled={busyId === invitation.id} onClick={() => run(invitation.id, () => acceptTripInvitation(invitation, user.uid))} className="text-sm font-bold text-teal-700">Kabul et</button>
                  <button disabled={busyId === invitation.id} onClick={() => run(invitation.id, () => rejectTripInvitation(invitation, user.uid))} className="text-sm font-bold text-rose-600">Reddet</button>
                </div>
              </article>
            ))}
            {actionCenter.friendRequests.map((request) => (
              <article key={request.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black"><ProfileIdentity profile={profilesById[request.fromId]} compact /></p>
                <p className="mt-1 text-sm text-slate-500">Arkadaşlık isteği gönderdi.</p>
                <div className="mt-3 flex gap-3">
                  <button disabled={busyId === request.id} onClick={() => run(request.id, () => acceptFriendRequest(request))} className="text-sm font-bold text-teal-700">Kabul et</button>
                  <button disabled={busyId === request.id} onClick={() => run(request.id, () => rejectFriendRequest(request.id))} className="text-sm font-bold text-rose-600">Reddet</button>
                </div>
              </article>
            ))}
            {!actionCenter.invitations.length && !actionCenter.friendRequests.length && <EmptyState title="Bekleyen davet yok" description="Gezi ve arkadaşlık davetleri burada görünür." />}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black">Katılım istekleri</h2>
          <div className="mt-4 space-y-3">
            {ownedRequests.map((request) => {
              const item = actionCenter.itemsByTrip[request.trip.id]?.find((candidate) => candidate.id === request.planItemId)
              return (
                <article key={`${request.trip.id}-${request.id}`} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-black">{item?.title || 'Plan Öğesi'}</p>
                  <p className="mt-1 text-sm text-slate-500"><ProfileIdentity profile={profilesById[request.requesterId]} compact /> · {request.trip.name}</p>
                  <div className="mt-3 flex gap-3">
                    <button disabled={!item || busyId === request.id} onClick={() => run(request.id, () => decideParticipationRequest(request.trip.id, item, request, 'approved', user.uid))} className="text-sm font-bold text-teal-700 disabled:opacity-40">Kabul et</button>
                    <button disabled={!item || busyId === request.id} onClick={() => run(request.id, () => decideParticipationRequest(request.trip.id, item, request, 'rejected', user.uid))} className="text-sm font-bold text-rose-600 disabled:opacity-40">Reddet</button>
                  </div>
                </article>
              )
            })}
            {!ownedRequests.length && <EmptyState title="Bekleyen katılım isteği yok" description="Kişisel planlarına katılmak isteyenler burada görünür." />}
          </div>
        </section>
      </div>

      {tripsWithProposals.map((trip) => (
        <ProposalPanel key={trip.id} trip={trip} user={user} proposals={actionCenter.proposalsByTrip[trip.id]} items={actionCenter.itemsByTrip[trip.id] || []} />
      ))}

      <section className="mt-8">
        <h2 className="text-2xl font-black">Önündeki 7 gün</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {actionCenter.upcoming.map((item) => {
            const display = formatPlanTime(item.time)
            return (
              <Link key={`${item.tripId}-${item.id}`} to={`/app/trips/${item.tripId}/calendar`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-300">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{item.tripName}</p>
                <h3 className="mt-2 font-black">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{display.start}{display.end ? ` → ${display.end}` : ''}</p>
              </Link>
            )
          })}
          {!actionCenter.upcoming.length && <EmptyState title="Yaklaşan plan yok" description="Önündeki yedi günde zamanlanmış bir plan bulunmuyor." />}
        </div>
      </section>
    </section>
  )
}
