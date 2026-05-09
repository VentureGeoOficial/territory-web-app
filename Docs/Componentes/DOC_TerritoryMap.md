# DOC_TerritoryMap

**Ficheiro:** [`components/map/territory-map.tsx`](../../components/map/territory-map.tsx)

**Grande (~460+ linhas).** Responsabilidades principais:

- `MapContainer` / `TileLayer` / polígonos `Polygon` por território; estilos por estado (disputado com pattern SVG).
- Sincronização centro/zoom com Zustand (`MapEventHandler`, `MapViewSync`).
- Modos: visualização, desenho (pontos), corrida — dependem de `mapMode` na store e utilizador atual.
- Marcadores utilizador / corrida: `CircleMarker`, `Polyline` para track GPS.
- Botões de modo no mapa (ex.: Crosshair, MapPin) — ver ficheiro para lista completa.

Dependências: `react-leaflet`, `leaflet`, stores, `formatArea`, `getSuzanoMaxBounds`, cores estáveis.
