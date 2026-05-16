import type { LegalSection } from '@/lib/legal/content'
import { LEGAL_UI_LABELS } from '@/lib/legal/ui-labels'
import { cn } from '@/lib/utils'

export function LegalDocument({
  title,
  version,
  updatedAt = LEGAL_UI_LABELS.defaultUpdatedAt,
  sections,
  className,
}: {
  title: string
  version: string
  updatedAt?: string
  sections: LegalSection[]
  className?: string
}) {
  return (
    <article className={cn('space-y-6', className)}>
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {LEGAL_UI_LABELS.versionPrefix} {version} {LEGAL_UI_LABELS.metadataSeparator}{' '}
          {LEGAL_UI_LABELS.lastUpdatedPrefix} {updatedAt}
        </p>
        <p className="text-xs text-muted-foreground">{LEGAL_UI_LABELS.draftNotice}</p>
      </header>

      <nav
        aria-label={LEGAL_UI_LABELS.indexAriaLabel}
        className="rounded-lg border border-border bg-muted/30 p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {LEGAL_UI_LABELS.indexTitle}
        </p>
        <ol className="space-y-1 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-primary hover:underline underline-offset-4"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}
