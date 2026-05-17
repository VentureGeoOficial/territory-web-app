import { NextResponse } from 'next/server'

import { getFirebaseAdminCredential } from '@/lib/config/firebase-admin-env'

/**
 * Verifica se o Admin SDK está configurado (sem expor credenciais).
 */
export async function GET() {
  try {
    getFirebaseAdminCredential()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.warn('[api/health/admin]', {
      event: 'admin_not_configured',
      reason: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json(
      { ok: false, code: 'missing_service_account' as const },
      { status: 503 },
    )
  }
}
