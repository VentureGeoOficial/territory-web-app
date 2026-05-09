# DOC_FluxoPWA

1. [`Providers`](../../components/providers.tsx) regista [`registerServiceWorker`](../../lib/pwa/register-sw.ts) em produção → `/sw.js`.
2. [`public/manifest.webmanifest`](../../public/manifest.webmanifest) define ícones/nome (ver ficheiro).
3. [`useInstallPrompt`](../../lib/pwa/use-install-prompt.ts) captura `beforeinstallprompt` na landing.
