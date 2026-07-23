import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import { normalizeUsername } from '../domain/username'

export async function getProfileByUsername(username) {
  const profileQuery = query(
    collection(db, 'profiles'),
    where('username', '==', normalizeUsername(username)),
  )
  const snapshot = await getDocs(profileQuery)
  if (snapshot.empty) return null
  const profile = snapshot.docs[0]
  return { id: profile.id, ...profile.data() }
}

export async function getPublicTripsForProfile(userId) {
  const tripsQuery = query(
    collection(db, 'trips'),
    where('memberIds', 'array-contains', userId),
    where('visibility', '==', 'profile'),
    where('status', '==', 'active'),
  )
  const snapshot = await getDocs(tripsQuery)
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}
