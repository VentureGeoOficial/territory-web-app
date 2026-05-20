# SEC — runs/complete/route.ts

**Severidade:** MÉDIO (mitigado)

**Problema:** Sem rate-limit — flood de finalizações.

**Correção:** `assertRunRateLimit(uid)` — 1 pedido / 60 s via Firestore `rateLimits/{uid}`.

**Data:** 2026-05-19
