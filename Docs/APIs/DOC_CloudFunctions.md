# DOC_CloudFunctions

**Pasta:** [`functions/`](../../functions/)  
**Config:** [`firebase.json`](../../firebase.json) aponta `source: "functions"`.

## Código

**Ficheiro:** [`functions/src/index.ts`](../../functions/src/index.ts)

- `admin.initializeApp()` + `getFirestore()` (runtime com credenciais GCP no deploy).
- **Função agendada** `expireStaleTerritories` — `onSchedule` cada 60 min (`America/Sao_Paulo`, região `southamerica-east1`):
  - Query `territories` com `status == 'active'` e `createdAt` < 24h atrás.
  - Atualiza documentos para `expired`, ajusta `users` e `publicProfiles` com incrementos negativos em área e contagem (batches ≤ 450 ops).

**Deploy:** `firebase deploy --only functions` (não passa pela Vercel).

Ver também [DOC_FirebaseJson.md](../Configuracoes/DOC_FirebaseJson.md).
