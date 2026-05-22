import { LayoutDashboard } from 'lucide-react'

interface DashboardHeaderProps {
  displayName?: string
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <section
      className="relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-6 md:p-8 animate-in fade-in duration-500"
      aria-labelledby="dashboard-heading"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <LayoutDashboard className="h-4 w-4" aria-hidden />
          Resumo esportivo
        </div>
        <h1 id="dashboard-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm font-medium text-accent md:text-base">
          Métricas, percursos e evolução da sua atividade.
        </p>
        {displayName && (
          <p className="mt-2 text-sm text-muted-foreground">
            Olá, <span className="font-medium text-foreground">{displayName}</span> — acompanhe seu
            desempenho no TerritoryRun.
          </p>
        )}
      </div>
    </section>
  )
}
