'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { bottomNavItems } from '@/lib/navigation/nav-config'
import { zBottomNav } from '@/lib/layout/z-index'

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur',
        'pb-[env(safe-area-inset-bottom,0px)]',
        zBottomNav,
      )}
    >
      <div className="mx-auto grid h-14 w-full max-w-2xl grid-cols-5 items-stretch px-4">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const tourAttr =
            item.href === '/competicao'
              ? 'nav-competicao'
              : item.href === '/amigos'
                ? 'nav-amigos'
                : item.href === '/loja'
                  ? 'nav-loja'
                  : item.href === '/conta'
                    ? 'nav-conta'
                    : item.href === '/mapa'
                      ? 'map-area'
                      : undefined
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(tourAttr ? { 'data-tour': tourAttr } : {})}
              className={cn(
                'flex min-h-[48px] min-w-0 flex-col items-center justify-center gap-1 py-1',
                'text-[11px] font-medium leading-tight transition-transform active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'stroke-primary' : 'stroke-muted-foreground',
                )}
              />
              <span className="max-w-full truncate text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
