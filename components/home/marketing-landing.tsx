import Link from 'next/link'
import { VentureGeoBrandLogo, VentureGeoMascot } from '@/components/brand/venture-geo-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Map, Trophy, Users, Zap, ArrowRight, MapPin } from 'lucide-react'

export function MarketingLanding() {
  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <VentureGeoBrandLogo height={52} priority />
              <span className="text-xl font-bold text-foreground">TerritoryRun</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" className="border-border shadow-xs">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Abrir conta
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-center xl:gap-10 py-16">
            <div className="max-w-3xl mx-auto text-center flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Zap className="h-4 w-4" />
                Gamificacao de Corrida e Caminhada
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Conquiste seu{' '}
                <span className="text-primary">Caminho</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
                Transforme suas corridas e caminhadas em conquistas territoriais.
                Corra, desenhe seu territorio no mapa e compete com amigos pela maior area.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cadastro">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Começar agora
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14" asChild>
                  <Link href="#como-funciona">Como funciona</Link>
                </Button>
              </div>

              <div className="mt-10 hidden md:flex xl:hidden justify-center">
                <VentureGeoMascot height={130} className="opacity-80" />
              </div>
            </div>

            <div className="hidden xl:flex shrink-0 justify-center pb-2">
              <VentureGeoMascot height={210} className="opacity-[0.88]" />
            </div>
          </div>
        </div>
      </header>

      <section id="como-funciona" className="py-20 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma nova forma de gamificar suas atividades fisicas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Corra e conquiste
              </h3>
              <p className="text-muted-foreground">
                Cada corrida ou caminhada desenha um territorio no mapa.
                Forme um loop fechado para conquistar a area.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Suba no ranking
              </h3>
              <p className="text-muted-foreground">
                Quanto maior sua area total conquistada, mais alto seu ranking.
                Evolua de Bronze ate Diamante.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Dispute territorios
              </h3>
              <p className="text-muted-foreground">
                Invada territorios de outros jogadores para disputa-los.
                Proteja suas conquistas correndo mais.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-card to-secondary/30 border-border text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para conquistar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Crie sua conta ou entre para acessar o mapa, ranking e trofeus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 h-14"
                >
                  <Map className="mr-2 h-5 w-5" />
                  Criar conta
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14">
                  Entrar
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">TerritoryRun</span>
            <span className="text-muted-foreground text-sm">by Venture Geo</span>
          </div>
          <p className="text-sm text-muted-foreground">Conquiste seu caminho</p>
        </div>
      </footer>
    </div>
  )
}
