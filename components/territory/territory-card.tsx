'use client'

import { Card } from '@/components/ui/card'
import type { Territory } from '@/lib/territory/types'
import { formatArea } from '@/lib/territory/geo'
import { cn } from '@/lib/utils'
import { MapPin, Shield, Swords, Crown } from 'lucide-react'

interface TerritoryCardProps {
  territory: Territory
  isOwn: boolean
  isSelected: boolean
  onClick: () => void
}

const statusConfig = {
  active: {
    icon: MapPin,
    label: 'Ativo',
    color: '#CCFF00',
    bgColor: 'rgba(204, 255, 0, 0.1)',
  },
  protected: {
    icon: Shield,
    label: 'Protegido',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  disputed: {
    icon: Swords,
    label: 'Em Disputa',
    color: '#FF4D4D',
    bgColor: 'rgba(255, 77, 77, 0.1)',
  },
  expired: {
    icon: MapPin,
    label: 'Expirado',
    color: '#8ba3c7',
    bgColor: 'rgba(139, 163, 199, 0.1)',
  },
}

const dominanceConfig = {
  bronze: { color: '#D97706', label: 'Bronze' },
  silver: { color: '#9CA3AF', label: 'Prata' },
  gold: { color: '#CCFF00', label: 'Ouro' },
  platinum: { color: '#E5E7EB', label: 'Platina' },
  diamond: { color: '#00D2FF', label: 'Diamante' },
}

export function TerritoryCard({
  territory,
  isOwn,
  isSelected,
  onClick,
}: TerritoryCardProps) {
  const status = statusConfig[territory.status]
  const StatusIcon = status.icon
  const dominance = dominanceConfig[territory.dominanceLevel]

  const timeAgo = getTimeAgo(territory.createdAt)

  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-all duration-200 border',
        isSelected 
          ? 'ring-2 ring-[#CCFF00]' 
          : 'hover:border-[#CCFF00]/30'
      )}
      style={{
        background: isSelected 
          ? 'rgba(204, 255, 0, 0.05)' 
          : 'rgba(13, 26, 45, 0.5)',
        borderColor: isSelected ? '#CCFF00' : '#2d4a70'
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator */}
        <div
          className="w-3 h-12 rounded-full shrink-0"
          style={{
            backgroundColor: isOwn
              ? '#CCFF00'
              : territory.userColor || '#00D2FF',
            boxShadow: `0 0 8px ${isOwn ? 'rgba(204, 255, 0, 0.4)' : 'rgba(0, 210, 255, 0.4)'}`
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-foreground truncate">
              {isOwn ? 'Seu Territorio' : territory.userName || 'Usuario'}
            </span>
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <Crown className="h-3 w-3" style={{ color: dominance.color }} />
              <span
                className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: dominance.color }}
              >
                {dominance.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm mb-2">
            <span 
              className="font-mono font-bold text-lg"
              style={{ color: isOwn ? '#CCFF00' : '#00D2FF' }}
            >
              {formatArea(territory.areaM2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-md"
              style={{ 
                background: status.bgColor,
              }}
            >
              <StatusIcon className="h-3 w-3" style={{ color: status.color }} />
              <span 
                className="text-xs font-medium"
                style={{ color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d atras`
  if (hours > 0) return `${hours}h atras`
  if (minutes > 0) return `${minutes}min atras`
  return 'Agora'
}
