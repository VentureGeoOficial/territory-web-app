import { Store } from 'lucide-react'

export function StoreHeroSection() {
  return (
    <section
      className="relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-6 md:p-8 animate-in fade-in duration-500"
      aria-labelledby="loja-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(to right, oklch(0.88 0.25 120 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.88 0.25 120 / 0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Store className="h-4 w-4" aria-hidden />
          Parceiros esportivos
        </div>
        <h1 id="loja-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Loja
        </h1>
        <p className="mt-2 text-sm font-medium text-accent md:text-base">
          Parceiros e patrocinadores esportivos da comunidade.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Descubra marcas, lojas e academias que apoiam o movimento. Patrocinadores,
          cupons e vitrines premium chegam em breve — sua marca pode estar aqui.
        </p>
      </div>
    </section>
  )
}
