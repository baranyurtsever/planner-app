import { useEffect, useMemo, useState } from 'react'
import { subscribeToIncomingFriendRequests } from '../../social/data/friendshipRepository'
import { subscribeToIncomingTripInvitations } from '../../trips/data/tripInvitationRepository'
import { subscribeToUserTrips } from '../../trips/data/tripRepository'
import { subscribeToParticipationRequests } from '../../itinerary/data/planParticipationRepository'
import { subscribeToPlanItems, subscribeToPlanProposals } from '../../itinerary/data/planRepository'
import { pendingActionCount, upcomingPlans } from '../domain/actionCenter'

export function useActionCenter(userId) {
  const [trips, setTrips] = useState([])
  const [invitations, setInvitations] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [proposalsByTrip, setProposalsByTrip] = useState({})
  const [requestsByTrip, setRequestsByTrip] = useState({})
  const [itemsByTrip, setItemsByTrip] = useState({})
  const [error, setError] = useState('')
  const tripKey = trips.map((trip) => trip.id).join('|')

  useEffect(() => subscribeToUserTrips(userId, setTrips, (nextError) => setError(nextError.message)), [userId])
  useEffect(() => subscribeToIncomingTripInvitations(userId, setInvitations, (nextError) => setError(nextError.message)), [userId])
  useEffect(() => subscribeToIncomingFriendRequests(userId, setFriendRequests, (nextError) => setError(nextError.message)), [userId])

  useEffect(() => {
    setProposalsByTrip({})
    setRequestsByTrip({})
    setItemsByTrip({})
    const subscriptions = trips.flatMap((trip) => [
      subscribeToPlanProposals(trip.id, (items) => setProposalsByTrip((current) => ({ ...current, [trip.id]: items })), (nextError) => setError(nextError.message)),
      subscribeToParticipationRequests(trip.id, (items) => setRequestsByTrip((current) => ({
        ...current,
        [trip.id]: items.filter((request) => request.itemOwnerId === userId),
      })), (nextError) => setError(nextError.message)),
      subscribeToPlanItems(trip.id, userId, (items) => setItemsByTrip((current) => ({ ...current, [trip.id]: items })), (nextError) => setError(nextError.message)),
    ])
    return () => subscriptions.forEach((unsubscribe) => unsubscribe())
  }, [tripKey, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => ({
    trips,
    invitations,
    friendRequests,
    proposalsByTrip,
    requestsByTrip,
    itemsByTrip,
    upcoming: upcomingPlans(itemsByTrip, trips),
    count: pendingActionCount({ invitations, friendRequests, proposalsByTrip, requestsByTrip }),
    error,
  }), [trips, invitations, friendRequests, proposalsByTrip, requestsByTrip, itemsByTrip, error])
}
