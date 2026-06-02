'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { signOutRemote } from '@/lib/auth/auth-service'
import { Button } from '@/components/ui/button'
import { VentureGeoBrandLogo } from '@/components/brand/venture-geo-logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatArea } from '@/lib/territory/geo'
import { mobileSheetNavItems, profileMenuItems } from '@/lib/navigation/nav-config'
import { LayoutDashboard, LogOut, Map, Trophy, User, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { zHeader } from '@/lib/layout/z-index'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const logout = useAuthStore((s) => s.logout)
  const { territories, currentUserId, getTotalAreaForUser, users } =
    useTerritoryStore()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const currentUser = users.find((u) => u.id === currentUserId)
  const myTerritories = territories.filter((t) => t.userId === currentUserId)
  const myTotalArea = getTotalAreaForUser(currentUserId)

  const handleLogout = React.useCallback(() => {
    void signOutRemote().finally(() => {
      logout()
      router.replace('/')
    })
  }, [logout, router])

  const closeSheet = React.useCallback(() => setMobileMenuOpen(false), [])

  return (
    <header
      className={cn(
        'relative h-14 bg-card border-b border-border px-4 flex items-center justify-between shrink-0',
        zHeader,
      )}
    >
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col p-0">
            <SheetHeader className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <VentureGeoBrandLogo height={36} />
                <div>
                  <SheetTitle className="text-left text-base">TerritoryRun</SheetTitle>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Conquiste seu caminho
                  </p>
                </div>
              </div>
            </SheetHeader>

            {/* Mobile Stats */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {myTerritories.length}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      territorios
                    </span>
                  </div>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-accent" />
                  <div>
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {formatArea(myTotalArea)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col p-2 flex-1 overflow-y-auto pb-32">
              {mobileSheetNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSheet}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}

              <div className="my-2 border-t border-border" />

              {profileMenuItems
                .filter((item) => !mobileSheetNavItems.some((n) => n.href === item.href))
                .map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSheet}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
            </nav>

            {/* User Section */}
            <div className="mt-auto border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {currentUser?.displayName || 'Demo'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    closeSheet()
                    handleLogout()
                  }}
                  aria-label="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <VentureGeoBrandLogo height={42} className="hidden lg:block" />
        <VentureGeoBrandLogo height={36} className="lg:hidden" />
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-foreground leading-none">
            TerritoryRun
          </h1>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            Conquiste seu caminho
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <div>
            <span className="text-sm font-mono font-semibold text-foreground">
              {myTerritories.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              territorios
            </span>
          </div>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-accent" />
          <div>
            <span className="text-sm font-mono font-semibold text-foreground">
              {formatArea(myTotalArea)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              conquistados
            </span>
          </div>
        </div>
      </div>

      {/* Acesso rápido + menu do usuário */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 shrink-0',
            pathname === '/dashboard' && 'bg-primary/10 text-primary',
          )}
          asChild
        >
          <Link
            href="/dashboard"
            data-tour="nav-dashboard"
            aria-label="Abrir Dashboard"
            aria-current={pathname === '/dashboard' ? 'page' : undefined}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 px-2"
              aria-label="Abrir menu do usuário"
              data-tour="nav-trofeus"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
                {currentUser?.displayName || 'Demo'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{currentUser?.displayName || 'Conta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profileMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
