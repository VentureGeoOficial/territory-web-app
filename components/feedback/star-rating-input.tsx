'use client'

import * as React from 'react'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

export function StarRatingInput({
  value,
  onChange,
  disabled,
  className,
}: {
  value: number
  onChange: (stars: number) => void
  disabled?: boolean
  className?: string
}) {
  const [hover, setHover] = React.useState(0)
  const display = hover > 0 ? hover : value

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="radiogroup"
      aria-label="Avaliação em estrelas"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          className={cn(
            'rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            disabled && 'pointer-events-none opacity-50',
          )}
          onMouseEnter={() => setHover(star)}
          onFocus={() => setHover(star)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors',
              star <= display
                ? 'fill-primary text-primary'
                : 'fill-transparent text-muted-foreground',
            )}
          />
        </button>
      ))}
    </div>
  )
}
