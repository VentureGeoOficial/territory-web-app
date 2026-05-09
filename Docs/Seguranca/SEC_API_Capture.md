# SEC_API_Capture

**Rota:** [`POST /api/territories/capture`](../../app/api/territories/capture/route.ts)

## Controlo de acesso

| Verificação | Estado |
|-------------|--------|
| Bearer obrigatório | OK — 401 sem token |
| verifyIdToken | OK — uid confiável; **`checkRevoked: true`** via `verifyAuthOrFail` |
| Body Zod | OK — limites `routeJson`, pontos |
| Geofence Suzano | OK — alinhado cliente/servidor |

## Riscos

| Risco | Severidade | Nota |
|-------|------------|------|
| `get()` massivo em territórios | **MÉDIO / ALTO** (volume) | Mitigado parcialmente: `queryTerritoriesForGameplay()` usa `where('status','in',[active,disputed,protected])` — exclui `expired`; monitorizar custos |
| Admin SDK bypass Firestore rules | Esperado | Servidor deve replicar invariantes — feito via domínio + transaction |

## Logs

Falha `verifyIdToken` → `console.warn` sem token — OK.
