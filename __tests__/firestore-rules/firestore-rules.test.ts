import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  const rulesPath = join(process.cwd(), 'firestore.rules')
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-territory-rules',
    firestore: {
      rules: readFileSync(rulesPath, 'utf8'),
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('Firestore rules v2', () => {
  it('bloqueia forja de xp em users', async () => {
    const ctx = testEnv.authenticatedContext('u1')
    const db = ctx.firestore()
    await assertSucceeds(
      setDoc(doc(db, 'users', 'u1'), {
        displayName: 'A',
        email: 'a@a.com',
        color: '#fff',
        xp: 0,
        totalAreaM2: 0,
        territoriesCount: 0,
        createdAt: { seconds: 1, nanoseconds: 0 },
        updatedAt: { seconds: 1, nanoseconds: 0 },
      }),
    )
    await assertFails(
      updateDoc(doc(db, 'users', 'u1'), {
        xp: 999999,
        updatedAt: { seconds: 2, nanoseconds: 0 },
      }),
    )
  })

  it('impede auto-aceitação de pedido de amizade', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const bob = testEnv.authenticatedContext('bob')
    const aliceDb = alice.firestore()
    const bobDb = bob.firestore()

    const ref = await assertSucceeds(
      addDoc(collection(aliceDb, 'friendRequests'), {
        fromUserId: 'alice',
        toUserId: 'bob',
        status: 'pending',
        createdAt: Date.now(),
      }),
    )

    await assertFails(
      updateDoc(ref, {
        status: 'accepted',
      }),
    )

    await assertSucceeds(
      updateDoc(doc(bobDb, 'friendRequests', ref.id), {
        status: 'accepted',
      }),
    )
  })

  it('nega escrita cliente em territories', async () => {
    const ctx = testEnv.authenticatedContext('u1')
    const db = ctx.firestore()
    await assertFails(
      setDoc(doc(db, 'territories', 't1'), {
        userId: 'u1',
        userName: 'X',
        userColor: '#fff',
        polygonJson: '{}',
        areaM2: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 'active',
        dominanceLevel: 'bronze',
        conquestCount: 1,
        centerLng: -46.3,
        centerLat: -23.6,
      }),
    )
  })

  it('nega escrita cliente em runs', async () => {
    const ctx = testEnv.authenticatedContext('u1')
    const db = ctx.firestore()
    await assertFails(
      setDoc(doc(db, 'runs', 'r1'), {
        userId: 'u1',
        territoryId: 't1',
        startedAt: 1,
        endedAt: 2,
        distanceMeters: 1,
        durationSeconds: 1,
        areaM2: 1,
        xpGained: 1,
        routeJson: '[]',
        createdAt: { seconds: 1, nanoseconds: 0 },
      }),
    )
  })

  it('usernames só permite uid e createdAt', async () => {
    const ctx = testEnv.authenticatedContext('u1')
    const db = ctx.firestore()
    const slug = `valid_slug_${Date.now()}`
    await assertFails(
      setDoc(doc(db, 'usernames', slug), {
        uid: 'u1',
        email: 'leak@example.com',
        createdAt: Date.now(),
      }),
    )
    await assertSucceeds(
      setDoc(doc(db, 'usernames', slug), {
        uid: 'u1',
        createdAt: Date.now(),
      }),
    )
  })
})
