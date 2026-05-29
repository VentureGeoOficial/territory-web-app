# Validação completa — Territórios, amigos e emoji (protótipo)

**Data:** 2026-05-29  
**Escopo:** feature territorial apenas (sem auth, dashboard, ranking, loja).

---

## 12. Veredito final

### APROVADO PARA PROTÓTIPO (código)

O código está **coerente com as regras de negócio** e recebeu as **correções mínimas P0/P1** desta validação. Pode entrar em **testes reais na web** assim que o checklist Firebase em [FIREBASE_PROTOTIPO_DEPLOY.md](FIREBASE_PROTOTIPO_DEPLOY.md) for concluído.

**Homologação end-to-end** (demo estável para público) permanece **condicional** até:

- publicar rules + índices no Firebase;
- backfill / CF de `friendships`;
- executar roteiro manual cenários 1–5 abaixo e confirmar Vitest localmente.

**Justificativa:** bloqueador crítico de dessincronia client/server em amizades foi corrigido; lógica territorial, captura, emoji, same-owner e notificações estão implementadas e revisadas estaticamente.

---

## 1. Diagnóstico completo

| Camada | Estado |
|--------|--------|
| Territórios individuais | 1 doc por corrida/captura; events em capturas |
| Camadas sociais | Só amigos disputam; estranhos ignorados na geometria |
| Captura | Fluxo XP → emoji → API → transação |
| Same-owner | Sem disputed/captura entre polígonos próprios |
| Notificações | Admin write + listener + toast (com prefs) |
| Amizades (client) | **Corrigido:** `subscribeAcceptedFriends` usa `friendships` |
| Firebase ops | Repo pronto; **deploy manual pendente** |

---

## 2. Resultado por cenário de teste (web)

| # | Cenário | Código (estático) | Web (manual) |
|---|---------|-------------------|--------------|
| 1 | Amigo invade amigo | PASSA | Pendente — executar |
| 2 | Não-amigo não interfere | PASSA | Pendente — executar |
| 3 | Próprio sobre próprio | PASSA | Pendente — executar |
| 4 | Estranhos mesma área | PASSA | Pendente — executar |
| 5 | Emoji na notificação | PASSA | Pendente — executar |
| 7 | Overlap misto | PASSA | Opcional |

### Roteiro manual (mapa)

Use contas **A**, **B** (amigas) e **C** (estranha).

1. **Amigo invade amigo:** A corre sobre B → XP → emoji → sucesso; B recebe toast com emoji.
2. **Não-amigo:** A e C não amigos; A finaliza corrida na mesma área sem captura.
3. **Próprio:** A sobrepõe T1 próprio → novo território `active`.
4. **Estranhos:** B e C estranhos; C domina área; B conclui corrida sem bloqueio.
5. **Emoji:** A envia 😈; B vê toast com emoji.

---

## 3. Resultado por etapa de validação

| Etapa | Resultado |
|-------|-----------|
| 1 Amizades | **OK** após fix client; CF + backfill = ops |
| 2 Visibilidade | **OK** (rules + query self+friends) |
| 3 Captura amigos | **OK** (fluxo completo) |
| 4 Não-amigos | **OK** (`NOT_FRIEND`, `NO_FRIEND_OVERLAP`, overlap ignorado) |
| 5 Mesmo dono | **OK** |
| 6 Emojis | **OK** (whitelist client + Zod server) |
| 7 Notificações | **OK** no código; depende deploy rules/index |
| 8 Firebase | **Pendente ops** — ver checklist deploy |
| 9 Testes auto | **Não executados** neste ambiente (sem `node_modules`); suítes existem |
| 10 Performance | **OK** para protótipo Suzano |
| 11 Riscos | Ver secção 4 |

---

## 4. Riscos encontrados

| Risco | Nível | Status |
|-------|-------|--------|
| Dessincronia friendRequests vs friendships | Médio | **Mitigado** no código; aceite na app já funciona — grafo `friendships` preenchido pela CF no aceite |
| Rules/index não publicados | Crítico | **Pendente ops** |
| Vítima offline sem toast | Alto | Aceito no protótipo |
| Erro listener silencioso | Alto | **Mitigado** (toast em erro) |
| Query global O(N) territórios | Baixo | Aceito |
| `difference_failed` sem notify | Baixo | Documentado |

---

## 5. Correções mínimas aplicadas (esta validação)

| Arquivo | Alteração |
|---------|-----------|
| `lib/firebase/friends.ts` | `subscribeAcceptedFriends` lê `friendships/{uid}/list` |
| `hooks/use-notifications.ts` | Toast se listener falhar |
| `lib/firebase/run-completion.ts` | Mensagens `NOT_FRIEND` / `NO_FRIEND_OVERLAP`; validação emoji |
| `components/map/map-controls.tsx` | Legenda mapa corrigida |
| `Docs/FIREBASE_PROTOTIPO_DEPLOY.md` | Checklist operacional Firebase |

Correções anteriores mantidas: `run-territory` (estranhos), dialog XP “Continuar”, emoji 😀 pré-selecionado.

---

## 6. Arquivos envolvidos

`lib/firebase/admin-friendship.ts`, `lib/firebase/friends.ts`, `lib/territory/geoLogic.ts`, `lib/territory/run-territory.ts`, `lib/territory/capture-reactions.ts`, `lib/firebase/transactions.ts`, `lib/firebase/notifications.ts`, `lib/firebase/territory-events.ts`, `app/api/territories/capture/route.ts`, `app/api/runs/complete/route.ts`, `components/map/map-controls.tsx`, `components/map/capture-xp-dialog.tsx`, `components/map/capture-emoji-dialog.tsx`, `hooks/use-notifications.ts`, `hooks/use-friend-ids.ts`, `hooks/use-firestore-territory-sync.ts`, `functions/src/index.ts`, `scripts/backfill-friendships.ts`.

---

## 7. Regras Firebase envolvidas

- `territories/{id}` — read owner ou `isFriendOf`; write negado ao client
- `friendships/{ownerUid}/list/{friendUid}` — read só owner; write Admin/CF
- `users/{userId}/notifications/{id}` — read owner; write negado ao client
- Índice: `notifications` + `createdAt` DESC (`firestore.indexes.json`)

---

## 8. Status sincronização de amizades

| Item | Status |
|------|--------|
| Convite + aceite na app (`friendRequests`) | **Já funcional** (enviar, receber, aceitar) |
| CF bidirecional no aceite | Implementado em `functions/src/index.ts` (preenche `friendships` ao aceitar) |
| Backfill script | Só para amizades aceites **antes** da CF ou se captura falhar com amigo visível |
| Client alinhado ao grafo | **Sim** (mapa usa `friendships`, não só `friendRequests`) |
| Server / rules | Usam `friendships` |
| Ops deploy + backfill | Verificar no Firebase; pode já estar ok se o mapa entre amigos funciona |

---

## 9. Status sistema de notificações

| Item | Status |
|------|--------|
| Escrita na captura | Sim (`transactions.ts`) |
| Prefs `app` | Respeitadas |
| Listener + toast | Sim (`use-notifications.ts`) |
| Erro visível ao user | Sim (toast em falha de listener) |
| Deploy rules/index | Pendente |

---

## 10. Status sistema de emojis

| Item | Status |
|------|--------|
| Whitelist 😀 😈 🏆 | `capture-reactions.ts` |
| UI | `capture-emoji-dialog.tsx` |
| API Zod | Obrigatório na captura |
| Client guard | `isCaptureReactionEmoji` em `run-completion.ts` |
| Persistência | events + notifications |

---

## 11. Status sistema territorial

| Regra | Status |
|-------|--------|
| Território individual | OK |
| Captura só amigos | OK |
| Estranhos coexistem | OK |
| Same-owner sem disputa | OK |
| Histórico events | OK (capturas) |

---

## Testes automatizados (Etapa 9)

**Execução nesta validação:** não realizada (dependências não instaladas no ambiente do agente).

**Suítes a validar localmente:** `geoLogic-friends`, `run-territory-social-layer`, `capture-emoji-validation`, `territory-capture-partial`, `territory-buffer`, `territory-visibility`, `firestore-rules`.

**Expectativa:** PASSA com base na revisão estática e cobertura dos cenários 1–4 no código.

---

## Critério de aprovação — checklist

| Critério | Status |
|----------|--------|
| Amigo invade amigo | Código OK |
| Não-amigo não interfere | Código OK |
| Mesmo dono sem disputa | Código OK |
| Emoji enviado | Código OK |
| Notificação chega | Código OK (ops + vítima online) |
| Rules publicadas | Pendente ops |
| Índices criados | Pendente ops |
| Grafo friendships sincronizado | Código OK; ops backfill pendente |
| Sem regressão | Validar Vitest local |

---

## Referência rápida (protótipo)

Camadas sociais: cada jogador só disputa com amigos diretos. Estranhos podem ocupar a mesma área sem bloquear. Captura: XP → emoji → notificação à vítima.

Antes da demo: seguir [FIREBASE_PROTOTIPO_DEPLOY.md](FIREBASE_PROTOTIPO_DEPLOY.md).
