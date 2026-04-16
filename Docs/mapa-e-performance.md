# Mapa, Renderização e Performance

Este documento descreve como o mapa do TerritoryRun Web é construído, como o estado é sincronizado com o Leaflet e quais otimizações já existem (e futuras) para performance.

## 1. Componentes principais do mapa

### 1.1 `MapWrapper` (`components/map/map-wrapper.tsx`)

- Responsável por:
  - Fazer o import dinâmico de `TerritoryMap` e `MapControlsOverlay` com `ssr: false` para evitar problemas de Leaflet no SSR.
  - Envolver o mapa em um container `relative h-full w-full min-w-0` para funcionar bem em layouts `flex` com sidebar.

### 1.2 `TerritoryMap` (`components/map/territory-map.tsx`)

- Usa **react-leaflet**:
  - `MapContainer`, `TileLayer`, `Polygon`, `Polyline`, `CircleMarker`, `Popup`, `useMap`, `useMapEvents`.
- Responsável por:
  - Criar e destruir o mapa Leaflet (via `mapRef` + cleanup em `useEffect`).
  - Sincronizar:
    - Centro e zoom entre Leaflet e `territory-store`.
    - Eventos de clique para modo desenho (`draw`).
  - Renderizar:
    - Polígonos de territórios (`TerritoryPolygon`).
    - Camada de desenho (`DrawingLayer`).
    - Botão de localização (`LocationControl`).

### 1.3 `MapControlsOverlay` (`components/map/map-controls.tsx`)

- Renderizado fora do `MapContainer`, em overlay absoluto.
- Controla:
  - Início/cancelamento do modo desenho (`setMapMode` / `clearDrawing`).
  - Desfazer último ponto (`removeLastDrawingPoint`).
  - Finalizar desenho (`finishDrawing`).
- Exibe:
  - CTA principal “Desenhar Território”.
  - Indicadores de número de pontos e dicas de uso.

### 1.4 `TerritorySidebar` (`components/territory/territory-sidebar.tsx`)

- Lista de territórios com filtros:
  - Todos, Meus, Em disputa.
- Exibe stats do usuário atual (quantidade de territórios, área total).
- Permite:
  - Selecionar território (centraliza o mapa).
  - Colapsar/expandir sidebar.
- Em mobile, a navegação principal é feita via `Header` (menu sheet); a sidebar fixa é exibida apenas em telas grandes (`lg`).

## 2. Estado do mapa

O estado do mapa é mantido na `territory-store` (`lib/store/territory-store.ts`):

- `mapCenter: Position` — `[lng, lat]` atual.
- `mapZoom: number` — nível de zoom atual.
- `mapMode: 'view' | 'draw' | 'simulate'` — modo atual (visualização ou desenho).
- `selectedTerritoryId: string | null` — id do território selecionado.
- `drawingPoints: Position[]` — pontos do desenho em andamento.
- `isDrawing: boolean` — se o usuário está desenhando.

### 2.1 Sincronização Leaflet ⇄ store

- `MapEventHandler`:
  - Em `click`:
    - Se `mapMode === 'draw'`, adiciona ponto a `drawingPoints`.
  - Em `moveend`:
    - Lê `map.getCenter()` e atualiza `mapCenter`.
  - Em `zoomend`:
    - Lê `map.getZoom()` e atualiza `mapZoom`.

- `MapViewSync`:
  - No primeiro render, aplica `map.setView([mapCenter[1], mapCenter[0]], mapZoom)` usando valores da store.
  - Garante que, ao recarregar a página dentro de uma sessão, a visão inicial use o último estado conhecido.

## 3. Desenho de territórios

- `MapControlsOverlay` alterna o modo:
  - `setMapMode('draw')` limpa `drawingPoints` e marca `isDrawing = true`.
  - `clearDrawing()` retorna `mapMode` para `'view'`.
- `DrawingLayer`:
  - Lê `drawingPoints` e `isDrawing` da store.
  - Renderiza:
    - Polyline conectando os pontos.
    - `CircleMarker` para cada ponto (primeiro ponto maior, indicando início do loop).
    - Linha de fechamento e preenchimento semi-transparente quando há 3+ pontos (preview de polígono).
- Ao finalizar:
  - `finishDrawing()` usa `createTerritoryFromDrawing` (domínio) para gerar `Territory`.
  - Em caso de sucesso:
    - Atualiza a lista de territórios (incluindo disputa).
    - Limpa `drawingPoints`, `isDrawing` e volta o modo para `'view'`.
  - `MapControlsOverlay` então aciona a persistência via repositório.

## 4. Otimizações de performance atuais

### 4.1 Memoização de componentes

- `TerritoryPolygon`:
  - Envolvido em `React.memo`.
  - Props:
    - `territory`, `isOwn`, `isSelected`, `onClick`.
  - Calcula `positions` (`LatLngExpression[]`) a partir de `territory.polygon.geometry.coordinates[0]`.
  - Determina cor, espessura e opacidade com base em status/seleção.
  - Renderiza `Popup` com informações do território.

- `DrawingLayer`:
  - Envolvido em `React.memo`.
  - Só renderiza quando `isDrawing === true` e há pontos.

- `MapControlsOverlay`:
  - Também envolvido em `React.memo`.
  - Usa selectors específicos da `territory-store` para reduzir re-renders (lê apenas `mapMode`, `drawingPoints` e funções de ação).

### 4.2 Selectors do Zustand

- Em vez de ler a store inteira, os componentes usam selectors:
  - `useTerritoryStore((s) => s.territories)`.
  - `useTerritoryStore((s) => s.currentUserId)`.
  - `useTerritoryStore((s) => s.selectedTerritoryId)`.
  - Isso reduz re-renders quando partes não relevantes do estado mudam.

### 4.3 Lazy loading / code splitting

- `TerritoryMap` e `MapControlsOverlay` são importados dinamicamente em `MapWrapper`:
  - `dynamic(() => import('./territory-map').then(mod => mod.TerritoryMap), { ssr: false, loading: ... })`.
  - Garante:
    - Mapa só é carregado quando necessário (rota `/mapa`).
    - Problemas de SSR com Leaflet são evitados.

### 4.4 Skeleton loaders

- Em outras páginas (ranking, amigos, troféus), há skeletons reutilizáveis (`components/ui/skeletons.tsx`).
- Embora não específicos do mapa, contribuem para uma sensação de performance geral quando dados vêm do Firestore.

## 5. Layout e responsividade do mapa

### 5.1 Desktop

- Layout em `app/(authenticated)/mapa/page.tsx`:
  - Header fixo no topo.
  - `div` principal com `flex` horizontal:
    - Sidebar de territórios:
      - Envolvida num `div` com `hidden lg:block` para aparecer apenas em telas grandes.
      - Componente `TerritorySidebar` usa `w-80`, `border-r`, `shrink-0`.
    - `main` com `flex-1 relative min-w-0` contendo `MapWrapper`.
- Isso garante que:
  - O mapa ocupe todo o espaço restante ao lado da sidebar.
  - Não haja overflow horizontal nem sobreposição da sidebar pelo mapa.

### 5.2 Mobile

- A navegação lateral é feita pelo `Header`:
  - Botão hambúrguer (`Sheet` do shadcn/ui) abre um menu lateral com:
    - Links de navegação.
    - Stats do usuário (territórios, área).
    - Ações de usuário (logout).
- A sidebar fixa (`TerritorySidebar`) é escondida (`hidden lg:block`).
- O mapa ocupa toda a área abaixo do header, com controles e CTA flutuando por cima.

## 6. Ideias de escala (chunking / viewport)

Atualmente, `subscribeTerritories` escuta a coleção inteira de `territories`. Para escalar:

- **Indexação geoespacial simples**:
  - Adicionar campos como:
    - `bboxCenterGeohash` (geohash do centro).
    - Ou `regionId` (ID de célula de uma grid fixa).
  - Indexar esses campos em `firestore.indexes.json`.

- **Queries por viewport**:
  - A cada mudança significativa de viewport (center/zoom), calcular:
    - Quais geohashes/células estão visíveis.
  - Substituir `query(collection(db, 'territories'))` por:
    - `where('bboxCenterGeohash', 'in', [...hashesVisiveis])`.
  - Manter um cache local por célula para evitar repetir leituras.

- **Limite de polígonos renderizados**:
  - Em zoom baixo:
    - Renderizar apenas polígonos agregados ou um heatmap simples (futuro).
  - Em zoom alto:
    - Renderizar todos os polígonos detalhados para a área visível.

Essas estratégias ainda não estão implementadas, mas o design do adapter (`TerritoryRepository`) e do domínio permite evoluir nessa direção sem mudar a UI.

## 7. Recomendações para contribuições futuras

- Para novas features no mapa:
  - Mantenha a lógica de domínio em `lib/territory/*`.
  - Use `territory-store` apenas como orquestrador de estado/UI.
  - Faça uso de `React.memo`, `useMemo`, `useCallback` e selectors de Zustand ao criar novos componentes pesados.
- Para otimizações:
  - Evite ler a store inteira em componentes de mapa; prefira selectors específicos.
  - Perfilar re-renders com as DevTools de React quando adicionar novas interações.

