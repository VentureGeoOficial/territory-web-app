'use client'

import * as React from 'react'

const DEFAULT_IDLE_MS = 200

/**
 * Oculta durante scroll (capture em qualquer container) e revela com atraso
 * após o utilizador parar de rolar — para overlays fixos que não tapam conteúdo em movimento.
 */
export function useScrollReveal(idleMs = DEFAULT_IDLE_MS): boolean {
  const [revealed, setRevealed] = React.useState(true)
  const idleRef = React.useRef(idleMs)
  idleRef.current = idleMs

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const onScroll = () => {
      setRevealed(false)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        setRevealed(true)
      }, idleRef.current)
    }

    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      if (timer) clearTimeout(timer)
    }
  }, [])

  return revealed
}
