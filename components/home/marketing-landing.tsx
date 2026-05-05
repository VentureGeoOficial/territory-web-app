'use client'

import Link from 'next/link'
import { VentureGeoBrandLogo, VentureGeoMascot } from '@/components/brand/venture-geo-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Map, 
  Trophy, 
  Users, 
  Zap, 
  ArrowRight, 
  MapPin, 
  Download, 
  Target, 
  BarChart3, 
  Smartphone, 
  Route, 
  Shield, 
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Facebook,
  Lightbulb,
  Eye,
  Heart,
  Megaphone
} from 'lucide-react'
import { useInstallPrompt } from '@/lib/pwa/use-install-prompt'

const developers = [
  {
    name: 'Henrique',
    specialty: 'Especialista em Front-end e experiencia do usuario.',
    image: '/developers/henrique.jpeg',
  },
  {
    name: 'Leonardo',
    specialty: 'Especialista em Back-end e integracao de servicos.',
    image: '/developers/leonardo.jpeg',
  },
  {
    name: 'Marcelo',
    specialty: 'Especialista em IA aplicada e automacoes de produto.',
    image: '/developers/marcelo.jpeg',
  },
]

const benefits = [
  {
    icon: Target,
    title: 'Motivacao Territorial',
    description: 'Transforme cada corrida em uma conquista visivel no mapa. Veja seu territorio crescer a cada treino.',
  },
  {
    icon: BarChart3,
    title: 'Metricas Inteligentes',
    description: 'Acompanhe distancia, ritmo, calorias e area conquistada com analises detalhadas do seu desempenho.',
  },
  {
    icon: Users,
    title: 'Competicao Social',
    description: 'Dispute territorios com amigos e jogadores da sua regiao. Suba no ranking e defenda suas conquistas.',
  },
  {
    icon: Trophy,
    title: 'Sistema de Ligas',
    description: 'Evolua de Bronze ate Diamante. Conquiste trofeus e badges exclusivos por suas proezas.',
  },
]

const features = [
  {
    icon: Route,
    title: 'GPS de Alta Precisao',
    description: 'Rastreamento em tempo real com mapeamento preciso das suas rotas e territorios.',
  },
  {
    icon: Shield,
    title: 'Disputas Territoriais',
    description: 'Invada e defenda territorios. Mecanica unica de competicao baseada em performance.',
  },
  {
    icon: Smartphone,
    title: 'App Progressivo (PWA)',
    description: 'Instale direto no celular sem app store. Funciona offline e notificacoes push.',
  },
  {
    icon: Globe,
    title: 'Ranking Global',
    description: 'Compare sua performance com jogadores do mundo todo em tempo real.',
  },
]

const missionValues = [
  {
    icon: Lightbulb,
    title: 'Missao',
    description: 'Transformar a movimentacao humana em uma experiencia de conquista territorial, utilizando tecnologia de geolocalizacao de alta precisao para promover saude e engajamento urbano.',
  },
  {
    icon: Eye,
    title: 'Visao',
    description: 'Tornar-se a principal infraestrutura de entretenimento baseado em localizacao (Real-Life Gaming) da America Latina ate 2030, redefinindo a forma como os cidadaos interagem com o espaco publico.',
  },
  {
    icon: Heart,
    title: 'Valores',
    description: 'Unimos excelencia tecnica e foco no usuario para garantir geoprivacidade absoluta e relacoes baseadas na transparencia.',
  },
]

const squad = [
  {
    name: 'Leonardo Souza Bastos',
    role: 'Head of Data & Backend',
    description: 'Arquiteto do Banco de Dados e logica de servidor. Garante que a posse do territorio seja processada sem falhas e com seguranca extrema.',
    image: '/developers/leonardo.jpeg',
  },
  {
    name: 'Henrique Casagrande',
    role: 'Full Stack Developer',
    description: 'Responsavel pela implementacao de ponta a ponta, focado na integracao do App com as APIs de geolocalizacao e suporte ao Back-end.',
    image: '/developers/henrique.jpeg',
  },
  {
    name: 'Marcelo Candido',
    role: 'Tech Lead, Documentation & Full Stack',
    description: 'Responsavel pela gestao documental tecnica, garantia de requisitos e suporte no desenvolvimento hibrido, assegurando a coesao do projeto.',
    image: '/developers/marcelo.jpeg',
  },
]

export function MarketingLanding() {
  const { canInstall, promptInstall } = useInstallPrompt()
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-[90vh] flex flex-col">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Decorative glow effects */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-4 py-6 flex-1 flex flex-col">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-8 md:mb-16">
            <div className="flex items-center gap-3">
              <VentureGeoBrandLogo height={48} priority />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/login">
                <Button variant="outline" className="border-border/60 shadow-xs hover:bg-secondary">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                  Comecar gratis
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              {canInstall && (
                <Button
                  type="button"
                  variant="ghost"
                  className="hidden lg:inline-flex gap-2"
                  onClick={promptInstall}
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </Button>
              )}
            </div>
          </nav>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 py-8">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                <span>Gamificacao de Corrida e Caminhada</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] text-balance">
                <span className="text-primary">Geotecnologia</span>
                <br />
                aplicada a{' '}
                <span className="text-accent">performance</span>
                <br />
                humana
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Transforme suas corridas e caminhadas em conquistas territoriais. 
                Corra, desenhe seu territorio no mapa e compete com jogadores da sua regiao.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/cadastro">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 shadow-lg shadow-primary/25"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Comecar agora
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-lg px-8 h-14 border-border/60" 
                  asChild
                >
                  <Link href="#por-que-territoryrun">Saiba mais</Link>
                </Button>
                {canInstall && (
                  <Button
                    type="button"
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto text-lg px-8 h-14 lg:hidden"
                    onClick={promptInstall}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Instalar app
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="mt-10 flex flex-wrap gap-8 justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">Gratuito</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold text-accent">PWA</p>
                  <p className="text-sm text-muted-foreground">Sem app store</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">GPS</p>
                  <p className="text-sm text-muted-foreground">Alta precisao</p>
                </div>
              </div>
            </div>

            {/* Mascot */}
            <div className="hidden lg:flex shrink-0 items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-[80px] scale-75" />
                <VentureGeoMascot height={320} className="relative z-10 drop-shadow-2xl" />
              </div>
            </div>

            {/* Mobile Mascot */}
            <div className="flex lg:hidden justify-center mt-4">
              <VentureGeoMascot height={160} className="opacity-90" />
            </div>
          </div>
        </div>
      </header>

      {/* Por que TerritoryRun Section */}
      <section id="por-que-territoryrun" className="py-20 md:py-28 px-4 scroll-mt-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              <span>Beneficios</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Por que <span className="text-primary">TerritoryRun</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Uma nova forma de gamificar suas atividades fisicas, unindo geotecnologia com performance esportiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title} 
                className="p-6 bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Mascot decorative */}
          <div className="hidden md:flex justify-center mt-12">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px]" />
              <VentureGeoMascot height={100} className="relative opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-20 md:py-28 px-4 scroll-mt-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Map className="h-4 w-4" />
              <span>Mecanica de Jogo</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Como <span className="text-accent">funciona</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Tres passos simples para transformar seus treinos em conquistas territoriais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">1</div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Corra e conquiste
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Cada corrida ou caminhada desenha um territorio no mapa.
                Forme um loop fechado para conquistar a area.
              </p>
            </Card>

            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/60 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl font-bold text-accent/10 group-hover:text-accent/20 transition-colors">2</div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-5">
                <Trophy className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Suba no ranking
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Quanto maior sua area total conquistada, mais alto seu ranking.
                Evolua de Bronze ate Diamante.
              </p>
            </Card>

            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/60 hover:border-destructive/40 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl font-bold text-destructive/10 group-hover:text-destructive/20 transition-colors">3</div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Dispute territorios
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Invada territorios de outros jogadores para disputa-los.
                Proteja suas conquistas correndo mais.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="py-20 md:py-28 px-4 scroll-mt-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Content */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Smartphone className="h-4 w-4" />
                <span>Recursos do App</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Tecnologia de <span className="text-primary">ponta</span> no seu bolso
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-xl">
                Desenvolvido com as mais modernas tecnologias web para oferecer a melhor experiencia de gamificacao esportiva.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div 
                    key={feature.title} 
                    className="flex gap-4 p-4 rounded-xl bg-card/60 border border-border/40 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mascot */}
            <div className="hidden lg:flex shrink-0 items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-[100px] scale-110" />
                <VentureGeoMascot height={280} className="relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <span>Nosso Time</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Time de <span className="text-accent">desenvolvimento</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Profissionais responsaveis por construir uma experiencia moderna, segura e escalavel.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {developers.map((developer) => (
              <Card
                key={developer.name}
                className="p-6 bg-card/80 backdrop-blur-sm border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 group"
              >
                <div className="mb-5 overflow-hidden rounded-xl">
                  <img
                    src={developer.image}
                    alt={`Foto de ${developer.name}`}
                    className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {developer.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {developer.specialty}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section id="quem-somos" className="py-20 md:py-28 px-4 relative bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Bloco A: Essencia da Venture Geo */}
          <div className="mb-20 md:mb-28">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <Lightbulb className="h-4 w-4" />
                  <span>Sobre Nos</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-[#19305A] mb-6 text-balance">
                  Sobre a <span className="text-[#00D2FF]">Venture Geo</span>
                </h2>
                
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  A Venture Geo surge para resolver o baixo engajamento em aplicativos de saude tradicionais. Ao introduzir o conceito de &apos;conquista de bairros&apos; no Territory Run, criamos uma camada social e competitiva que retém o usuário não apenas pelo exercício, mas pela estratégia e domínio territorial.
                </p>
                
                <div className="p-6 bg-[#19305A]/5 border-l-4 border-[#00D2FF] rounded-lg">
                  <p className="font-semibold text-[#19305A] mb-3">O Significado do Nome</p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#00D2FF]">Venture</span> (aventura) e <span className="font-semibold text-[#00D2FF]">Geo</span> (localizacao) representam a juncao perfeita para unir competicao saudavel com metas territoriais. <span className="italic">&quot;Nascemos para dominar territorios fisicos e domar dados geoespaciais complexos.&quot;</span>
                  </p>
                </div>
              </div>
              
              {/* Mascot */}
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00D2FF]/20 to-[#CCFF00]/10 rounded-full blur-[100px]" />
                  <VentureGeoMascot height={320} className="relative z-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco B: Missao, Visao e Valores */}
          <div className="mb-20 md:mb-28">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#19305A] mb-4 text-balance">
                <span className="text-[#00D2FF]">Missao</span>, <span className="text-[#00D2FF]">Visao</span> e <span className="text-[#00D2FF]">Valores</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {missionValues.map((item) => {
                const Icon = item.icon
                return (
                  <Card 
                    key={item.title}
                    className="p-8 bg-gradient-to-br from-[#19305A]/5 to-[#00D2FF]/5 border-border/40 hover:border-[#00D2FF]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00D2FF]/10 hover:-translate-y-1 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D2FF]/20 to-[#CCFF00]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-[#00D2FF]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#19305A] mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Bloco C: Nossa Squad */}
          <div className="mb-20 md:mb-28">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF] text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                <span>Nossa Squad</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#19305A] mb-4 text-balance">
                Quem faz <span className="text-[#00D2FF]">acontecer</span>
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Uma squad de profissionais dedicados a transformar ideias em experiencias incriveis.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {squad.map((member) => (
                <Card 
                  key={member.name}
                  className="p-6 bg-white border-border/60 hover:border-[#00D2FF]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00D2FF]/10 hover:-translate-y-1 group overflow-hidden"
                >
                  <div className="mb-5 overflow-hidden rounded-xl">
                    <img
                      src={member.image}
                      alt={`Foto de ${member.name}`}
                      className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#19305A] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-[#00D2FF] font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {member.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Bloco D: Oportunidades de Patrocinio */}
          <div className="relative">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-[#19305A] via-[#19305A]/95 to-[#00D2FF]/10 border-[#00D2FF]/30 text-white relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D2FF]/5 rounded-full blur-[150px]" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#CCFF00]/5 rounded-full blur-[120px]" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 w-fit">
                  <div className="w-12 h-12 rounded-lg bg-[#00D2FF]/20 flex items-center justify-center">
                    <Megaphone className="h-6 w-6 text-[#00D2FF]" />
                  </div>
                  <span className="font-semibold text-[#CCFF00]">Patrocinios e Anuncios</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
                  Conecte sua <span className="text-[#CCFF00]">Marca</span> ao Movimento
                </h2>
                
                <p className="text-lg mb-8 leading-relaxed text-gray-100 max-w-2xl">
                  A Venture Geo não cobra planos de assinatura dos usuários. O Territory Run é 100% gratuito para o público final, e nosso modelo de negócios é focado exclusivamente em anúncios e patrocínios integrados à experiência gamificada.
                </p>
                
                <p className="text-base mb-8 leading-relaxed text-gray-200 max-w-2xl">
                  É da área de esporte ou tem interesse em impactar uma comunidade ativa e engajada? O Territory Run é o espaço ideal para a sua marca negociar inserções publicitárias estratégicas.
                </p>
                
                <Link href="mailto:patrocinio@venturegeo.com.br">
                  <Button
                    size="lg"
                    className="bg-[#CCFF00] text-[#19305A] hover:bg-[#CCFF00]/90 font-bold text-lg px-8 h-14 shadow-lg shadow-[#CCFF00]/30 group-hover:scale-105 transition-transform"
                  >
                    Negocie seu Patrocinio
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="relative max-w-4xl mx-auto">
          <Card className="p-8 md:p-16 bg-gradient-to-br from-card via-card to-secondary/40 border-border/60 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <VentureGeoMascot height={80} className="opacity-80" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Pronto para <span className="text-primary">conquistar</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Crie sua conta gratuita e comece a transformar seus treinos em conquistas territoriais.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/cadastro">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 h-14 shadow-lg shadow-primary/25"
                  >
                    <Map className="mr-2 h-5 w-5" />
                    Criar conta gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-10 h-14 border-border/60">
                    Ja tenho conta
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-4 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <VentureGeoBrandLogo height={40} />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-4">
                Geotecnologia aplicada a performance humana. Transforme suas corridas em conquistas territoriais.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.instagram.com/venturegeooficial/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61572058310239" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="mailto:contato@venturegeo.com.br" 
                  className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#por-que-territoryrun" className="hover:text-primary transition-colors">Por que TerritoryRun</Link></li>
                <li><Link href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</Link></li>
                <li><Link href="#recursos" className="hover:text-primary transition-colors">Recursos</Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Venture Geo. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Feito com tecnologia no Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
