import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { firebaseApp } from './app'

export const db = getFirestore(firebaseApp)

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
