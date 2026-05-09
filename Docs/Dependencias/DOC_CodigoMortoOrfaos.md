# DOC_CodigoMortoOrfaos

Achados por verificação estática no momento da documentação (maio 2026):

| Item | Evidência | Severidade |
|------|-----------|------------|
| `HomePageClient` | Nenhum import em `app/` — apenas define em [`components/home/home-page-client.tsx`](../../components/home/home-page-client.tsx) | **MÉDIO** — dashboard autenticado na `/` não usado |
| `buildFromStore` em `use-global-leaderboard.ts` | Função definida, não referenciada no hook | **BAIXO** |
| `getTerritoryRepository` retorna null sem mock | [`territory-repository.ts`](../../lib/data/territory-repository.ts) — hooks limpam estado; sem Firebase não há fallback local | **BAIXO** design |
| `components/ui/use-mobile.tsx` | Duplica [`hooks/use-mobile.ts`](../../hooks/use-mobile.ts); sidebar usa `hooks` | **BAIXO** duplicação |
| `console.log` em `home-page-client` | Ruído em produção se reativado | **BAIXO** |

Recomendação: remover ou integrar `HomePageClient` em `app/page.tsx` se o produto quiser dashboard na raiz para utilizadores autenticados.
