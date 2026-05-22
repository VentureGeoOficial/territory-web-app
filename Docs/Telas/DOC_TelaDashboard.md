# DOC_TelaDashboard

**Rota:** `/dashboard`  
**Ficheiros:** [`app/(authenticated)/dashboard/page.tsx`](../../app/(authenticated)/dashboard/page.tsx), [`app/(authenticated)/dashboard/layout.tsx`](../../app/(authenticated)/dashboard/layout.tsx)

## Objetivo

Dashboard esportivo com estatísticas agregadas, histórico de percursos e gráfico de evolução. Módulo isolado — não altera mapa, corrida ou auth.

## Navegação

- **Menu lateral (sheet):** primeiro item — `Dashboard` (`LayoutDashboard`) em [`lib/navigation/nav-config.ts`](../../lib/navigation/nav-config.ts).
- **Header:** botão de acesso rápido `LayoutDashboard` → `/dashboard` (à esquerda do menu do utilizador).
- **Barra inferior:** sem entrada Dashboard (inalterada).

## Compatibilidade mobile

- Gráfico (`PerformanceChart`): carregado com `next/dynamic` e `ssr: false` em [`dashboard/page.tsx`](../../app/(authenticated)/dashboard/page.tsx).
- Datas na timeline: `toLocaleString('pt-BR')` em [`activity-card.tsx`](../../components/dashboard/activity-card.tsx) (sem `date-fns/locale`).

## Fontes de dados

| Fonte | Módulo |
|-------|--------|
| Agregados de perfil | `publicProfiles` via `useCurrentUserPublicProfile` → `territory-store` |
| Histórico de corridas | Firestore `runs` via [`lib/firebase/dashboard-runs.ts`](../../lib/firebase/dashboard-runs.ts) |
| Cálculos | [`lib/dashboard/aggregate-runs.ts`](../../lib/dashboard/aggregate-runs.ts) |
| Hook | [`hooks/use-dashboard-metrics.ts`](../../hooks/use-dashboard-metrics.ts) |

## Secções da UI

- Resumo geral (KPIs)
- Distância / velocidade (widgets)
- Estatísticas de percurso
- Métricas de movimento (ritmo, passos estimados)
- Gráfico semanal + timeline de atividades

## Observabilidade

Ver [DOC_dashboard_page.md](../Logs/DOC_dashboard_page.md).

## Segurança

Ver [SEC_dashboard_page.md](../Seguranca/dashboard/SEC_dashboard_page.md).
