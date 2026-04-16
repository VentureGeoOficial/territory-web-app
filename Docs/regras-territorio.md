# Regras de Negócio de Território

## 1. Conceitos principais

- **Território (`Territory`)**
  - Polígono GeoJSON representando uma área conquistada no mapa.
  - Campos importantes:
    - `id` — gerado no cliente (`generateId`).
    - `userId` — UID do dono do território.
    - `userName`, `userColor` — desnormalizados para exibição rápida.
    - `polygon` — `Feature<Polygon>` com a geometria.
    - `areaM2` — área em metros quadrados (calculada via Turf).
    - `center` — `[lng, lat]` do centro geométrico.
    - `status` — `'active' | 'disputed' | 'protected' | 'expired'`.
    - `dominanceLevel` — `'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'`.
    - `conquestCount` — contador de conquistas associadas.
    - `protectedUntil` — timestamp (ms) até quando o território está protegido.

- **Usuário (`User`)**
  - Modelo local com stats agregados:
    - `totalAreaM2`, `territoriesCount`, `totalDistanceM`, `totalDurationSeconds`.
  - No Firestore, esses campos vivem em `users/{uid}`.

- **Configuração de criação (`TerritoryConfig` / `DEFAULT_TERRITORY_CONFIG`)**
  - `bufferKm` — raio do buffer em volta da rota (default ~30 m).
  - `minPoints` — número mínimo de pontos da rota.
  - `maxLoopGapMeters` — distância máx. entre início/fim para fechar o loop.
  - `minDurationSeconds` — duração mínima da atividade.
  - `protectionTimeMs` — janela de proteção após captura (default 2h).

## 2. Fluxo de captura de território (web)

Na versão web, a captura é feita **desenhando** o polígono diretamente no mapa (não por loop GPS contínuo).

### 2.1 Passos principais

1. Usuário entra em `/mapa` (autenticado).
2. Clica em **“Desenhar Território”**:
   - `MapControlsOverlay` define `mapMode = 'draw'` e limpa `drawingPoints`.
3. Usuário clica no mapa adicionando pontos:
   - `MapEventHandler` (em `TerritoryMap`) escuta `click` e, se `mapMode === 'draw'`, chama `addDrawingPoint([lng, lat])` na `territory-store`.
   - `DrawingLayer` renderiza polyline e pontos em tempo real.
4. Ao atingir 3+ pontos, o botão de finalizar é habilitado:
   - `MapControlsOverlay` exibe feedback visual (“Pronto / Min. 3 pts”).
5. Usuário clica em **confirmar desenho**:
   - `MapControlsOverlay.handleFinishDrawing` chama `finishDrawing()` na `territory-store`.
   - Em caso de sucesso, recebe `newTerritory` e tenta persistir via repositório (Firebase ou mock).

## 3. Cálculo de polígono, centro e área

A lógica de geometria está em `lib/territory/territory-generator.ts`:

- `calculateTerritoryFromPositions(positions, bufferKm)`:
  - Fecha o loop da rota se o último ponto for diferente do primeiro.
  - Cria um `LineString` com as posições.
  - Usa **Turf** para gerar um buffer (`turf.buffer`) em torno da linha.
  - Calcula:
    - `areaM2` via `turf.area`.
    - `center` via `turf.centroid`.
    - `boundingBox` via `turf.bbox`.
  - Retorna `TerritoryCalculation`:
    - `polygon`, `areaM2`, `center`, `boundingBox`.

Essa função é usada pelo domínio (`createTerritoryFromDrawing`) para construir o objeto `Territory`.

## 4. Regras de criação em `createTerritoryFromDrawing`

Arquivo: `lib/territory/domain.ts`.

### 4.1 Entrada

- `drawingPoints: Position[]` — pontos desenhados pelo usuário `[lng, lat]`.
- `currentUserId: string` — dono do território.
- `currentUser?: User` — modelo local (para `displayName` e `color`).
- `authDisplayName?: string | null` — nome exibido vindo do Auth (fallback).
- `existingTerritories: Territory[]` — territórios já conhecidos (para disputa).
- `config?: TerritoryConfig` — sobrescreve `DEFAULT_TERRITORY_CONFIG` opcionalmente.
- `nowMs?: number` — timestamp injetável (útil para testes).

### 4.2 Validações

- Número mínimo de pontos:
  - Se `drawingPoints.length < 3`, lança erro.
- Geofence Suzano:
  - Após calcular `TerritoryCalculation`, verifica se `center` está dentro de `SUZANO_BOUNDING_BOX` (em `lib/territory/regions.ts`).
  - Se não estiver, lança erro `"Território fora da área permitida (Suzano)."`.

### 4.3 Status inicial, proteção e domínio

- Status base:
  - `status` começa como `'active'`.
- Proteção:
  - `protectedUntil = now + protectionTimeMs` (default 2h, pode ser ajustado em `DEFAULT_TERRITORY_CONFIG`).
- Domínio:
  - `dominanceLevel` inicial é `'bronze'`.
  - `conquestCount` inicia em `1`.

Esses valores podem evoluir depois, por exemplo, se o território permanecer ativo por mais tempo ou for reconquistado.

### 4.4 Regras de disputa

- Para cada território em `existingTerritories`:
  - Chama `checkTerritoryIntersection(newPolygon, existing.polygon)` (Turf).
  - Se houver interseção:
    - `status` do novo território é atualizado para `'disputed'`.
    - O território existente também é atualizado para `status = 'disputed'`.
- A função retorna:
  - `territories`: nova lista com todos os territórios atualizados (incluindo os que viraram disputa).
  - `newTerritory`: o território criado, já com status final, `protectedUntil`, etc.

Essa é a principal regra de “guerra de territórios” na camada web.

## 5. Geofence Suzano

Arquivo: `lib/territory/regions.ts` e `lib/firebase/territories.ts`.

- Bounding box aproximada:
  - `SUZANO_BOUNDING_BOX: [minLng, minLat, maxLng, maxLat]`.
- Funções:
  - `isPositionInsideBox(position, box)` — verifica se um `[lng, lat]` está dentro do box.
- Aplicações:
  - **Front (domínio)**:
    - `createTerritoryFromDrawing` rejeita territórios cujo `center` esteja fora do box.
  - **Backend (Firestore)**:
    - `saveTerritoryAndUpdateUserStats` também valida `isPositionInsideBox(territory.center, SUZANO_BOUNDING_BOX)` e lança erro se violado.

Com isso, mesmo um cliente malicioso não consegue gravar territórios fora da região alvo.

## 6. Persistência e contadores (área, territórios, XP)

Persistência em Firestore é feita em `lib/firebase/territories.ts`:

- `saveTerritoryAndUpdateUserStats(territory)`:
  - Verifica se Firebase está configurado (`isFirebaseConfigured()`).
  - Reforça geofence (ver seção anterior).
  - Executa `runTransaction`:
    - Lê `users/{territory.userId}`.
    - Calcula `prevArea`, `prevCount`, `prevXp` com defaults 0.
    - Define `xpGain = max(50, round(territory.areaM2 / 100))`:
      - XP mínimo 50.
      - XP adicional proporcional à área.
    - Escreve `territories/{territory.id}` com o payload do território (inclui `polygonJson`, `centerLng/Lat`, `status`, `dominanceLevel`, etc.).
    - Atualiza `users/{uid}` com:
      - `totalAreaM2 = prevArea + territory.areaM2`
      - `territoriesCount = prevCount + 1`
      - `xp = prevXp + xpGain`
      - `updatedAt = serverTimestamp()`

Assim, `totalAreaM2`, `territoriesCount` e `xp` são **sempre calculados no backend** de forma transacional.

## 7. Modo demo vs modo real nas regras de território

- **Modo real (Firebase configurado)**:
  - `finishDrawing` cria território via `createTerritoryFromDrawing`.
  - `MapControlsOverlay.handleFinishDrawing` usa o `TerritoryRepository` para chamar `saveTerritoryAndUpdateUserStats`.
  - O estado local (`territory-store`) é sincronizado com Firestore via `useFirestoreTerritorySync`.
  - Ranking global é derivado de `users` do Firestore (`subscribeGlobalLeaderboard`).

- **Modo demo (sem Firebase)**:
  - `finishDrawing` ainda aplica todas as regras de domínio (disputa, proteção, geofence).
  - O repositório mock (`createMockTerritoryRepository`) não envia nada para o backend; o território fica apenas na store local.
  - `initMockData` povoa o mapa com usuários/territórios de exemplo.
  - Ranking é derivado de `users` na `territory-store`.

Regras de jogo (disputa, proteção, XP base, geofence) são, portanto, consistentes entre demo e produção, mas apenas em produção há persistência e counters oficiais no Firestore.

## 8. Relação com ranking e gamificação

- **Ranking global**:
  - Usa `totalAreaM2` e `territoriesCount` em `users` (Firestore) para ordenar jogadores.
  - Em modo mock, usa os mesmos campos da `territory-store`.

- **Troféus**:
  - Implementados em `lib/gamification/trophies.ts` (não detalhado aqui).
  - Regras típicas:
    - Área total acima de certos limiares.
    - Número de territórios conquistados.
    - Número de amigos (`friendRequests` aceitos).

Esses troféus podem ser recalculados a partir dos mesmos dados de território e usuários documentados acima.

## 9. Onde alterar regras de negócio

- **Domínio puro (recomendado)**:
  - `lib/territory/domain.ts` — alterar criação de território, regras de disputa, proteção, domínio.
  - `lib/territory/territory-generator.ts` — alterar forma de cálculo do polígono/área.
  - `lib/territory/types.ts` — adicionar novos campos ao modelo (`Territory`, `User`, `TerritoryStatus` etc.).

- **Persistência / XP**:
  - `lib/firebase/territories.ts` — alterar cálculo de XP, limites e como counters são atualizados.
  - `Docs/modelo-dados-firestore.md` — atualizar documentação de campos e significados.

Sempre que alterar regras de negócio críticas, garantir que:
- O domínio (`lib/territory/*`) e o backend (`lib/firebase/*`, `firestore.rules`) fiquem alinhados.
- O modo mock continue usando as mesmas funções de domínio para manter comportamento próximo da produção.

