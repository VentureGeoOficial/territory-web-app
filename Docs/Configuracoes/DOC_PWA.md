# DOC_PWA

## Registo do Service Worker

- **Entrada:** [`components/providers.tsx`](../../components/providers.tsx) — `useEffect` chama [`registerServiceWorker`](../../lib/pwa/register-sw.ts).
- **Implementação:** [`lib/pwa/register-sw.ts`](../../lib/pwa/register-sw.ts):
  - Retorna cedo se `NODE_ENV !== 'production'`.
  - Regista `/sw.js` se `'serviceWorker' in navigator`.

## Instalação (prompt)

- Hook [`lib/pwa/use-install-prompt.ts`](../../lib/pwa/use-install-prompt.ts): escuta `beforeinstallprompt`, expõe `promptInstall`, estado `canInstall`.

## Ficheiros SW

- Verificar existência de `public/sw.js` ou gerado por build (não inventado aqui — confirmar na pasta `public/` do projeto).

## Documentação relacionada

- [DOC_FluxoPWA.md](../Fluxos/DOC_FluxoPWA.md)
