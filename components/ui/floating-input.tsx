'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FloatingInputProps
  extends React.ComponentProps<'input'> {
  label: string
  error?: string
}

/**
 * Input com label flutuante (estilo peer) + mensagem de erro.
 */
function FloatingInput({
  className,
  label,
  error,
  id,
  placeholder = ' ',
  ...props
}: FloatingInputProps) {
  const genId = React.useId()
  const inputId = id ?? genId

  return (
    <div className="relative w-full">
      <input
        id={inputId}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(
          'peer flex h-12 w-full rounded-xl border bg-transparent px-3 pt-5 pb-2 text-sm text-foreground shadow-xs transition-[color,box-shadow,transform] outline-none',
          'border-input dark:bg-input/30',
          'placeholder:text-transparent',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-destructive ring-destructive/20 dark:ring-destructive/40'
            : '',
          className,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute left-3 top-1/2 z-10 origin-[0] -translate-y-1/2 text-muted-foreground transition-all duration-200 ease-out',
          'peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:scale-[0.85] peer-focus:text-primary',
          'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.85]',
          'text-xs font-medium',
        )}
      >
        {label}
      </label>
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { FloatingInput }
