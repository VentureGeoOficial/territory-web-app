import { LegalDocument } from '@/components/legal/legal-document'
import { LegalPageShell } from '@/components/legal/legal-page-shell'
import { LEGAL_VERSION } from '@/lib/app-info'
import { TERMS_SECTIONS } from '@/lib/legal/content'
import { sanitizeReturnTo } from '@/lib/legal/return-to'

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>
}

export default async function TermosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const returnTo = sanitizeReturnTo(params.returnTo)

  return (
    <LegalPageShell
      pageTitle="Termos de Uso"
      returnTo={returnTo}
      crossLink={{ href: '/privacidade', label: 'Política de Privacidade' }}
    >
      <LegalDocument
        title="Termos de Uso"
        version={LEGAL_VERSION}
        sections={TERMS_SECTIONS}
      />
    </LegalPageShell>
  )
}
