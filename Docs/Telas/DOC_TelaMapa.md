# DOC_TelaMapa

**Rota:** `/mapa`  
**Ficheiro:** [`app/(authenticated)/mapa/page.tsx`](../../app/(authenticated)/mapa/page.tsx)

Hooks: `useFirestoreTerritorySync`, `useCurrentUserPublicProfile(uid)`, `useUserPositionTracking`, `useFriendIds`.

`MapWrapper` recebe `friendIds` — [`TerritoryMap`](../../components/map/territory-map.tsx) destaca territórios de amigos (contorno tracejado mais espesso, badge «Amigo» no popup). Legenda no [`MapControlsOverlay`](../../components/map/map-controls.tsx) (desktop).

Layout fullscreen: `Header`, `MapWrapper`, `MobileBottomNav`. Altura `100dvh` + `overflow-hidden` para evitar scroll que desloca overlays.

CTA de corrida fixo ao viewport (ver `DOC_MapControlsOverlay`). Âncora tutorial: `data-tour="map-area"` no `MapWrapper`.
