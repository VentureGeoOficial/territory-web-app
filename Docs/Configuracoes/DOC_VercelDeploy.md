# DOC_VercelDeploy

Deploy da aplicação Next.js na Vercel com variáveis de ambiente para Firebase.

## Documento canónico

O passo a passo completo está na raiz do repositório:

- **[DEPLOY_VERCEL_FIREBASE.md](../../DEPLOY_VERCEL_FIREBASE.md)**

## Resumo técnico

- Variáveis públicas: `NEXT_PUBLIC_FIREBASE_*` — incorporadas no **build**; alterações exigem **redeploy**.
- Variável servidor: `FIREBASE_SERVICE_ACCOUNT_JSON` — **sem** prefixo `NEXT_PUBLIC_`; necessária para [`POST /api/territories/capture`](../../app/api/territories/capture/route.ts).

## Documentação Firebase interna

- [Docs/Firebase/variaveis-ambiente.md](../Firebase/variaveis-ambiente.md)
- [Docs/Firebase/arquitetura.md](../Firebase/arquitetura.md)
