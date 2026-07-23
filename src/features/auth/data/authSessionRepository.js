import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../infrastructure/firebase/authClient'

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback)
}
