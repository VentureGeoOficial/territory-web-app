# DOC_GraphImports

## Fluxo de dados principal (textual)

```mermaid
flowchart TB
  subgraph ui [app components]
    Pages
    MapUI[map-controls territory-map]
  end
  subgraph state [Zustand]
    AuthZ[auth-store]
    TerrZ[territory-store]
    RunZ[run-store]
  end
  subgraph libdata [lib]
    FirebaseLib[lib/firebase]
    AuthLib[lib/auth]
    DomainLib[lib/territory]
  end
  subgraph external [External]
    FB[Firebase]
    Vercel[Vercel Analytics]
  end

  Pages --> AuthZ
  MapUI --> TerrZ
  MapUI --> RunZ
  MapUI --> FirebaseLib
  AuthLib --> FirebaseLib
  FirebaseLib --> FB
  DomainLib --> MapUI
  Pages --> Vercel
```

## Acoplamento crítico

- **`lib/firebase/client.ts`** é importado por quase toda a camada de dados cliente — mudanças na init Firebase afetam mapa, perfil, amigos.
- **`lib/data/territory-repository.ts`** é o único ponto para leaderboard/territories subscription — mas `useLeaderboardPreview` **contorna** o repositório (acoplamento duplicado).

## Imports circulares

Não foram detetados ciclos óbvios entre `lib/firebase/config` → `client` (config não importa client). Validação estática recomendada com `madge` ou ESLint import plugin (não configurado no repo).
