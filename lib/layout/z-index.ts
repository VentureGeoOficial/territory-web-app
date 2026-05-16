/**
 * Escala de z-index da app (mapa, nav, overlays).
 * Ordem crescente: mapa → controlos → bottom nav → header → menus → modais críticos.
 */
export const Z_MAP_CONTROLS = 1000
export const Z_BOTTOM_NAV = 1100
export const Z_HEADER = 1200
export const Z_OVERLAY = 1300
export const Z_OVERLAY_PANEL = 1301
export const Z_MODAL = 2000

/** Classes Tailwind (literais estáticos para o scanner do build). */
export const zMapControls = 'z-[1000]'
export const zBottomNav = 'z-[1100]'
export const zHeader = 'z-[1200]'
export const zOverlay = 'z-[1300]'
export const zOverlayPanel = 'z-[1301]'
export const zModal = 'z-[2000]'
