import type { PartnerCategory } from '@/lib/loja/types'

export const SPONSOR_CONTACT_EMAIL = 'patrocinio@venturegeo.com.br'
export const SPONSOR_STARTING_PRICE = 'R$ 49,99'

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  roupas: 'Roupas esportivas',
  tenis: 'Tênis e calçados',
  suplementos: 'Suplementação',
  academia: 'Academia',
  marca: 'Marca esportiva',
  outro: 'Parceiro',
}

export const LOJA_TAB_CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'marca', label: 'Patrocinadores' },
  { value: 'roupas', label: 'Lojas' },
  { value: 'academia', label: 'Academias' },
] as const
