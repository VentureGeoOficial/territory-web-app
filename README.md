# TerritoryRunAplicativo

Aplicação web [Next.js](https://nextjs.org) (v0 / Vercel) — mapa territorial, ranking, amigos e troféus.

## Requisitos

- Node.js LTS
- Opcional: projeto [Firebase](https://console.firebase.google.com) (Authentication + Firestore) para dados em nuvem

## Configuração

1. `npm install`
2. Copie [`.env.example`](./.env.example) para `.env.local` e preencha as chaves `NEXT_PUBLIC_FIREBASE_*` se for usar Firebase.
3. No Firebase Console: ative **Email/senha**; faça deploy de [`firestore.rules`](./firestore.rules) e [`firestore.indexes.json`](./firestore.indexes.json) (CLI ou consola).

Sem variáveis Firebase, o app corre em **modo demo**: login `demo@territory.run` / `demo123` e dados mock no mapa.

## Comandos

```bash
npm run dev    # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Documentação

- [Visão web + Firebase](Docs/web-firebase.md)
- [Modelo Firestore](Docs/modelo-dados-firestore.md)
- [Cadastro de utilizador](Docs/cadastro-usuario.md)

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing (visitante) ou dashboard (autenticado) |
| `/login` | Entrada |
| `/cadastro` | Criar conta (Firebase) |
| `/mapa` | Mapa e desenho de território |
| `/competicao` | Ranking global e entre amigos |
| `/amigos` | Pedidos e lista de amigos |
| `/trofeus` | Conquistas |

## Built with v0

Este repositório pode estar ligado a um projeto [v0](https://v0.app); merges em `main` podem disparar deploy na Vercel.
