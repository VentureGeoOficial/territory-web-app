'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import logosSemFundo from '@/IMG/logos-sem-fundo.png'
import mascoteSemFundo from '@/IMG/mascote-sem-fundo.png'

interface VentureGeoLogoProps {
  className?: string
  showText?: boolean
  variant?: 'full' | 'icon' | 'horizontal'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-lg' },
  lg: { icon: 48, text: 'text-2xl' },
  xl: { icon: 64, text: 'text-3xl' },
}

export function VentureGeoLogo({
  className,
  showText = true,
  variant = 'horizontal',
  size = 'md',
}: VentureGeoLogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size]

  return (
    <div
      className={cn(
        'flex items-center',
        variant === 'horizontal' ? 'flex-row gap-3' : 'flex-col gap-2',
        className
      )}
    >
      {/* VentureGeo Icon - Stylized mountain/compass/magnifier */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Background circle */}
        <circle cx="32" cy="32" r="30" fill="#19305A" stroke="#CCFF00" strokeWidth="2" />
        
        {/* Mountain peaks */}
        <path
          d="M12 44L22 28L28 36L38 20L52 44H12Z"
          fill="#CCFF00"
          fillOpacity="0.9"
        />
        
        {/* Compass needle */}
        <path
          d="M32 12L35 24L32 22L29 24L32 12Z"
          fill="#00D2FF"
        />
        
        {/* Globe lines */}
        <ellipse
          cx="32"
          cy="32"
          rx="18"
          ry="8"
          stroke="#00D2FF"
          strokeWidth="1"
          strokeOpacity="0.5"
          fill="none"
        />
        
        {/* Magnifier circle */}
        <circle
          cx="42"
          cy="38"
          r="8"
          stroke="#CCFF00"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Magnifier handle */}
        <line
          x1="48"
          y1="44"
          x2="54"
          y2="50"
          stroke="#CCFF00"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showText && variant !== 'icon' && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-bold tracking-tight leading-none text-foreground',
              textSize
            )}
          >
            <span className="text-[#CCFF00]">Venture</span>
            <span className="text-[#00D2FF]">Geo</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
              Geotecnologia aplicada
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function TerritoryRunLogo({
  className,
  size = 'md',
  showTagline = true,
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Territory icon */}
      <div
        className="rounded-xl flex items-center justify-center"
        style={{
          width: iconSizes[size],
          height: iconSizes[size],
          background: 'linear-gradient(135deg, #CCFF00 0%, #00D2FF 100%)',
        }}
      >
        <svg
          width={iconSizes[size] * 0.6}
          height={iconSizes[size] * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Running figure with territory */}
          <path
            d="M13.5 5.5C14.3284 5.5 15 4.82843 15 4C15 3.17157 14.3284 2.5 13.5 2.5C12.6716 2.5 12 3.17157 12 4C12 4.82843 12.6716 5.5 13.5 5.5Z"
            fill="#19305A"
          />
          <path
            d="M9.8 8.9L12 11V19H10V12.5L8.6 11.2C8.22 10.85 8 10.36 8 9.85C8 9.3 8.2 8.8 8.6 8.4L11.65 5.35C12.05 4.95 12.6 4.73 13.15 4.73C13.7 4.73 14.25 4.95 14.65 5.35L16.8 7.5L19.5 6L20.5 7.7L16.85 9.85L14 7L11.45 9.55L14 10.8V19H12V12L9.8 8.9Z"
            fill="#19305A"
          />
          {/* Territory polygon */}
          <path
            d="M3 15L6 12L9 14L12 11L15 13L18 10L21 12V19H3V15Z"
            fill="#19305A"
            fillOpacity="0.3"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            'font-bold tracking-tight leading-none text-foreground',
            textSizes[size]
          )}
        >
          Territory<span className="text-[#CCFF00]">Run</span>
        </span>
        {showTagline && size !== 'sm' && (
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
            Conquiste seu caminho
          </span>
        )}
      </div>
    </div>
  )
}

export function VentureGeoBrandLogo({
  className,
  height = 44,
  priority = false,
}: {
  className?: string
  height?: number
  priority?: boolean
}) {
  const w = Math.round(height * 3.2)
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-2.5 py-1.5',
        className
      )}
    >
      <Image
        src={logosSemFundo}
        alt="VentureGeo"
        width={w}
        height={height}
        className="object-contain"
        style={{ height, width: 'auto', maxWidth: 'min(100%, 320px)' }}
        priority={priority}
      />
    </div>
  )
}

export function VentureGeoMascot({
  className,
  height = 160,
}: {
  className?: string
  height?: number
}) {
  const w = Math.round(height * 0.55)
  return (
    <Image
      src={mascoteSemFundo}
      alt=""
      width={w}
      height={height}
      className={cn('object-contain', className)}
      style={{ height, width: 'auto' }}
      aria-hidden
    />
  )
}
