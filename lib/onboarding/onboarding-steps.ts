export type OnboardingStepId =
  | 'map'
  | 'run-cta'
  | 'dashboard'
  | 'competition'
  | 'friends'
  | 'trophies'
  | 'store'
  | 'profile'
  | 'finish'

export interface OnboardingStepConfig {
  id: OnboardingStepId
  title: string
  body: string
  /** Rota a abrir antes de destacar o alvo (vazio = manter actual) */
  route?: string
  /** Selector CSS do elemento a destacar; vazio = passo centrado */
  targetSelector?: string
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'map',
    title: 'Mapa principal',
    body: 'Este é o mapa principal. Aqui você domina territórios e acompanha sua evolução.',
    route: '/mapa',
    targetSelector: '[data-tour="map-area"]',
  },
  {
    id: 'run-cta',
    title: 'Iniciar corrida',
    body: 'Inicie uma corrida para registrar seu percurso e conquistar novos territórios.',
    route: '/mapa',
    targetSelector: '#tour-run-cta',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    body: 'No Dashboard você acompanha estatísticas, distância percorrida, tempo e desempenho.',
    route: '/dashboard',
    targetSelector: '[data-tour="nav-dashboard"]',
  },
  {
    id: 'competition',
    title: 'Competição',
    body: 'Compare seus resultados com outros jogadores e acompanhe sua classificação.',
    route: '/competicao',
    targetSelector: '[data-tour="nav-competicao"]',
  },
  {
    id: 'friends',
    title: 'Amigos',
    body: 'Adicione amigos para visualizar territórios, disputar áreas e interagir.',
    route: '/amigos',
    targetSelector: '[data-tour="nav-amigos"]',
  },
  {
    id: 'trophies',
    title: 'Troféus',
    body: 'Acompanhe suas conquistas e evolução dentro do jogo.',
    route: '/mapa',
    targetSelector: '[data-tour="nav-trofeus"]',
  },
  {
    id: 'store',
    title: 'Loja',
    body: 'Confira promoções, parceiros e benefícios exclusivos.',
    route: '/loja',
    targetSelector: '[data-tour="nav-loja"]',
  },
  {
    id: 'profile',
    title: 'Perfil',
    body: 'Gerencie suas informações e acompanhe seu progresso.',
    route: '/conta',
    targetSelector: '[data-tour="nav-conta"]',
  },
  {
    id: 'finish',
    title: 'Pronto para começar',
    body: 'Agora você está pronto para começar sua jornada.',
    route: '/mapa',
  },
]
