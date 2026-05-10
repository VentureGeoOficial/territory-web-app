# DOC_FirebaseUsageBaseline

## Baseline de uso (operacional)

Para comparar **antes/depois** de optimizações de listeners ou queries:

1. Abrir [Firebase Console](https://console.firebase.google.com) → projeto → **Usage and billing** (ou **App Check** / métricas conforme o painel).
2. Filtrar por período (ex.: últimos 7 dias) e anotar:
   - **Firestore reads** totais e, se disponível por coleção, totais para `territories`, `friendRequests`, `publicProfiles`.
   - **Firestore writes** (corridas, capturas, perfis).
3. Repetir após deploy com as mesmas horas de tráfego comparáveis (evitar comparar fim-de-semana com dia útil).

Este passo é **manual** na consola; o código não substitui métricas de produção.

## Relação com o código

- Redução de listeners duplicados GPS: [`hooks/use-user-position-tracking.ts`](../../hooks/use-user-position-tracking.ts) — não altera reads Firestore; alivia CPU no cliente.
- Query por viewport em territórios: [`lib/firebase/territories.ts`](../../lib/firebase/territories.ts) — deve reflectir-se em menos reads de `territories` por sessão de mapa quando há muitos documentos fora do viewport.
