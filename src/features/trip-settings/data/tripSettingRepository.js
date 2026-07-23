import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firestoreClient'

function settingReference(tripId, userId) {
  return doc(db, 'tripSettings', `${tripId}_${userId}`)
}

export function subscribeToTripSetting(tripId, userId, callback, onError = console.error) {
  return onSnapshot(
    settingReference(tripId, userId),
    (snapshot) => callback(snapshot.exists() ? snapshot.data() : null),
    onError,
  )
}

export function saveTripSetting(tripId, userId, setting) {
  return setDoc(settingReference(tripId, userId), {
    tripId,
    userId,
    preferredCurrency: setting.preferredCurrency.trim().toUpperCase(),
    dailyBudget: Number(setting.dailyBudget || 0),
    privateNotes: setting.privateNotes.trim(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
