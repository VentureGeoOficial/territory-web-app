import * as admin from 'firebase-admin'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'

admin.initializeApp()
const db = getFirestore()

const ACTIVE_MAX_MS = 24 * 60 * 60 * 1000
const BATCH_SAFE = 450

/**
 * A cada hora: territórios `active` com mais de 24h de vida passam a `expired`
 * e os agregados do dono são ajustados (área e contagem).
 */
export const expireStaleTerritories = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const now = Date.now()
    const cutoff = now - ACTIVE_MAX_MS

    const snap = await db
      .collection('territories')
      .where('status', '==', 'active')
      .where('createdAt', '<', cutoff)
      .get()

    if (snap.empty) return

    const ownerDeltas = new Map<string, { area: number; count: number }>()

    let batch = db.batch()
    let ops = 0

    for (const doc of snap.docs) {
      const data = doc.data()
      const ownerId = String(data.userId ?? '')
      const area = Number(data.areaM2 ?? 0)

      batch.update(doc.ref, { status: 'expired', updatedAt: now })
      ops++

      if (ownerId) {
        const prev = ownerDeltas.get(ownerId) ?? { area: 0, count: 0 }
        ownerDeltas.set(ownerId, {
          area: prev.area + area,
          count: prev.count + 1,
        })
      }

      if (ops >= BATCH_SAFE) {
        await batch.commit()
        batch = db.batch()
        ops = 0
      }
    }

    if (ops > 0) {
      await batch.commit()
    }

    let userBatch = db.batch()
    let userOps = 0

    for (const [ownerId, delta] of ownerDeltas) {
      const userRef = db.collection('users').doc(ownerId)
      const publicRef = db.collection('publicProfiles').doc(ownerId)

      userBatch.set(
        userRef,
        {
          totalAreaM2: FieldValue.increment(-delta.area),
          territoriesCount: FieldValue.increment(-delta.count),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      userOps++

      userBatch.set(
        publicRef,
        {
          totalAreaM2: FieldValue.increment(-delta.area),
          territoriesCount: FieldValue.increment(-delta.count),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      userOps++

      if (userOps >= BATCH_SAFE) {
        await userBatch.commit()
        userBatch = db.batch()
        userOps = 0
      }
    }

    if (userOps > 0) {
      await userBatch.commit()
    }
  },
)
