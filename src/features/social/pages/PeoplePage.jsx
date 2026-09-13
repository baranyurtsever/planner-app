import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/authState'
import { EmptyState, ErrorMessage } from '../../../shared/components/Feedback'
import { getProfileById, getProfileByUsername } from '../../profile/data/profileRepository'
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendship,
  sendFriendRequest,
  subscribeToFriendships,
  subscribeToIncomingFriendRequests,
} from '../data/friendshipRepository'
import {
  acceptTripInvitation,
  rejectTripInvitation,
  subscribeToIncomingTripInvitations,
} from '../../trips/data/tripInvitationRepository'

const tripRoleLabels = { editor: 'Düzenleyici', viewer: 'Katılımcı' }

export function PeoplePage() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [result, setResult] = useState(null)
  const [incoming, setIncoming] = useState([])
  const [friends, setFriends] = useState([])
  const [tripInvitations, setTripInvitations] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => subscribeToIncomingFriendRequests(user.uid, async (requests) => {
    const decorated = await Promise.all(requests.map(async (request) => ({
      ...request,
      profile: await getProfileById(request.fromId),
    })))
    setIncoming(decorated)
  }, (nextError) => setError(nextError.message)), [user.uid])

  useEffect(() => subscribeToFriendships(user.uid, async (relationships) => {
    const decorated = await Promise.all(relationships.map(async (friendship) => {
      const friendId = friendship.memberIds.find((id) => id !== user.uid)
      return { ...friendship, profile: await getProfileById(friendId) }
    }))
    setFriends(decorated)
  }, (nextError) => setError(nextError.message)), [user.uid])

  useEffect(() => subscribeToIncomingTripInvitations(
    user.uid,
    setTripInvitations,
    (nextError) => setError(nextError.message),
  ), [user.uid])

  async function decideTripInvitation(invitation, decision) {
    setError('')
    setMessage('')
    try {
      if (decision === 'accepted') await acceptTripInvitation(invitation, user.uid)
      else await rejectTripInvitation(invitation, user.uid)
      setMessage(decision === 'accepted' ? 'Gezi daveti kabul edildi.' : 'Gezi daveti reddedildi.')
    } catch (decisionError) {
      setError(decisionError.message)
    }
  }

  async function search(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const profile = await getProfileByUsername(username)
      if (!profile) throw new Error('Bu kullanıcı adıyla bir profil bulunamadı.')
      setResult(profile)
    } catch (searchError) {
      setResult(null)
      setError(searchError.message)
    }
  }

  async function requestFriendship() {
    if (result.id === user.uid) {
      setError('Kendine arkadaşlık isteği gönderemezsin.')
      return
    }
    try {
      await sendFriendRequest(user.uid, result.id)
      setMessage('Arkadaşlık isteği gönderildi.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Sosyal alan</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Kişiler</h1>

      <form onSubmit={search} className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
        <input
          required
          aria-label="Kullanıcı adı ara"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3"
        />
        <button className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white">Profil ara</button>
      </form>

      <div className="mt-4"><ErrorMessage message={error} /></div>
      {message && <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{message}</p>}

      {result && (
        <article className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-white p-5">
          <div>
            <h2 className="text-lg font-black">{result.displayName}</h2>
            <p className="text-sm font-semibold text-teal-700">@{result.username}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/app/people/${result.username}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">
              Profili gör
            </Link>
            {result.id !== user.uid && (
              <button onClick={requestFriendship} className="rounded-full bg-teal-800 px-4 py-2 text-sm font-bold text-white">
                Arkadaş ekle
              </button>
            )}
          </div>
        </article>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-black">Gezi davetleri</h2>
        <div className="mt-4 space-y-3">
          {tripInvitations.map((invitation) => (
            <article key={invitation.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-white p-5">
              <div>
                <p className="font-black">{invitation.tripName}</p>
                <p className="text-sm text-slate-500">{tripRoleLabels[invitation.role]} olarak davet edildin</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => decideTripInvitation(invitation, 'accepted')} className="text-sm font-bold text-teal-700">Geziye katıl</button>
                <button onClick={() => decideTripInvitation(invitation, 'rejected')} className="text-sm font-bold text-rose-600">Reddet</button>
              </div>
            </article>
          ))}
          {!tripInvitations.length && <EmptyState title="Bekleyen Gezi daveti yok" description="Yeni davetler burada görünür." />}
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black">Gelen istekler</h2>
          <div className="mt-4 space-y-3">
            {incoming.map((request) => (
              <article key={request.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div>
                  <p className="font-black">{request.profile?.displayName || 'Peregrin kullanıcısı'}</p>
                  {request.profile && <p className="text-sm text-teal-700">@{request.profile.username}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptFriendRequest(request)} className="text-sm font-bold text-teal-700">Kabul et</button>
                  <button onClick={() => rejectFriendRequest(request.id)} className="text-sm font-bold text-rose-600">Reddet</button>
                </div>
              </article>
            ))}
            {!incoming.length && <EmptyState title="Bekleyen istek yok" description="Yeni istekler burada görünür." />}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black">Arkadaşların</h2>
          <div className="mt-4 space-y-3">
            {friends.map((friendship) => (
              <article key={friendship.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div>
                  <p className="font-black">{friendship.profile?.displayName || 'Peregrin kullanıcısı'}</p>
                  {friendship.profile && <p className="text-sm text-teal-700">@{friendship.profile.username}</p>}
                </div>
                <div className="flex gap-2">
                  {friendship.profile && (
                    <Link to={`/app/people/${friendship.profile.username}`} className="text-sm font-bold text-teal-700">
                      Profil
                    </Link>
                  )}
                  <button onClick={() => removeFriendship(friendship.id)} className="text-sm font-bold text-rose-600">Çıkar</button>
                </div>
              </article>
            ))}
            {!friends.length && <EmptyState title="Henüz arkadaşın yok" description="Kullanıcı adıyla profil arayabilirsin." />}
          </div>
        </div>
      </div>
    </section>
  )
}
