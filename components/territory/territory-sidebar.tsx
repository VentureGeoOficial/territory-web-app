'use client'

import { useState } from 'react'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { TerritoryCard } from './territory-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatArea } from '@/lib/territory/geo'
import { VentureGeoBrandLogo } from '@/components/brand/venture-geo-logo'
import { cn } from '@/lib/utils'
import {
  MapPin,
  Swords,
  User,
  ChevronLeft,
  ChevronRight,
  Trophy,
  TrendingUp,
} from 'lucide-react'

type FilterType = 'all' | 'mine' | 'disputed'

export function TerritorySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  const {
    territories,
    currentUserId,
    selectedTerritoryId,
    selectTerritory,
    setMapCenter,
    getTotalAreaForUser,
    users,
  } = useTerritoryStore()

  const currentUser = users.find((u) => u.id === currentUserId)

  // Filter territories
  const filteredTerritories = territories.filter((t) => {
    if (filter === 'mine') return t.userId === currentUserId
    if (filter === 'disputed') return t.status === 'disputed'
    return true
  })

  // Stats
  const myTerritories = territories.filter((t) => t.userId === currentUserId)
  const myTotalArea = getTotalAreaForUser(currentUserId)
  const disputedCount = territories.filter((t) => t.status === 'disputed').length

  // Rank calculation
  const getRank = (count: number) => {
    if (count >= 10) return { name: 'Diamante', color: '#00D2FF' }
    if (count >= 7) return { name: 'Platina', color: '#E5E7EB' }
    if (count >= 5) return { name: 'Ouro', color: '#CCFF00' }
    if (count >= 3) return { name: 'Prata', color: '#9CA3AF' }
    return { name: 'Bronze', color: '#D97706' }
  }

  const rank = getRank(myTerritories.length)

  const handleTerritoryClick = (territory: typeof territories[0]) => {
    selectTerritory(
      selectedTerritoryId === territory.id ? null : territory.id
    )
    if (territory.center) {
      setMapCenter(territory.center)
    }
  }

  if (isCollapsed) {
    return (
      <div 
        className="h-full w-14 flex flex-col items-center py-4 border-r"
        style={{ background: '#19305A', borderColor: '#2d4a70' }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="mb-4 hover:bg-[#243a5e]"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div className="flex flex-col items-center gap-4">
          <VentureGeoBrandLogo height={38} className="px-1.5" />
          <div className="text-sm font-mono font-bold text-[#CCFF00]">
            {territories.length}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="h-full w-80 flex flex-col border-r"
      style={{ background: '#19305A', borderColor: '#2d4a70' }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ borderColor: '#2d4a70' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <VentureGeoBrandLogo height={42} className="shrink-0" />
            <h2 className="font-semibold text-foreground truncate">Territorios</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-[#243a5e]"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* User stats */}
        <Card 
          className="p-4 border"
          style={{ background: 'rgba(13, 26, 45, 0.5)', borderColor: '#2d4a70' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.2) 0%, rgba(0, 210, 255, 0.2) 100%)',
                border: '2px solid rgba(204, 255, 0, 0.3)'
              }}
            >
              <User className="h-6 w-6 text-[#CCFF00]" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {currentUser?.displayName || 'Usuario Demo'}
              </div>
              <div 
                className="text-xs font-medium flex items-center gap-1"
                style={{ color: rank.color }}
              >
                <Trophy className="h-3 w-3" />
                Nivel {rank.name}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.2)' }}
            >
              <div className="text-xl font-mono font-bold text-[#CCFF00]">
                {myTerritories.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Territorios</div>
            </div>
            <div 
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)' }}
            >
              <div className="text-xl font-mono font-bold text-[#00D2FF]">
                {formatArea(myTotalArea)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Area Total</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div 
        className="flex p-2 gap-1 border-b"
        style={{ borderColor: '#2d4a70' }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 text-xs',
            filter === 'all' 
              ? 'bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00]/20' 
              : 'hover:bg-[#243a5e] text-muted-foreground'
          )}
          onClick={() => setFilter('all')}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Todos ({territories.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 text-xs',
            filter === 'mine' 
              ? 'bg-[#00D2FF]/10 text-[#00D2FF] hover:bg-[#00D2FF]/20' 
              : 'hover:bg-[#243a5e] text-muted-foreground'
          )}
          onClick={() => setFilter('mine')}
        >
          <User className="h-3 w-3 mr-1" />
          Meus ({myTerritories.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 text-xs',
            filter === 'disputed' 
              ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] hover:bg-[#FF4D4D]/20' 
              : 'hover:bg-[#243a5e] text-muted-foreground'
          )}
          onClick={() => setFilter('disputed')}
        >
          <Swords className="h-3 w-3 mr-1" />
          Disputa ({disputedCount})
        </Button>
      </div>

      {/* Territory list */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredTerritories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              {filter === 'mine' ? (
                <TrendingUp className="h-10 w-10 text-muted-foreground" />
              ) : filter === 'disputed' ? (
                <Swords className="h-10 w-10 text-muted-foreground" />
              ) : (
                <MapPin className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-1">
              {filter === 'mine'
                ? 'Nenhum territorio conquistado'
                : filter === 'disputed'
                  ? 'Nenhum territorio em disputa'
                  : 'Nenhum territorio encontrado'}
            </p>
            {filter === 'mine' && (
              <p className="text-xs text-muted-foreground">
                Clique em &quot;Desenhar Territorio&quot; para comecar sua conquista
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTerritories.map((territory) => (
              <TerritoryCard
                key={territory.id}
                territory={territory}
                isOwn={territory.userId === currentUserId}
                isSelected={selectedTerritoryId === territory.id}
                onClick={() => handleTerritoryClick(territory)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="p-3 border-t"
        style={{ borderColor: '#2d4a70' }}
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>TerritoryRun v0.1</span>
          <span className="flex items-center gap-1">
            <span>by</span>
            <span className="text-[#CCFF00]">Venture</span>
            <span className="text-[#00D2FF]">Geo</span>
          </span>
        </div>
      </div>
    </div>
  )
}
