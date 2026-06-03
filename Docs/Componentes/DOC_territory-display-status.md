# DOC_territory-display-status

**Ficheiros:**
- [`lib/territory/territory-display-status.ts`](../../lib/territory/territory-display-status.ts)
- [`components/territory/territory-protection-countdown.tsx`](../../components/territory/territory-protection-countdown.tsx)

## Objetivo

Unificar rótulos **Protegido** / **Desprotegido** na UI usando `protectedUntil` e `status` persistido.

## Regras de exibição

| Condição | Label |
|----------|-------|
| `status === 'expired'` | Expirado |
| `status === 'disputed'` | Em Disputa |
| `protectedUntil > now` | Protegido |
| Caso contrário | Desprotegido |

## Contagem regressiva (UI)

Função `formatProtectionRemaining(protectedUntil, nowMs?)` — exemplos: `2h 15min`, `45 min`, `1 dia 3h`.

Componente `TerritoryProtectionCountdown`:
- Atualiza a cada **30s** enquanto montado
- Só visível quando `displayKind === 'protected'`
- Integrado no popup do mapa e no `TerritoryCard`

Territórios **Em Disputa** não mostram contador (prioridade do status disputado).

## Persistência na conquista

[`lib/territory/run-territory.ts`](../../lib/territory/run-territory.ts) grava `status: 'protected'` por defeito (exceto overlap com amigo → `disputed`).

Bloqueio de invasão continua em `geoLogic` via `protectedUntil` — sem alteração.

## Consumidores

- [`components/territory/territory-card.tsx`](../../components/territory/territory-card.tsx)
- [`components/map/territory-map.tsx`](../../components/map/territory-map.tsx)

**Nota:** Cliente não pode `updateDoc` em `territories` (Firestore rules). Após expiração, o rótulo passa a **Desprotegido** via helper; o contador deixa de ser exibido.
