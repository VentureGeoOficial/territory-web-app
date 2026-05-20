import {
  collection,
  onSnapshot,
  query,
  where,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import { log } from '@/lib/logging/logger'
import type { Sponsor, SponsorFirestoreDoc, SponsorStatus } from '@/lib/sponsors/types'
import { sortSponsors } from '@/lib/sponsors/utils'

const SPONSORS = 'sponsors'

const VISIBLE_STATUSES: SponsorStatus[] = ['active', 'comingSoon']

function mapSnapToSponsors(snap: QuerySnapshot): Sponsor[] {
  const list: Sponsor[] = []
  snap.forEach((d) => {
    const data = d.data() as SponsorFirestoreDoc
    list.push({
      id: d.id,
      name: String(data.name ?? ''),
      category: String(data.category ?? ''),
      description: String(data.description ?? ''),
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      ctaUrl: data.ctaUrl,
      ctaLabel: data.ctaLabel,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      status: data.status === 'active' ? 'active' : 'comingSoon',
      featured: Boolean(data.featured),
      order: Number(data.order ?? 0),
      createdAt: Number(data.createdAt ?? 0),
      updatedAt: Number(data.updatedAt ?? 0),
    })
  })
  sortSponsors(list)
  return list
}

/**
 * Escuta patrocinadores visíveis (`active` | `comingSoon`), ordenados no cliente.
 */
export function subscribeSponsors(
  onUpdate: (sponsors: Sponsor[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) {
    onUpdate([])
    return () => {}
  }

  log.info({
    scope: 'sponsors',
    event: 'sponsors_subscribed',
  })

  const db = getFirestoreDb()
  const q = query(
    collection(db, SPONSORS),
    where('status', 'in', VISIBLE_STATUSES),
  )

  return onSnapshot(
    q,
    (snap) => {
      const list = mapSnapToSponsors(snap)
      log.info({
        scope: 'sponsors',
        event: 'sponsors_received',
        count: list.length,
      })
      onUpdate(list)
    },
    (err) => {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code)
          : undefined
      log.error({
        scope: 'sponsors',
        event: 'sponsors_error',
        code,
        message: err.message,
      })
      onError?.(err)
    },
  )
}
