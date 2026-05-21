'use client'

import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SPONSOR_CONTACT_EMAIL, SPONSOR_STARTING_PRICE } from '@/lib/loja/constants'
import { trackLojaCta } from '@/components/loja/track-loja-cta'

export function PartnerHighlight() {
  const mailtoHref = `mailto:${SPONSOR_CONTACT_EMAIL}?subject=Patrocínio%20TerritoryRun`

  return (
    <section className="animate-in fade-in duration-500 delay-150" aria-labelledby="highlight-heading">
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-6 text-primary-foreground md:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accent/10 blur-[120px]" aria-hidden />
        <div className="relative z-10">
          <div className="mb-4 flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground/20">
              <Megaphone className="h-5 w-5 text-primary-foreground" aria-hidden />
            </div>
            <span className="text-sm font-semibold text-accent">Seja um patrocinador</span>
          </div>

          <h2 id="highlight-heading" className="mb-3 text-2xl font-bold md:text-3xl">
            Sua marca aqui
          </h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-primary-foreground/90 md:text-base">
            Anuncie no TerritoryRun e conecte-se a corredores, atletas urbanos e uma comunidade
            altamente engajada. O app permanece gratuito — abrimos espaço para parceiros esportivos.
          </p>

          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/20 p-5 backdrop-blur-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
              Pacotes a partir de
            </p>
            <p className="text-2xl font-bold text-accent md:text-3xl">
              {SPONSOR_STARTING_PRICE}
              <span className="text-base font-medium text-primary-foreground/80">/mês</span>
            </p>
            <p className="mt-2 text-sm text-primary-foreground/90">
              Espaços para logos, banners, cupons e campanhas integradas à experiência gamificada.
            </p>
          </div>

          <Link
            href={mailtoHref}
            onClick={() => trackLojaCta('anunciar', 'highlight')}
            aria-label={`Enviar e-mail para patrocínio — ${SPONSOR_CONTACT_EMAIL}`}
          >
            <Button
              size="lg"
              className="h-12 w-full bg-accent px-6 text-base font-bold text-accent-foreground shadow-lg shadow-accent/30 hover:bg-accent/90 md:w-auto"
            >
              Anunciar a partir de {SPONSOR_STARTING_PRICE}
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  )
}
