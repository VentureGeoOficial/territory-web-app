# SEC — auth-store.ts

**Severidade:** ALTO (corrigido)

**Problema:** `accessToken` e `refreshToken` persistidos em `localStorage` via Zustand — risco XSS.

**Correção:** `partialize` mantém apenas `user` e `expiresAt`. Tokens renovados via Firebase SDK (`getFreshIdToken`).

**Data:** 2026-05-19
