# TerritoryRunAplicativo

Aplicação web [Next.js](https://nextjs.org) (v0 / Vercel) — mapa territorial, ranking, amigos e troféus.

## Requisitos

- Node.js LTS
- Projeto [Firebase](https://console.firebase.google.com) (Authentication + Firestore) — obrigatório para fluxos autenticados (login, mapa, ranking, amigos).

## Configuração

1. `npm install`
2. **Produção (Vercel):** configure as variáveis no painel da Vercel — ver [DEPLOY_VERCEL_FIREBASE.md](./DEPLOY_VERCEL_FIREBASE.md).
3. **Desenvolvimento local:** copie [`.env.example`](./.env.example) para `.env.local` e preencha. Este ficheiro é ignorado pelo Git e usado apenas pelo `next dev` local.
4. No Firebase Console: ative **Email/senha** (e opcionalmente Google); faça deploy de [`firestore.rules`](./firestore.rules) e [`firestore.indexes.json`](./firestore.indexes.json).

Sem as variáveis Firebase configuradas, apenas as rotas públicas (landing, termos, privacidade) funcionam — o login fica desativado.

## Comandos

```bash
npm run dev    # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Documentação

- [Deploy Vercel + Firebase](DEPLOY_VERCEL_FIREBASE.md)
- [Arquitetura Firebase](Docs/Firebase/arquitetura.md)
- [Variáveis de ambiente](Docs/Firebase/variaveis-ambiente.md)
- [Análise de segurança da config Firebase](Docs/Seguranca/firebase-config/SEC_firebase-env.md)
- [Visão web + Firebase](Docs/web-firebase.md)
- [Modelo Firestore](Docs/modelo-dados-firestore.md)
- [Cadastro de utilizador](Docs/cadastro-usuario.md)
- [LGPD e transparência](Docs/lgpd.md)

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing (visitante) ou dashboard (autenticado) |
| `/login` | Entrada |
| `/cadastro` | Criar conta (Firebase) |
| `/esqueci-senha` | Recuperação de senha |
| `/mapa` | Mapa e desenho de território |
| `/competicao` | Ranking global e entre amigos |
| `/amigos` | Pedidos e lista de amigos |
| `/trofeus` | Conquistas |
| `/conta` | Dados pessoais, personalização e notificações |
| `/seguranca` | Política e alteração de senha |
| `/ajuda` | FAQ, suporte e versão |
| `/termos` | Termos de Uso |
| `/privacidade` | Política de Privacidade |

## Built with v0

Este repositório pode estar ligado a um projeto [v0](https://v0.app); merges em `main` podem disparar deploy na Vercel.
