# Observabilidade — camada Firebase

Mapa dos logs existentes nos fluxos críticos relacionados à inicialização e
uso do Firebase, alinhado à regra interna de observabilidade do projeto.

> O projeto não possui um helper `logger` centralizado: o padrão atual é
> `console.error / console.warn` em pontos críticos. Esta documentação
> consolida o que existe e onde, sem introduzir uma dependência nova.

## 1. Inicialização

### `lib/config/firebase-env.ts` (cliente)

- Função: `assertFirebasePublicConfig()`.
- Comportamento: lança `Error` com mensagem que **lista os campos
  ausentes** quando `NEXT_PUBLIC_FIREBASE_*` está incompleto.
- Nível: **ERROR** (a exceção é propagada e termina o fluxo de chamadas
  como `getFirebaseApp()`).
- Contexto incluído: lista de campos com problema.
- Dados sensíveis: nenhum — só nomes de campos.

### `lib/config/firebase-admin-env.ts` (servidor)

- Função: `getFirebaseAdminCredential()`.
- Três pontos de erro:
  1. Variável ausente — mensagem clara, sem incluir valor.
  2. JSON malformado — inclui a mensagem do `JSON.parse`, que não contém a
     `private_key` quando o erro é sintático.
  3. Campos obrigatórios em falta — lista os campos do schema Zod.
- Nível: **ERROR**.
- Dados sensíveis: nunca — `private_key` jamais é referenciada na
  mensagem.

## 2. Rota `POST /api/territories/capture`

Fluxo crítico (operação financeira/territorial transacional). Logs atuais:

| Evento | Local | Nível | Justificação |
|--------|-------|-------|--------------|
| `verifyIdToken` falhou | `app/api/territories/capture/route.ts` (catch do verify) | **WARN** | Falha de autenticação — caso obrigatório de log; inclui `reason` mas **nunca o token** |
| Erro genérico no handler | `app/api/territories/capture/route.ts` (catch externo) | **ERROR** | Captura tudo o resto via `console.error(e)`; o middleware do runtime Vercel adiciona timestamp/request id automaticamente |

Casos retornados ao cliente sem log adicional (já comunicados via HTTP):

- 400 (validação Zod, área inválida, sem sobreposição) — falha esperada,
  não precisa de log para auditoria.
- 402 (`INSUFFICIENT_XP`), 403 (`PROTECTED`), 409 (`NOT_FOUND`) — eventos
  de negócio, retornados com `code` próprio.
- 503 (servidor não configurado) — degradação infraestrutural; o erro de
  origem já foi lançado por `getFirebaseAdminCredential()` e capturado.

## 3. Dados sensíveis

Conforme a política do projeto, **nunca** logamos:

- `accessToken` / `idToken` (Firebase Id Token).
- `private_key` da Service Account.
- E-mails completos sem mascaramento (em logs de erro genéricos, e-mails só
  aparecem se o framework do Firebase os incluir na mensagem; nesses casos
  ficam confinados aos logs server-side).

## 4. Riscos operacionais identificados

| Risco | Status | Ação |
|-------|--------|------|
| Falhas de `verifyIdToken` mudas dificultavam debug | Corrigido nesta refatoração | `console.warn` com `reason` adicionado |
| `console.error(e)` no catch externo pode incluir mensagens longas | Aceite | Vercel trunca corretamente; aceitável como rede de segurança |
| Sem tracing distribuído | Aberto | Considerar OpenTelemetry/Vercel Otel se a operação crescer |

## 5. Próximos passos sugeridos

- Introduzir um helper `logger` mínimo (`lib/observability/logger.ts`) com
  formato consistente (`[ts] [level] [op] context`) e mascaramento de
  segredos. Manter compatibilidade com `console.*` para zero overhead.
- Padronizar nomes de operações (`op: 'capture.verifyToken'`) para facilitar
  filtros nos logs da Vercel.
- Avaliar Sentry / Logflare quando a base de utilizadores justificar.
