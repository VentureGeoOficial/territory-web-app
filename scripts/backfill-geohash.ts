/**
 * Backfill `geohash` e `geohashPrefix` em territórios existentes.
 * Uso: npx tsx scripts/backfill-geohash.ts
 * Requer FIREBASE_SERVICE_ACCOUNT_JSON no ambiente.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { geohashFieldsFromCenter } from '../lib/firebase/territory-doc'

async function main() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!json) {
    console.error('Defina FIREBASE_SERVICE_ACCOUNT_JSON')
    process.exit(1)
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(JSON.parse(json)) })
  }

  const db = getFirestore()
  const snap = await db.collection('territories').get()
  let updated = 0

  const batchSize = 400
  let batch = db.batch()
  let ops = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    if (data.geohashPrefix && data.geohash) continue

    const lat = Number(data.centerLat)
    const lng = Number(data.centerLng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

    const { geohash, geohashPrefix } = geohashFieldsFromCenter(lat, lng)
    batch.update(doc.ref, { geohash, geohashPrefix })
    ops++
    updated++

    if (ops >= batchSize) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()
  console.info(`Backfill concluído: ${updated} documentos actualizados.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
