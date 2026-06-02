# DOC_territory-display-status

**Ficheiro:** [`lib/territory/territory-display-status.ts`](../../lib/territory/territory-display-status.ts)

## Objetivo

Unificar rótulos **Protegido** / **Desprotegido** na UI usando `protectedUntil` e `status` persistido.

## Regras de exibição

| Condição | Label |
|----------|-------|
| `status === 'expired'` | Expirado |
| `status === 'disputed'` | Em Disputa |
| `protectedUntil > now` | Protegido |
| Caso contrário | Desprotegido |

## Persistência na conquista

[`lib/territory/run-territory.ts`](../../lib/territory/run-territory.ts) grava `status: 'protected'` por defeito (exceto overlap com amigo → `disputed`).

Bloqueio de invasão continua em `geoLogic` via `protectedUntil` — sem alteração.

## Consumidores

- [`components/territory/territory-card.tsx`](../../components/territory/territory-card.tsx)
- [`components/map/territory-map.tsx`](../../components/map/territory-map.tsx)

**Nota:** Cliente não pode `updateDoc` em `territories` (Firestore rules). Transição `protected` → `active` após expiração é reflectida na UI pelo helper; valor em FS pode permanecer `protected` até job servidor futuro.
