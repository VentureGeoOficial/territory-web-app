import { useCallback, useRef, useState } from 'react'

interface UseRateLimitOptions {
  /** Tempo minimo entre acoes em ms (padrao: 1000) */
  minInterval?: number
  /** Numero maximo de acoes em um periodo (padrao: 5) */
  maxAttempts?: number
  /** Periodo para contar acoes em ms (padrao: 60000 - 1 minuto) */
  windowMs?: number
}

interface UseRateLimitReturn {
  /** Verifica se a acao pode ser executada */
  canExecute: () => boolean
  /** Registra uma execucao da acao */
  recordExecution: () => void
  /** Retorna se esta em cooldown */
  isLimited: boolean
  /** Tempo restante do cooldown em ms */
  timeRemaining: number
  /** Numero de tentativas restantes */
  attemptsRemaining: number
  /** Wrapper que aplica rate limit automaticamente */
  withRateLimit: <T>(fn: () => Promise<T>) => Promise<T | null>
}

/**
 * Hook para implementar rate limiting no frontend
 * Protege contra abuso em acoes sensiveis como cadastro, login, envio de pedidos
 */
export function useRateLimit(options: UseRateLimitOptions = {}): UseRateLimitReturn {
  const {
    minInterval = 1000,
    maxAttempts = 5,
    windowMs = 60000,
  } = options

  const lastExecutionRef = useRef<number>(0)
  const executionsRef = useRef<number[]>([])
  const [isLimited, setIsLimited] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Limpa execucoes antigas fora da janela de tempo
  const cleanOldExecutions = useCallback(() => {
    const now = Date.now()
    executionsRef.current = executionsRef.current.filter(
      (time) => now - time < windowMs
    )
  }, [windowMs])

  const canExecute = useCallback((): boolean => {
    const now = Date.now()
    cleanOldExecutions()

    // Verifica intervalo minimo entre execucoes
    if (now - lastExecutionRef.current < minInterval) {
      const remaining = minInterval - (now - lastExecutionRef.current)
      setTimeRemaining(remaining)
      setIsLimited(true)
      return false
    }

    // Verifica numero maximo de tentativas na janela
    if (executionsRef.current.length >= maxAttempts) {
      const oldestExecution = executionsRef.current[0]
      const remaining = windowMs - (now - oldestExecution)
      setTimeRemaining(remaining)
      setIsLimited(true)
      return false
    }

    setIsLimited(false)
    setTimeRemaining(0)
    return true
  }, [cleanOldExecutions, minInterval, maxAttempts, windowMs])

  const recordExecution = useCallback(() => {
    const now = Date.now()
    lastExecutionRef.current = now
    executionsRef.current.push(now)
    cleanOldExecutions()
  }, [cleanOldExecutions])

  const attemptsRemaining = Math.max(0, maxAttempts - executionsRef.current.length)

  const withRateLimit = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      if (!canExecute()) {
        return null
      }
      recordExecution()
      return fn()
    },
    [canExecute, recordExecution]
  )

  return {
    canExecute,
    recordExecution,
    isLimited,
    timeRemaining,
    attemptsRemaining,
    withRateLimit,
  }
}

/**
 * Hook simples de debounce para inputs
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

/**
 * Hook de throttle para acoes frequentes
 */
export function useThrottle<T extends (...args: Parameters<T>) => void>(
  callback: T,
  limit: number
): T {
  const lastRunRef = useRef<number>(0)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRunRef.current >= limit) {
        lastRunRef.current = now
        callback(...args)
      }
    }) as T,
    [callback, limit]
  )
}
