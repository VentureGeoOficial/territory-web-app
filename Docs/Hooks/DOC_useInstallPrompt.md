# DOC_useInstallPrompt

**Ficheiro:** [`lib/pwa/use-install-prompt.ts`](../../lib/pwa/use-install-prompt.ts)

## Retorno

`{ canInstall, promptInstall }`

## Comportamento

- Escuta `beforeinstallprompt` — `preventDefault()` e guarda evento.
- Escuta `appinstalled` — limpa prompt, marca instalado.
- `promptInstall()` chama `prompt()` e aguarda `userChoice`.

## Uso

Componentes que oferecem "Instalar app" (ver páginas ajuda/conta se aplicável).
