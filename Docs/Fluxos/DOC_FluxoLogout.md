# DOC_FluxoLogout

1. Utilizador aciona **Sair** no [`Header`](../../components/layout/header.tsx) dropdown.
2. `signOutRemote()` → Firebase `signOut` se configurado.
3. `finally`: `logout()` Zustand limpa tokens + utilizador.
4. `router.replace('/')`.

Estado local sempre limpo mesmo se rede falhar ao Firebase signOut.
