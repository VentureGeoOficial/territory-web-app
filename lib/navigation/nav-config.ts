import type { LucideIcon } from 'lucide-react'
import {
  CircleHelp,
  LayoutDashboard,
  Map,
  Medal,
  Settings,
  Store,
  Trophy,
  Users,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

/** Barra inferior fixa — Loja no lugar de Troféus */
export const bottomNavItems: NavItem[] = [
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/competicao', label: 'Competição', icon: Medal },
  { href: '/amigos', label: 'Amigos', icon: Users },
  { href: '/loja', label: 'Loja', icon: Store },
  { href: '/conta', label: 'Conta', icon: Settings },
]

/** Sheet mobile — Dashboard no topo; Troféus fica no menu do perfil */
export const mobileSheetNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/competicao', label: 'Competição', icon: Medal },
  { href: '/amigos', label: 'Amigos', icon: Users },
  { href: '/loja', label: 'Loja', icon: Store },
  { href: '/conta', label: 'Conta', icon: Settings },
  { href: '/ajuda', label: 'Ajuda', icon: CircleHelp },
]

/** Menu do perfil (dropdown desktop + links secundários no sheet) */
export const profileMenuItems: NavItem[] = [
  { href: '/conta', label: 'Minha conta', icon: Settings },
  { href: '/trofeus', label: 'Troféus', icon: Trophy },
  { href: '/ajuda', label: 'Ajuda', icon: CircleHelp },
]
