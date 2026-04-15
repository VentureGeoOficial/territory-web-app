# Modelo de dados Firestore

## Coleção `users`

Documento ID = **UID** do Firebase Auth.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `displayName` | string | Nome apresentado (nome completo no cadastro) |
| `nomeCompleto` | string? | Redundante com displayName quando vem do cadastro |
| `email` | string | E-mail em minúsculas (lookup para amigos) |
| `username` | string? | Slug único (minúsculas, `a-z0-9_`); ver coleção `usernames` |
| `dataNascimento` | string? | Data ISO `YYYY-MM-DD` |
| `sexo` | string? | `male` \| `female` \| `other` \| `prefer_not` |
| `peso` | number? | Peso em kg |
| `altura` | number? | Altura em cm |
| `color` | string | Cor estável no mapa |
| `totalAreaM2` | number | Área acumulada (soma ao criar território) |
| `territoriesCount` | number | Contagem de territórios |
| `xp` | number | XP acumulado (ganho por território) |
| `createdAt` | timestamp | Criação do perfil |
| `updatedAt` | timestamp | Última atualização |

Contas antigas podem não ter os campos opcionais; o login social ou `ensureUserProfile` pode criar só o mínimo.

## Coleção `usernames`

Documento ID = **slug** normalizado (único).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `uid` | string | UID do Firebase Auth dono deste username |
| `createdAt` | timestamp | Reserva do nome |

Criado na transação de registo; impede duplicar o mesmo username.

## Coleção `territories`

Documento ID = **id gerado no cliente** (alinhado ao estado Zustand).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userId` | string | UID do dono |
| `userName`, `userColor` | string | Desnormalizados para o mapa |
| `polygonJson` | string | `JSON.stringify` do `Feature<Polygon>` GeoJSON |
| `areaM2` | number | Área em m² |
| `centerLng`, `centerLat` | number | Centro do polígono |
| `createdAt`, `updatedAt` | number | Epoch ms (consistente com o modelo local) |
| `protectedUntil` | number? | Fim da proteção (3h após captura, regra produto) |
| `status` | string | `active` \| `disputed` \| `protected` \| `expired` |
| `dominanceLevel` | string | Nível visual |
| `conquestCount` | number | Metadado de conquista |

## Coleção `friendRequests`

ID auto-gerado.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `fromUserId` | string | Quem pediu |
| `toUserId` | string | Destino |
| `status` | string | `pending` \| `accepted` \| `rejected` |
| `createdAt` | number | Epoch ms |

Amizade aceite: documento passa a `accepted`; listagens usam queries compostas (`fromUserId`+`status` e `toUserId`+`status`).
