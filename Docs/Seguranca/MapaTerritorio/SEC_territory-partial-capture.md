# SEC_territory-partial-capture

**Data:** 2026-05-22

## Escopo

Correção de invasão parcial em `executeCaptureTransaction` e `subtractPolygonOverlap`.

## Análise

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Alterar `userId` da vítima na subtração | CRÍTICO (evitado) | Apenas `update` no doc existente; `userId` não entra no payload de update |
| Geometria inválida após `difference` | MÉDIO | Fallback para `full_expire`; log `capture_difference_failed` |
| URLs / XSS | N/A | Sem renderização HTML de geometria |
| Race na lista de overlaps | BAIXO | Validação de status/owner dentro da transação (comportamento pré-existente) |

## Trecho crítico

`lib/firebase/transactions.ts` — ramo `partial_shrink` atualiza `polygonJson`, `areaM2`, centro e geohash sem trocar dono.

## Correção aplicada

Subtração geoespacial com `turf.difference`; vítima permanece no mapa com polígono reduzido; stats decrementam só `lostAreaM2` e `territoriesCount` só em conquista total.
