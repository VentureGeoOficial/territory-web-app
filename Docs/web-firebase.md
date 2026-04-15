# TerritoryRun Web (Next.js) + Firebase

## Escopo

Este repositório é a aplicação **web** (Next.js 16, deploy Vercel / v0), distinta do app **Expo/React Native** descrito noutros documentos do produto. A captura de território no browser é feita por **desenho de polígono** no mapa (Leaflet), não por tracking GPS contínuo como no mobile.

## Funcionalidades

| Área | Descrição |
|------|-----------|
| Auth | Firebase Authentication (email/senha) quando `NEXT_PUBLIC_FIREBASE_*` está definido; caso contrário, login **mock** (`demo@territory.run` / `demo123`). |
| Cadastro `/cadastro` | Registo com perfil (nome, username único, data nascimento, sexo, peso, altura) em `users` + `usernames`. Ver [cadastro-usuario.md](cadastro-usuario.md). |
| Home `/` | Landing pública ou **dashboard** autenticado (resumo, ranking prévia, atalhos). |
| Mapa `/mapa` | Mapa + desenho de território; com Firebase, persistência em `territories` e atualização de stats em `users`. |
| Competição `/competicao` | Ranking global (Firestore `users` por `totalAreaM2`); separador “Amigos” filtra por amizades aceites. |
| Amigos `/amigos` | Pedidos em `friendRequests`; lista de amigos com perfil em `users`. |
| Troféus `/trofeus` | Regras em `lib/gamification/trophies.ts` (área, territórios, amigos). |

## Variáveis de ambiente

Ver [`.env.example`](../.env.example). Sem variáveis Firebase, o modo demo local mantém dados no cliente (Zustand + dados mock do mapa).

## Regras e índices Firestore

- [`firestore.rules`](../firestore.rules) — leitura pública de `users` e `territories` (ranking/mapa); escrita apenas pelo dono autenticado onde aplicável; coleção `usernames` para reserva de username único no registo.
- [`firestore.indexes.json`](../firestore.indexes.json) — índices compostos para consultas de `friendRequests`.

## Diferenças face ao app Expo

| Tema | Expo (docs legado) | Web (este repo) |
|------|-------------------|-----------------|
| Captura | Loop GPS, anti-fraude, buffer Turf | Desenho no mapa, mesma ideia de área `areaM2` |
| Navegação | Tab bar / expo-router | Rotas Next.js `app/` |
| Backend local | Mock + SecureStore | Mock + `localStorage` (auth) |
