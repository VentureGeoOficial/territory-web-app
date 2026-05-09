# DOC_Glossario

| Termo | Significado no projeto |
|-------|------------------------|
| Território | Polígono GeoJSON no mapa com dono, área (m²), estado (`active`, `disputed`, `protected`, `expired`) |
| Captura hostil | Conquistar área sobreposta a território de outro utilizador via corrida + API capture |
| XP | Pontos cumulativos em `users.xp`; gastos/ganhos em capturas |
| Suzano | Geofence `SUZANO_BOUNDING_BOX` — área permitida para criar território |
| Id Token | JWT Firebase curta duração; enviado como Bearer para `/api/territories/capture` |
| Service Account | Credencial Admin JSON em `FIREBASE_SERVICE_ACCOUNT_JSON` (servidor apenas) |
| publicProfiles | Coleção com dados públicos para ranking e sync de stats |
| AuthGuard | Bloqueia rotas `(authenticated)` até sessão Zustand válida |
