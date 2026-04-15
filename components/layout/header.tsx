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
import { formatArea } from '@/lib/territory/geo'
import { LogOut, Map, Settings, Trophy, User, Users, Medal, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/competicao', label: 'Competição', icon: Medal },
  { href: '/amigos', label: 'Amigos', icon: Users },
  { href: '/trofeus', label: 'Troféus', icon: Trophy },
]

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

  return (
    <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between shrink-0">
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
          <SheetContent side="left" className="w-72 p-0">
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
            <nav className="flex flex-col p-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            
            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
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
                    setMobileMenuOpen(false)
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

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={item.href} className="gap-1.5">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </nav>

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

      {/* User menu - Desktop */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden lg:flex h-9 w-9"
          onClick={handleLogout}
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden lg:flex h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
            {currentUser?.displayName || 'Demo'}
          </span>
        </Button>
      </div>
    </header>
  )
}
