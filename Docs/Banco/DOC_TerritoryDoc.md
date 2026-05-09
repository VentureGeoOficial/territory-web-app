# DOC_TerritoryDoc

Mapeamento entre modelo de domínio `Territory` e documento Firestore.

## Ficheiro

[`lib/firebase/territory-doc.ts`](../../lib/firebase/territory-doc.ts)

## Interface `TerritoryFirestoreDoc`

Campos persistidos:

- `userId`, `userName`, `userColor`
- `polygonJson` — string com `JSON.stringify` do `Feature<Polygon>`
- `areaM2`, `createdAt`, `updatedAt`
- `protectedUntil?`, `status`, `dominanceLevel`, `conquestCount`
- `centerLng`, `centerLat` — centro derivado do modelo local `center: Position`

## Funções

| Função | Propósito |
|--------|-----------|
| `territoryToFirestoreDoc(t)` | Domínio → payload Firestore |
| `firestoreDocToTerritory(id, data)` | Firestore → domínio; `JSON.parse` em `polygonJson` |

## Riscos

- `JSON.parse` em dados não confiáveis: em cliente, dados vêm do Firestore após rules; em Admin, dados vêm do servidor.
- Tamanho máximo reforçado nas rules (`polygonJson.size() <= 200000`).
