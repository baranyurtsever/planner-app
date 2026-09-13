import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { formatPlanTime } from '../../itinerary/domain/planTime'
import { PlaceDetails } from '../../itinerary/components/PlaceDetails'
import { subscribeToPublicTripExpenses } from '../../expenses/data/expenseRepository'
import { getProfileByUsername, getPublicTripForProfile } from '../data/profileRepository'
import { getPublicTrip } from '../../trips/data/tripRepository'
import { subscribeToPublicPlanItems } from '../../itinerary/data/planRepository'

export function PublicTripPage() {
  const { username, tripId } = useParams()
  const [trip, setTrip] = useState()
  const [profile, setProfile] = useState()
  const [planItems, setPlanItems] = useState([])
  const [expenses, setExpenses] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getProfileByUsername(username)
      .then(async (nextProfile) => {
        if (!nextProfile) throw new Error('Herkese açık Gezi bulunamadı.')
        const [nextTrip, profileTrip] = await Promise.all([
          getPublicTrip(tripId),
          getPublicTripForProfile(nextProfile.id, tripId),
        ])
        if (!nextTrip || !profileTrip) {
          throw new Error('Herkese açık Gezi bulunamadı.')
        }
        if (active) {
          setProfile(nextProfile)
          setTrip(nextTrip)
        }
      })
      .catch((loadError) => active && setError(loadError.message))
    return () => { active = false }
  }, [tripId, username])

  useEffect(() => {
    if (!trip) return undefined
    const unsubscribePlan = subscribeToPublicPlanItems(trip.id, setPlanItems, (nextError) => setError(nextError.message))
    const unsubscribeExpenses = subscribeToPublicTripExpenses(trip.id, setExpenses, (nextError) => setError(nextError.message))
    return () => {
      unsubscribePlan()
      unsubscribeExpenses()
    }
  }, [trip])

  if (error) return <ErrorMessage message={error} />
  if (!trip || !profile) return <LoadingScreen label="Gezi yükleniyor…" />

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">@{profile.username}</p>
      <h1 className="mt-2 text-5xl font-black tracking-tight">{trip.name}</h1>
      <p className="mt-3 text-lg text-slate-500">{trip.locationName}</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-2xl font-black">Herkese açık plan</h2>
          <div className="mt-4 space-y-3">
            {planItems.map((item) => {
              const time = formatPlanTime(item.time)
              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-black">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{time.start}{time.end ? ` → ${time.end}` : ''}</p>
                  <div className="mt-3"><PlaceDetails location={item.location} compact /></div>
                </article>
              )
            })}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black">Paylaşılan Harcamalar</h2>
          <div className="mt-4 space-y-3">
            {expenses.map((expense) => (
              <article key={expense.id} className="flex justify-between rounded-2xl bg-amber-100 p-5">
                <span className="font-bold">{expense.title}</span>
                <span className="font-black">{Number(expense.amount).toLocaleString('tr-TR')} {expense.currency}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
