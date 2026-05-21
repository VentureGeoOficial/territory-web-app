import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Loja | TerritoryRun',
  description: 'Parceiros e patrocinadores esportivos da comunidade.',
}

export default function LojaLayout({ children }: { children: ReactNode }) {
  return children
}
