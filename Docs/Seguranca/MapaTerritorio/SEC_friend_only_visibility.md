# SEC — Visibilidade de territórios apenas para amigos

**Data da análise:** 2026-05-19  
**Severidade corrigida:** ALTA  
**Ficheiros principais:** `firestore.rules`, `lib/firebase/territories.ts`, `functions/src/index.ts`, `hooks/use-firestore-territory-sync.ts`

---

## Vulnerabilidade (antes)

### Descrição

A coleção `territories` tinha `allow read: if true` em `firestore.rules`. Qualquer cliente (autenticado ou não) podia ler todos os territórios via SDK Firestore, expondo localização aproximada (centro + polígono) de todos os utilizadores.

### Trecho afetado

```javascript
match /territories/{territoryId} {
  allow read: if true;  // ← leitura pública
}
```

### Risco

- **Privacidade:** vazamento de padrões de movimento e domínio territorial de utilizadores não relacionados.
- **Enumeração:** scraping em massa da coleção `territories`.
- **OWASP:** A01 Broken Access Control, A02 Cryptographic Failures (dados sensíveis sem controlo de acesso).

---

## Correção aplicada

### Modelo

1. Denormalização: `friendships/{ownerUid}/list/{friendUid}` escrita apenas por Admin (Cloud Function + backfill).
2. Rules: leitura de `territories` permitida se `resource.data.userId == request.auth.uid` **ou** `exists(friendships/{auth.uid}/list/{ownerUserId})`.
3. Cliente: query `where('userId', 'in', [own, ...friends])` em batches de 30 (defense-in-depth + performance).

### Trecho corrigido

```javascript
match /territories/{territoryId} {
  allow read: if isSignedIn() && (
    resource.data.userId == request.auth.uid
    || isFriendOf(resource.data.userId)
  );
}
```

### Comportamento de negócio

- Território de amigo conquistado por não-amigo: `userId` muda para o conquistador → some do mapa (regra estrita).
- Sem amigos: utilizador vê apenas os próprios territórios.

---

## Runbook de deploy (ordem obrigatória)

| Passo | Ação | Rules | Risco se invertido |
|-------|------|-------|-------------------|
| 1 | Deploy Cloud Function `onFriendRequestStatusChange` | Permissivas | Novas amizades sem arestas até passo 2 |
| 2 | `npx tsx scripts/backfill-friendships.ts` | Permissivas | Amigos antigos invisíveis após passo 4 |
| 3 | Deploy cliente (query por `userId in`) | Permissivas | Nenhum (compatível) |
| 4 | Deploy `firestore.rules` apertadas | **Restritivas** | Blackout do mapa se passo 2 omitido |
| 5 | Monitorar `permission-denied` 24h | Restritivas | — |

### Validação pós-backfill

```
nº docs em friendships/*/list/*  ≈  2 × nº friendRequests com status=accepted
```

### Checklist manual (E2E)

1. Contas A e B sem amizade: cada um vê só os próprios territórios.
2. A aceita pedido de B: em ≤2s ambos veem territórios um do outro.
3. Conta C (não-amiga): territórios de C invisíveis para A e B.
4. C completa corrida: território de C continua invisível para A/B.
5. (DevTools) `getDocs` em `territories` autenticado como A: apenas docs de A e amigos; sem auth → `permission-denied`.

---

## Plano de rollback

Se após o **passo 4** houver falhas generalizadas:

1. Reverter `firestore.rules` para `allow read: if true` em `territories` (deploy ~30s).
2. Cliente continua funcional com filtro `userId in` (menos dados, sem erro).
3. Investigar logs `territory_visibility_error` com `code: permission-denied`.
4. Re-executar backfill se arestas em falta; re-aplicar rules quando consistente.

**Não** reverter cliente antes das rules — o cliente antigo subscrevia coleção inteira e falharia com rules novas.

---

## Referências

- [Firestore Security Rules — exists()](https://firebase.google.com/docs/firestore/security/rules-conditions#access_other_documents)
- [Query limitations — `in` max 30 values](https://firebase.google.com/docs/firestore/query-data/queries#in_not-in)
