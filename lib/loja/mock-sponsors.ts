import type { Sponsor } from '@/lib/loja/types'

export const MOCK_SPONSORS: Sponsor[] = [
  {
    id: 'slot-1',
    name: 'Espaço reservado',
    category: 'marca',
    description: 'Vitrine premium para marcas que querem falar com corredores urbanos ativos.',
    tags: ['Patrocínio', 'Visibilidade'],
    status: 'coming_soon',
    sortOrder: 1,
  },
  {
    id: 'slot-2',
    name: 'Espaço reservado',
    category: 'roupas',
    description: 'Loja de vestuário técnico, compressão e coleções de performance.',
    tags: ['Moda', 'Performance'],
    status: 'coming_soon',
    sortOrder: 2,
  },
  {
    id: 'slot-3',
    name: 'Espaço reservado',
    category: 'tenis',
    description: 'Calçados para treino, prova e uso diário com foco em corrida.',
    tags: ['Tênis', 'Corrida'],
    status: 'coming_soon',
    sortOrder: 3,
  },
  {
    id: 'slot-4',
    name: 'Espaço reservado',
    category: 'suplementos',
    description: 'Nutrição esportiva, hidratação e recuperação para atletas.',
    tags: ['Suplementos', 'Saúde'],
    status: 'coming_soon',
    sortOrder: 4,
  },
  {
    id: 'slot-5',
    name: 'Espaço reservado',
    category: 'academia',
    description: 'Academias e estúdios parceiros com benefícios para a comunidade.',
    tags: ['Academia', 'Treino'],
    status: 'coming_soon',
    sortOrder: 5,
  },
  {
    id: 'slot-6',
    name: 'Espaço reservado',
    category: 'marca',
    description: 'Campanhas sazonais, cupons e lançamentos integrados ao app.',
    tags: ['Cupom', 'Campanha'],
    status: 'coming_soon',
    sortOrder: 6,
  },
]

export const MOCK_BANNER_SPONSORS: Sponsor[] = [
  {
    id: 'banner-suplementos',
    name: 'Parceiro de suplementação',
    category: 'suplementos',
    description:
      'Banner promocional para marcas de nutrição esportiva. Cupons e ofertas exclusivas em breve.',
    tags: ['Em breve'],
    status: 'coming_soon',
    couponCode: 'WY-SUP-XXXX',
    sortOrder: 10,
  },
  {
    id: 'banner-tenis',
    name: 'Parceiro de calçados',
    category: 'tenis',
    description:
      'Destaque para lojas de tênis e corrida. Espaço para campanhas de lançamento e test drive.',
    tags: ['Em breve'],
    status: 'coming_soon',
    couponCode: 'WY-TEN-XXXX',
    sortOrder: 11,
  },
]
