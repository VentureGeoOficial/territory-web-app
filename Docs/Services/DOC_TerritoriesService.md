# DOC_TerritoriesService

**Ficheiro:** [`lib/firebase/territories.ts`](../../lib/firebase/territories.ts)

## `subscribeTerritories(onUpdate, onError?)`

- Retorna `null` se Firebase não configurado.
- Query: coleção `territories` completa (sem filtro geográfico — MVP).
- `onSnapshot` → `firestoreDocToTerritory` por documento.

Persistência de novos territórios e atualização de stats **não** é feita neste módulo — ver `POST /api/runs/complete` e `POST /api/territories/capture` ([`Docs/Firebase/arquitetura-server-side.md`](../Firebase/arquitetura-server-side.md)).

## Re-export

Exporta também helpers de [`territory-doc`](../../lib/firebase/territory-doc.ts).
