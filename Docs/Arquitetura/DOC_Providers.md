# DOC_Providers

## Hierarquia (raiz → folha)

```
RootLayout (Server)
  └── Providers (Client) — components/providers.tsx
        └── ThemeProvider — components/theme-provider.tsx (next-themes)
              └── AuthProvider — components/auth/auth-provider.tsx
                    └── {children} (rotas)
        └── Toaster — components/ui/sonner.tsx
```

## ThemeProvider

- Ficheiro: [`components/theme-provider.tsx`](../../components/theme-provider.tsx).
- Wrapper fino em torno de `NextThemesProvider` de `next-themes`.
- Configuração em [`components/providers.tsx`](../../components/providers.tsx): `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`, `forcedTheme="dark"`.

## AuthProvider

- Ficheiro: [`components/auth/auth-provider.tsx`](../../components/auth/auth-provider.tsx).
- Contexto `AuthReadyContext` com `{ firebaseAuthReady: boolean }`.
- Se `isFirebaseConfigured()` é falso: `firebaseAuthReady` começa `true` (não há listener Firebase).
- Se Firebase configurado: import dinâmico de `firebase/auth`, `getFirebaseAuth`, `onAuthStateChanged`; ao mudar utilizador atualiza Zustand (`setSession` / `logout`) e `setCurrentUserId` na territory-store; chama `ensureUserProfile`.

## Toaster

- Sonner; posição `top-center`, `richColors`, `closeButton`.

## Service Worker

- Registo em `useEffect` dentro de `Providers` via [`lib/pwa/register-sw.ts`](../../lib/pwa/register-sw.ts).
