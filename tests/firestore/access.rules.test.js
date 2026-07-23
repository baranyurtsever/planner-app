import fs from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const projectId = 'demo-peregrin'
let testEnvironment

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  })
})

beforeEach(async () => {
  await testEnvironment.clearFirestore()
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'profiles', 'owner'), {
      username: 'owner',
      displayName: 'Gezi Sahibi',
    })
    await setDoc(doc(db, 'trips', 'public-trip'), {
      ownerId: 'owner',
      memberIds: ['owner', 'editor', 'viewer'],
      memberRoles: { owner: 'owner', editor: 'editor', viewer: 'viewer' },
      name: 'Bangkok',
      visibility: 'profile',
      status: 'active',
    })
    await setDoc(doc(db, 'trips', 'private-trip'), {
      ownerId: 'owner',
      memberIds: ['owner'],
      memberRoles: { owner: 'owner' },
      name: 'Gizli Gezi',
      visibility: 'private',
      status: 'active',
    })
    await setDoc(doc(db, 'expenses', 'profile-expense'), {
      ownerId: 'viewer',
      tripId: 'public-trip',
      visibility: 'profile',
      amount: 120,
    })
    await setDoc(doc(db, 'expenses', 'private-expense'), {
      ownerId: 'viewer',
      tripId: 'public-trip',
      visibility: 'private',
      amount: 80,
    })
  })
})

afterAll(async () => {
  await testEnvironment.cleanup()
})

describe('public reads', () => {
  it('allows anonymous visitors to read profiles and public trips', async () => {
    const db = testEnvironment.unauthenticatedContext().firestore()
    await assertSucceeds(getDoc(doc(db, 'profiles', 'owner')))
    await assertSucceeds(getDoc(doc(db, 'trips', 'public-trip')))
    await assertFails(getDoc(doc(db, 'trips', 'private-trip')))
    await assertSucceeds(getDoc(doc(db, 'expenses', 'profile-expense')))
    await assertFails(getDoc(doc(db, 'expenses', 'private-expense')))
  })
})

describe('profile integrity', () => {
  it('does not let a profile owner change a reserved username', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore()
    await assertFails(updateDoc(doc(db, 'profiles', 'owner'), { username: 'someone_else' }))
  })
})

describe('trip roles', () => {
  it('allows a participant to query their trips', async () => {
    const db = testEnvironment.authenticatedContext('viewer').firestore()
    const tripsQuery = query(
      collection(db, 'trips'),
      where('memberIds', 'array-contains', 'viewer'),
    )

    await assertSucceeds(getDocs(tripsQuery))
  })

  it('allows editors to update shared fields but not membership', async () => {
    const db = testEnvironment.authenticatedContext('editor').firestore()
    const ref = doc(db, 'trips', 'public-trip')

    await assertSucceeds(updateDoc(ref, { name: 'Bangkok ve Chiang Mai' }))
    await assertFails(updateDoc(ref, { memberIds: ['owner', 'editor'] }))
  })

  it('allows only owners to archive a trip', async () => {
    const editorDb = testEnvironment.authenticatedContext('editor').firestore()
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()

    await assertFails(updateDoc(doc(editorDb, 'trips', 'public-trip'), { status: 'archived' }))
    await assertSucceeds(updateDoc(doc(ownerDb, 'trips', 'public-trip'), { status: 'archived' }))
    await assertFails(updateDoc(doc(ownerDb, 'trips', 'public-trip'), { status: 'active' }))
  })
})

describe('user-owned expenses', () => {
  it('allows only the expense owner to update or delete it', async () => {
    const ownerDb = testEnvironment.authenticatedContext('owner').firestore()
    const expenseOwnerDb = testEnvironment.authenticatedContext('viewer').firestore()
    const refForOwner = doc(ownerDb, 'expenses', 'profile-expense')
    const refForExpenseOwner = doc(expenseOwnerDb, 'expenses', 'profile-expense')

    await assertFails(updateDoc(refForOwner, { amount: 1 }))
    await assertSucceeds(updateDoc(refForExpenseOwner, { amount: 150 }))
    await assertSucceeds(deleteDoc(refForExpenseOwner))
  })
})
