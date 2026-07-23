import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorMessage, LoadingScreen } from '../../../shared/components/Feedback'
import { PublicProfileView } from '../components/PublicProfileView'
import { getProfileByUsername, getPublicTripsForProfile } from '../data/profileRepository'

export function PublicProfilePage() {
  const { username } = useParams()
  const [state, setState] = useState({ loading: true, profile: null, trips: [], error: '' })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const profile = await getProfileByUsername(username)
        if (!profile) throw new Error('Profil bulunamadı.')
        const trips = await getPublicTripsForProfile(profile.id)
        if (active) setState({ loading: false, profile, trips, error: '' })
      } catch (error) {
        if (active) setState({ loading: false, profile: null, trips: [], error: error.message })
      }
    }
    load()
    return () => { active = false }
  }, [username])

  if (state.loading) return <LoadingScreen label="Profil yükleniyor…" />
  if (state.error) return <ErrorMessage message={state.error} />
  return <PublicProfileView profile={state.profile} trips={state.trips} />
}
