# DOC_HomePageClient

**Ficheiro:** [`components/home/home-page-client.tsx`](../../components/home/home-page-client.tsx)

- Aguarda hidratação auth persist; até lá `<SplashScreen />`.
- Se autenticado: `<AuthenticatedDashboard />`; senão `<MarketingLanding />`.
- **Observabilidade:** contém `console.log("[v0] ...")` — ruído em produção; considerar remoção.
