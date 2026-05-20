# SEC — territories/capture/route.ts

**Severidade:** MÉDIO (mitigado)

**Problema:** Mesmo que runs/complete — flood e payload grande (`routeJson` até 400 KB).

**Correção:** Rate-limit partilhado + validação Zod + auth Bearer.

**Data:** 2026-05-19
