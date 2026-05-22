import { Code2 } from 'lucide-react'

type TeamHeaderProps = {
  className?: string
}

export function TeamHeader({ className }: TeamHeaderProps) {
  return (
    <div className={className}>
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          <Code2 className="h-4 w-4" aria-hidden />
          Equipe de desenvolvimento
        </div>

        <h2
          id="team-heading"
          className="mb-4 text-balance text-3xl font-bold text-foreground md:text-5xl"
        >
          Desenvolvido por
        </h2>

        <p className="text-lg leading-relaxed text-muted-foreground">
          Conheça quem constrói o TerritoryRun com foco em produto, performance e experiência
          digital de alto nível.
        </p>
      </div>
    </div>
  )
}
