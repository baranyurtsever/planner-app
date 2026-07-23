import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { auth } from '../../../infrastructure/firebase/authClient'
import { db } from '../../../infrastructure/firebase/firestoreClient'
import { normalizeUsername } from '../../profile/domain/username'

export async function register({ email, password, displayName, username }) {
  const normalizedUsername = normalizeUsername(username)
  const credential = await createUserWithEmailAndPassword(auth, email, password)

  try {
    await runTransaction(db, async (transaction) => {
      const usernameRef = doc(db, 'usernames', normalizedUsername)
      const usernameSnapshot = await transaction.get(usernameRef)

      if (usernameSnapshot.exists()) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor.')
      }

      transaction.set(usernameRef, { uid: credential.user.uid })
      transaction.set(doc(db, 'profiles', credential.user.uid), {
        username: normalizedUsername,
        displayName: displayName.trim(),
        bio: '',
        photoURL: '',
        createdAt: serverTimestamp(),
      })
      transaction.set(doc(db, 'accounts', credential.user.uid), {
        email: credential.user.email,
        createdAt: serverTimestamp(),
      })
    })

    await updateProfile(credential.user, { displayName: displayName.trim() })
    return credential.user
  } catch (error) {
    await deleteUser(credential.user)
    throw error
  }
}

export async function login({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export function logout() {
  return signOut(auth)
}
