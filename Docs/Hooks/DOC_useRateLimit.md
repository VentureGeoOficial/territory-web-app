# DOC_useRateLimit

**Ficheiro:** [`hooks/use-rate-limit.ts`](../../hooks/use-rate-limit.ts)

## `useRateLimit(options?)`

Opções: `minInterval` (default 1000ms), `maxAttempts` (5), `windowMs` (60000).

Retorno: `canExecute`, `recordExecution`, `isLimited`, `timeRemaining`, `attemptsRemaining`, `withRateLimit`.

Implementação: arrays de timestamps em ref + limpeza por janela deslizante.

## `useDebounce(callback, delay)`

Debounce genérico com `setTimeout`.

## `useThrottle(callback, limit)`

Throttle por intervalo mínimo entre chamadas.

## Uso típico

Formulários de login/cadastro e ações sensíveis (ver formulários auth).
