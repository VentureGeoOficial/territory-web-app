import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Dashboard | TerritoryRun',
  description: 'Estatísticas, percursos e evolução da sua atividade esportiva.',
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children
}
