# Variáveis de ambiente — Firebase

Lista completa das variáveis necessárias e onde configurá-las.

## 1. Cliente (público — bundle do browser)

Prefixo `NEXT_PUBLIC_` faz o Next.js incorporar o valor no JavaScript enviado
para o browser. **Não são segredos** — são identificadores do projeto.
A segurança vem das Firestore Rules, dos domínios autorizados em Firebase
Auth e (recomendado) do Firebase App Check.

| Variável | Obrigatória? | Origem |
|----------|--------------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sim | Firebase Console -> Configurações do Projeto -> Geral -> Apps Web |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sim | Mesmo painel |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sim | Mesmo painel |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sim | Mesmo painel |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Não | Apenas se usar Realtime Database |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Não | Apenas se usar Cloud Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Não | Apenas se usar FCM |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Não | Apenas se usar Analytics |

## 2. Servidor (privado — não exposto ao browser)

| Variável | Obrigatória? | Origem |
|----------|--------------|--------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Sim (para `/api/territories/capture` e qualquer rota que use Admin SDK) | Firebase Console -> Configurações -> Contas de Serviço -> Gerar nova chave privada (JSON) |

> **Crítico:** esta variável **nunca** deve ter prefixo `NEXT_PUBLIC_`.
> No painel da Vercel, certifique-se de que o ambiente selecionado é
> Production / Preview / Development consoante necessário, mas mantenha-a
> sempre como _Server_.

## 3. Como configurar na Vercel

1. Aceda a `https://vercel.com/<org>/<projeto>/settings/environment-variables`.
2. Para cada variável da tabela acima, clique em **Add New**.
3. Cole o nome exato (sensível a maiúsculas) e o valor.
4. Selecione os ambientes (Production, Preview, Development) — o normal é
   marcar todos para variáveis de cliente e apenas Server para
   `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. **Faça redeploy** (`Deployments -> ... -> Redeploy`). Variáveis
   `NEXT_PUBLIC_*` são incorporadas no build, logo só passam a ter efeito
   após um novo build.

## 4. Como colar o JSON da Service Account

O ficheiro descarregado do Firebase tem este formato:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...@....iam.gserviceaccount.com",
  ...
}
```

Duas abordagens funcionam:

- **Cole o JSON inteiro como está** (com quebras de linha reais). A maior
  parte dos painéis (incluindo Vercel) aceita multiline.
- **Compacte para uma linha** com `\n` escapados na `private_key`. O código
  em [`lib/config/firebase-admin-env.ts`](../../lib/config/firebase-admin-env.ts)
  converte `\n` literais para quebras reais antes de chamar `cert()`.

## 5. Validação

- `lib/config/firebase-env.ts` valida o cliente com **Zod**. Falta de uma
  variável obrigatória produz uma mensagem nomeando exatamente o(s) campo(s).
- `lib/config/firebase-admin-env.ts` valida o JSON do servidor (`project_id`,
  `client_email`, `private_key`). JSON malformado ou com campos em falta gera
  um `Error` específico capturado pelas rotas e respondido como `503` em
  [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts).

## 6. Desenvolvimento local

- Copie [`.env.example`](../../.env.example) para `.env.local`.
- O ficheiro `.env*.local` está no [`.gitignore`](../../.gitignore) — nunca
  versione segredos.
- O Next.js carrega automaticamente `.env.local` em `next dev` e `next build`
  locais. Em produção (Vercel), o painel é a fonte da verdade.
