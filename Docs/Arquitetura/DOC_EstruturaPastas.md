# DOC_EstruturaPastas

Raiz do projeto (monólito Next.js + pasta opcional `functions/` para Firebase Cloud Functions).

```text
app/                    # App Router: layouts, páginas, API routes
  (authenticated)/      # Grupo de rotas protegidas por AuthGuard
  api/                  # Route handlers (server)
components/             # UI: auth, home, layout, map, territory, brand, ui (shadcn)
hooks/                  # Hooks React do domínio
lib/
  auth/                 # Schemas Zod, auth-service, tipos de sessão
  config/               # firebase-env (público), firebase-admin-env (server-only)
  data/                 # TerritoryRepository / LeaderboardRepository (Firebase vs mock)
  firebase/             # Cliente Firebase, admin, Firestore helpers
  gamification/         # Troféus
  pwa/                  # Service worker
  services/             # Ex.: location-service (geolocalização)
  store/                # Zustand: auth, territory, run
  territory/            # Domínio puro: geo, tipos, geração de polígonos, scoring
Docs/                   # Documentação (este índice)
functions/              # Cloud Functions (deploy Firebase CLI, separado do Vercel)
```

## Convenções de import

- Alias `@/*` → raiz do projeto ([tsconfig.json](../../tsconfig.json)).

## Ficheiros de configuração na raiz

- [next.config.mjs](../../next.config.mjs), [postcss.config.mjs](../../postcss.config.mjs), [package.json](../../package.json), [firebase.json](../../firebase.json), [firestore.rules](../../firestore.rules), [firestore.indexes.json](../../firestore.indexes.json), [components.json](../../components.json) (shadcn).
