'use client'

import Image from 'next/image'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { VentureGeoBrandLogo } from '@/components/brand/venture-geo-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowRight,
  BarChart3,
  Download,
  Eye,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Lightbulb,
  Mail,
  Map,
  MapPin,
  Megaphone,
  Route,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import speedMascot from '@/IMG/speed-mascote.png'
import { useInstallPrompt } from '@/lib/pwa/use-install-prompt'

const appHighlights = [
  {
    icon: Target,
    title: 'Motivação territorial',
    description:
      'Transforme cada corrida ou caminhada em uma conquista visível no mapa. Seu território cresce conforme você se move.',
  },
  {
    icon: BarChart3,
    title: 'Métricas inteligentes',
    description:
      'Acompanhe distância, ritmo, calorias, área conquistada e evolução de desempenho com leitura clara e acionável.',
  },
  {
    icon: Users,
    title: 'Competição social',
    description:
      'Dispute territórios com amigos e atletas da sua região, acompanhe rankings e defenda suas conquistas.',
  },
  {
    icon: Trophy,
    title: 'Sistema de ligas',
    description:
      'Evolua por ligas, desbloqueie conquistas e mantenha a motivação com objetivos competitivos de longo prazo.',
  },
]

const journeySteps = [
  {
    icon: MapPin,
    title: 'Corra e conquiste',
    description:
      'Inicie uma atividade, percorra seu trajeto e forme áreas estratégicas para conquistar território no mapa.',
  },
  {
    icon: Trophy,
    title: 'Suba no ranking',
    description:
      'Quanto maior sua consistência e área conquistada, maior sua posição nas disputas e nas ligas.',
  },
  {
    icon: Users,
    title: 'Dispute territórios',
    description:
      'Invada áreas, proteja suas conquistas e transforme a cidade em uma arena de movimento real.',
  },
]

const appFeatures = [
  {
    icon: Route,
    title: 'GPS de alta precisão',
    description: 'Mapeamento em tempo real para rotas, territórios e atividades ao ar livre.',
  },
  {
    icon: Shield,
    title: 'Disputas territoriais',
    description: 'Mecânica competitiva baseada em presença, estratégia e performance física.',
  },
  {
    icon: Smartphone,
    title: 'App progressivo (PWA)',
    description: 'Instale direto no celular, sem app store, com experiência rápida e responsiva.',
  },
  {
    icon: Globe,
    title: 'Ranking global',
    description: 'Compare resultados, avance nas ligas e acompanhe a evolução da comunidade.',
  },
]

const ventureGeoPillars = [
  {
    icon: Lightbulb,
    title: 'A empresa',
    description:
      'A VentureGeo desenvolve experiências digitais que conectam geotecnologia, movimento humano e inteligência territorial.',
  },
  {
    icon: Sparkles,
    title: 'Significado do nome VentureGeo',
    description:
      'Venture traduz aventura, avanço e exploração. Geo representa território, localização e dados espaciais. Juntos, os termos definem uma marca feita para transformar deslocamento em conquista.',
  },
  {
    icon: Users,
    title: 'Quem somos?',
    description:
      'Somos uma equipe orientada por produto, dados e experiência do usuário, dedicada a criar uma nova relação entre pessoas, cidade e tecnologia.',
  },
]

const missionVisionValues = [
  {
    icon: Target,
    title: 'Missão',
    description:
      'Transformar movimento em conquista, incentivando saúde, competição saudável e engajamento urbano por meio de geolocalização precisa.',
  },
  {
    icon: Eye,
    title: 'Visão',
    description:
      'Ser referência latino-americana em real-life gaming, redefinindo como pessoas exploram, competem e interagem com espaços físicos.',
  },
  {
    icon: Heart,
    title: 'Valores',
    description:
      'Inovação, transparência, segurança, excelência técnica, impacto positivo e respeito à privacidade geográfica dos usuários.',
  },
]

const mascotTraits = [
  {
    icon: Zap,
    title: 'Movimento',
    description:
      'Speed representa energia, agilidade e a vontade de seguir adiante em cada trajeto.',
  },
  {
    icon: Trophy,
    title: 'Superação e conquista',
    description:
      'Ele simboliza a evolução diária: correr mais, explorar melhor e vencer novos desafios.',
  },
  {
    icon: Map,
    title: 'Competição territorial',
    description:
      'Com mapa em mãos, Speed traduz a essência do TerritoryRun: transformar a cidade em jogo.',
  },
]

const footerSections = [
  {
    title: 'Aplicativo',
    links: [
      { label: 'Por que TerritoryRun', href: '#por-que-territoryrun' },
      { label: 'Como funciona', href: '#como-funciona' },
      { label: 'Recursos do app', href: '#recursos' },
      { label: 'Patrocínios e anúncios', href: '#patrocinios' },
    ],
  },
  {
    title: 'VentureGeo',
    links: [
      { label: 'Sobre a VentureGeo', href: '#quem-somos' },
      { label: 'Mascote Speed', href: '#mascote-speed' },
      { label: 'Criar conta', href: '/cadastro' },
      { label: 'Entrar', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Contato', href: 'mailto:contato@venturegeo.com.br' },
    ],
  },
]

function trackLandingCta(action: string, section: string) {
  track('landing_cta_click', {
    action,
    section,
    feature: 'MarketingLanding',
  })
}

function SpeedImage({
  alt = '',
  className,
  height = 320,
  priority = false,
}: {
  alt?: string
  className?: string
  height?: number
  priority?: boolean
}) {
  const width = Math.round(height * 1.6)

  return (
    <Image
      src={speedMascot}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      aria-hidden={alt ? undefined : true}
    />
  )
}

export function MarketingLanding() {
  const { canInstall, promptInstall } = useInstallPrompt()

  const handleInstallClick = (section: string) => {
    trackLandingCta('instalar_app', section)
    promptInstall()
  }

  return (
    <div className="min-h-screen bg-background">
      <header
        id="sobre-aplicativo"
        className="relative flex min-h-[92vh] flex-col overflow-hidden scroll-mt-20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/15 blur-[150px]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6">
          <nav className="mb-10 flex items-center justify-between gap-4 md:mb-16">
            <VentureGeoBrandLogo height={48} priority />
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/login" onClick={() => trackLandingCta('ja_tenho_conta', 'nav')}>
                <Button variant="outline" className="border-border/60 shadow-xs hover:bg-secondary">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro" onClick={() => trackLandingCta('criar_conta', 'nav')}>
                <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">
                  Criar conta
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              {canInstall && (
                <Button
                  type="button"
                  variant="ghost"
                  className="hidden gap-2 lg:inline-flex"
                  onClick={() => handleInstallClick('nav')}
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </Button>
              )}
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Gamificação de corrida e caminhada
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold leading-[1.1] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Pronto para <span className="text-primary">conquistar</span> novos territórios?
              </h1>

              <p className="mx-auto mb-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl lg:mx-0">
                O TerritoryRun transforma corrida e caminhada em uma experiência competitiva de
                geolocalização. Mova-se, desenhe seu território no mapa e dispute conquistas com a
                comunidade.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/cadastro" onClick={() => trackLandingCta('comecar_agora', 'hero')}>
                  <Button
                    size="lg"
                    className="h-14 w-full bg-primary px-8 text-lg text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 sm:w-auto"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Começar agora
                  </Button>
                </Link>
                <Link href="/login" onClick={() => trackLandingCta('ja_tenho_conta', 'hero')}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 w-full border-border/60 px-8 text-lg sm:w-auto"
                  >
                    Já tenho conta
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 w-full px-8 text-lg sm:w-auto"
                  asChild
                >
                  <Link href="#por-que-territoryrun" onClick={() => trackLandingCta('saiba_mais', 'hero')}>
                    Saiba mais
                  </Link>
                </Button>
              </div>

              {canInstall && (
                <Button
                  type="button"
                  size="lg"
                  variant="ghost"
                  className="mt-4 h-14 w-full text-lg sm:hidden"
                  onClick={() => handleInstallClick('hero_mobile')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Instalar app
                </Button>
              )}

              <div className="mt-10 grid grid-cols-3 gap-4 text-center lg:max-w-lg lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-primary md:text-3xl">100%</p>
                  <p className="text-sm text-muted-foreground">gratuito</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent md:text-3xl">PWA</p>
                  <p className="text-sm text-muted-foreground">sem app store</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground md:text-3xl">GPS</p>
                  <p className="text-sm text-muted-foreground">alta precisão</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-[90px]" />
                <SpeedImage
                  alt="Speed, mascote explorador da VentureGeo segurando um mapa digital"
                  height={420}
                  priority
                  className="relative z-10 h-auto w-full max-w-[360px] drop-shadow-2xl md:max-w-[440px]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="por-que-territoryrun" className="relative scroll-mt-20 px-4 py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
                <Target className="h-4 w-4" />
                Sobre o aplicativo
              </div>
              <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-5xl">
                Por que <span className="text-primary">TerritoryRun</span>?
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Uma landing moderna precisa explicar valor rapidamente. Aqui, o valor é simples:
                transformar atividade física em território, progresso e competição social.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {appHighlights.map((highlight) => (
                <Card
                  key={highlight.title}
                  className="group border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 transition-transform duration-300 group-hover:scale-110">
                    <highlight.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{highlight.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{highlight.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="relative scroll-mt-20 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Map className="h-4 w-4" />
                Como funciona
              </div>
              <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-5xl">
                Três passos para sair do treino comum
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                A experiência combina movimento real, leitura territorial e progressão competitiva.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {journeySteps.map((step, index) => (
                <Card
                  key={step.title}
                  className="group relative overflow-hidden border-border/60 bg-card/80 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="absolute right-4 top-4 text-6xl font-bold text-primary/10 transition-colors group-hover:text-primary/20">
                    {index + 1}
                  </div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="recursos" className="relative scroll-mt-20 px-4 py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Smartphone className="h-4 w-4" />
                Recursos do app
              </div>
              <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-5xl">
                Tecnologia de <span className="text-primary">ponta</span> no seu bolso
              </h2>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                O TerritoryRun foi pensado para ser rápido, acessível e competitivo desde o
                primeiro acesso, com recursos que ampliam engajamento e retenção.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {appFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-4 rounded-xl border border-border/40 bg-card/60 p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card
              id="patrocinios"
              className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-8 text-primary-foreground md:p-10"
            >
              <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-accent/10 blur-[140px]" />
              <div className="relative z-10">
                <div className="mb-6 flex w-fit items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/20">
                    <Megaphone className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-accent">Patrocínios e anúncios</span>
                </div>

                <h3 className="mb-5 text-balance text-3xl font-bold md:text-4xl">
                  Conecte sua marca ao movimento
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-primary-foreground/90">
                  O aplicativo permanece gratuito para usuários e abre espaço para marcas que
                  desejam falar com um público ativo, urbano e altamente engajado.
                </p>

                <div className="mb-8 rounded-lg border border-accent/30 bg-accent/20 p-6 backdrop-blur-sm">
                  <p className="mb-2 text-sm font-semibold text-accent">PACOTES A PARTIR DE:</p>
                  <p className="mb-2 text-3xl font-bold text-accent">
                    R$ 49,99<span className="text-lg text-primary-foreground/80">/mês</span>
                  </p>
                  <p className="text-sm text-primary-foreground/90">
                    Espaços estratégicos para anúncios e patrocínios integrados à experiência
                    gamificada.
                  </p>
                </div>

                <Link
                  href="mailto:patrocinio@venturegeo.com.br"
                  onClick={() => trackLandingCta('anunciar', 'patrocinios')}
                >
                  <Button
                    size="lg"
                    className="h-14 w-full bg-accent px-8 text-lg font-bold text-accent-foreground shadow-lg shadow-accent/30 hover:bg-accent/90 md:w-auto"
                  >
                    Anunciar a partir de R$ 49,99
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        <section id="quem-somos" className="relative scroll-mt-20 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 grid items-end gap-8 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Lightbulb className="h-4 w-4" />
                  Sobre a VentureGeo
                </div>
                <h2 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
                  Inovação, território e movimento em uma só marca
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                A VentureGeo nasce para criar produtos digitais que tornam a relação com a cidade
                mais inteligente, ativa e memorável. O TerritoryRun é a expressão prática dessa
                visão: tecnologia geoespacial aplicada à motivação humana.
              </p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-3">
              {ventureGeoPillars.map((pillar) => (
                <Card
                  key={pillar.title}
                  className="border-border/60 bg-card/80 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                    <pillar.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{pillar.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{pillar.description}</p>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {missionVisionValues.map((item) => (
                <Card
                  key={item.title}
                  className="group border-border/60 bg-card/80 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 transition-transform duration-300 group-hover:scale-110">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">{item.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="mascote-speed"
          className="relative scroll-mt-20 bg-gradient-to-b from-background via-secondary/20 to-background px-4 py-20 md:py-28"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
            <div className="order-2 flex justify-center md:order-1">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 to-accent/15 blur-[100px]" />
                <SpeedImage
                  alt="Speed, mascote explorador da VentureGeo"
                  height={420}
                  className="relative z-10 h-auto w-full max-w-[420px] drop-shadow-2xl"
                />
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Mascote Speed
              </div>

              <h2 className="mb-6 text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Speed é o símbolo da nossa energia competitiva
              </h2>

              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Speed é a raposa exploradora da VentureGeo. Ele representa velocidade, inteligência
                e espírito de conquista, conectando a marca ao movimento, à superação e à competição
                territorial que impulsionam o TerritoryRun.
              </p>

              <div className="mb-10 space-y-4">
                {mascotTraits.map((trait) => (
                  <div key={trait.title} className="flex items-start gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <trait.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-foreground">{trait.title}</h3>
                      <p className="leading-relaxed text-muted-foreground">{trait.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/cadastro" onClick={() => trackLandingCta('comecar_com_speed', 'mascote_speed')}>
                <Button
                  size="lg"
                  className="h-14 bg-primary px-8 text-lg text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                >
                  Começar com o Speed
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative mx-auto max-w-4xl">
            <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-secondary/40 p-8 text-center md:p-16">
              <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-[60px]" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-accent/10 blur-[80px]" />

              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <SpeedImage height={96} className="h-auto w-24 opacity-90" />
                </div>

                <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-5xl">
                  Pronto para <span className="text-primary">conquistar</span>?
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Crie sua conta gratuita, entre no mapa e comece a transformar cada treino em
                  território conquistado.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/cadastro" onClick={() => trackLandingCta('criar_conta', 'cta_final')}>
                    <Button
                      size="lg"
                      className="h-14 bg-primary px-10 text-lg text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                    >
                      <Map className="mr-2 h-5 w-5" />
                      Criar conta grátis
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => trackLandingCta('ja_tenho_conta', 'cta_final')}>
                    <Button size="lg" variant="outline" className="h-14 border-border/60 px-10 text-lg">
                      Já tenho conta
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/30 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-10 lg:grid-cols-[1.2fr_1.8fr]">
            <div>
              <VentureGeoBrandLogo height={42} />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Geotecnologia aplicada à performance humana. Uma marca criada para conectar
                movimento, dados e conquista territorial.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/venturegeooficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label="Instagram da VentureGeo"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61572058310239"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label="Facebook da VentureGeo"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contato@venturegeo.com.br"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label="Enviar email para VentureGeo"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-4 font-semibold text-foreground">{section.title}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="transition-colors hover:text-primary">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} VentureGeo. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Tecnologia brasileira para movimento, território e impacto.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
