/**
 * Popula `sponsors` com entradas de demonstração (comingSoon).
 * Uso: npx tsx scripts/seed-sponsors.ts
 * Requer FIREBASE_SERVICE_ACCOUNT_JSON no ambiente.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { SponsorFirestoreDoc } from '../lib/sponsors/types'

const SPONSORS = 'sponsors'

function log(
  level: 'INFO' | 'CRITICAL',
  event: string,
  ctx: Record<string, unknown>,
): void {
  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      scope: 'sponsors_seed',
      event,
      ...ctx,
    }),
  )
}

const SEED: Array<{ id: string; doc: SponsorFirestoreDoc }> = [
  {
    id: 'coming-soon-1',
    doc: {
      name: 'Equipamento esportivo',
      category: 'Running',
      description:
        'Tênis, vestuário e acessórios para corrida de rua — parceria em negociação.',
      tags: ['tênis', 'running'],
      status: 'comingSoon',
      featured: true,
      order: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'coming-soon-2',
    doc: {
      name: 'Suplementação',
      category: 'Nutrição',
      description: 'Energia e recuperação para quem domina território todos os dias.',
      tags: ['suplementos', 'performance'],
      status: 'comingSoon',
      featured: false,
      order: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'coming-soon-3',
    doc: {
      name: 'Academia & treino',
      category: 'Fitness',
      description: 'Planos e benefícios exclusivos para a comunidade What You.',
      tags: ['academia', 'treino'],
      status: 'comingSoon',
      featured: false,
      order: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'coming-soon-4',
    doc: {
      name: 'Marca esportiva',
      category: 'Lifestyle',
      description: 'Vestuário urbano e performance para corredores urbanos.',
      tags: ['moda', 'street'],
      status: 'comingSoon',
      featured: false,
      order: 4,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
]

async function main() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!json) {
    log('CRITICAL', 'sponsors_seed_missing_credentials', {})
    process.exit(1)
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(JSON.parse(json)) })
  }

  const db = getFirestore()
  log('INFO', 'sponsors_seed_started', { count: SEED.length })

  const batch = db.batch()
  for (const { id, doc } of SEED) {
    batch.set(db.collection(SPONSORS).doc(id), doc, { merge: true })
  }
  await batch.commit()

  log('INFO', 'sponsors_seed_completed', { written: SEED.length })
}

main().catch((e) => {
  log('CRITICAL', 'sponsors_seed_failed', {
    message: e instanceof Error ? e.message : 'unknown',
  })
  process.exit(1)
})
