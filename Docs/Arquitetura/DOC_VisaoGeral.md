# DOC_VisaoGeral

**Finalidade:** visão geral do sistema TerritoryRun Web com base no código e configuração atuais.

## O que é

Aplicação **Next.js 16** (App Router) com **React 19**, UI **shadcn/ui** (Radix + Tailwind 4), estado com **Zustand**, integração **Firebase** (Auth + Firestore no cliente; Admin SDK na rota API de captura), mapa com **Leaflet + react-leaflet**, geometria com **@turf/turf**.

## Domínio funcional

- Territórios desenhados ou gerados a partir de corrida GPS no mapa.
- Gamificação: XP, ranking, troféus, amigos (Firestore).
- Autenticação por email/senha e Google (popup), sessão em Zustand persistida em `localStorage`.

## O que não existe neste repositório

- **Middleware** Next.js (`middleware.ts`) — não há.
- **WebSockets** — não há.
- **Cache HTTP dedicado** (Redis et al.) — não há; estado principalmente em Zustand + Firestore real-time.
- **Controllers** no sentido MVC separados — lógica em `lib/`, componentes e route handlers.
- **Backend REST** além de **uma** rota: `POST /api/territories/capture`.

## Referências cruzadas

- Estrutura de pastas: [DOC_EstruturaPastas.md](DOC_EstruturaPastas.md)
- Stack: [DOC_StackTecnologica.md](DOC_StackTecnologica.md)
- Inicialização: [DOC_Inicializacao.md](DOC_Inicializacao.md)
