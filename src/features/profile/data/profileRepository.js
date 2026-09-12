import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
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

export async function getProfileById(userId) {
  const snapshot = await getDoc(doc(db, 'profiles', userId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function getPublicTripsForProfile(userId) {
  const snapshot = await getDocs(collection(db, 'profiles', userId, 'publicTrips'))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function getPublicTripForProfile(userId, tripId) {
  const snapshot = await getDoc(doc(db, 'profiles', userId, 'publicTrips', tripId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}
