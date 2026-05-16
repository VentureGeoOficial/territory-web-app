import { LegalDocument } from '@/components/legal/legal-document'
import { LegalPageShell } from '@/components/legal/legal-page-shell'
import { LEGAL_VERSION } from '@/lib/app-info'
import { PRIVACY_SECTIONS } from '@/lib/legal/content'
import { sanitizeReturnTo } from '@/lib/legal/return-to'

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>
}

export default async function PrivacidadePage({ searchParams }: PageProps) {
  const params = await searchParams
  const returnTo = sanitizeReturnTo(params.returnTo)

  return (
    <LegalPageShell
      pageTitle="Política de Privacidade"
      returnTo={returnTo}
      crossLink={{ href: '/termos', label: 'Termos de Uso' }}
    >
      <LegalDocument
        title="Política de Privacidade"
        version={LEGAL_VERSION}
        sections={PRIVACY_SECTIONS}
      />
    </LegalPageShell>
  )
}
