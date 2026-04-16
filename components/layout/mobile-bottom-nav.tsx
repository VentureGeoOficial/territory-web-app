'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Medal, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/competicao', label: 'Competição', icon: Medal },
  { href: '/amigos', label: 'Amigos', icon: Users },
  { href: '/trofeus', label: 'Troféus', icon: Trophy },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[1100] border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                'active:scale-95 transition-transform',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'stroke-primary' : 'stroke-muted-foreground',
                )}
              />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

