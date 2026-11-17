# API

The API is in `apps/api`. It listens on `API_PORT`, which is `3000` by default. Bodies and replies are JSON unless a route says otherwise.

## Signing in

Sign in with `POST /auth/sessions`. The reply has a session token and a refresh token.

Send the session token on routes that need it.

```http
Authorization: Bearer <token>
```

| Token         | Lasts    |
| ------------- | -------- |
| Session token | 24 hours |
| Refresh token | 30 days  |

When the session token runs out, send the refresh token to `POST /auth/sessions/refresh`. The old session is deleted and you get a new pair.

A route with a permission also checks the account has it. Without it the API answers `403`.

## Errors

Errors come back in one shape.

```json
{ "error": { "code": "NOT_FOUND", "message": "Not found" } }
```

| Code           | Status |
| -------------- | ------ |
| `INVALID`      | `400`  |
| `UNAUTHORIZED` | `401`  |
| `FORBIDDEN`    | `403`  |
| `NOT_FOUND`    | `404`  |
| `CONFLICT`     | `409`  |
| `UNAVAILABLE`  | `503`  |
| `INTERNAL`     | `500`  |

A body or path that fails validation gets `INVALID` with the first problem as the message.

## Flash routes

`/wall`, `/mp` and `/crossdomain.xml` are called by the game client. They skip CORS and the security headers, and send `Cache-Control: no-store` unless the route sets its own. Browsers can only call the other routes from the sites in `API_ORIGINS`.

## Health

| Method | Path      | Auth | Permission | Returns              |
| ------ | --------- | ---- | ---------- | -------------------- |
| `GET`  | `/health` | No   |            | `{ "status": "ok" }` |

## Auth

| Method   | Path                     | Auth | Permission | Returns         |
| -------- | ------------------------ | ---- | ---------- | --------------- |
| `POST`   | `/auth/sessions`         | No   |            | `201` a session |
| `POST`   | `/auth/sessions/refresh` | No   |            | A new session   |
| `DELETE` | `/auth/sessions/current` | Yes  |            | `204`           |

### `POST /auth/sessions`

| Field      | Type   | Rules                                           |
| ---------- | ------ | ----------------------------------------------- |
| `login`    | string | Username or email                               |
| `password` | string | Required                                        |
| `device`   | string | 1 to 80 characters, `Unknown device` by default |

A wrong login or password gets `401`. A banned account gets `403`.

### `POST /auth/sessions/refresh`

| Field          | Type   |
| -------------- | ------ |
| `refreshToken` | string |

An unknown or expired refresh token gets `401`.

### Session

| Field              | What it is                  |
| ------------------ | --------------------------- |
| `token`            | Session token               |
| `refreshToken`     | Refresh token               |
| `expiresAt`        | When the session token ends |
| `refreshExpiresAt` | When the refresh token ends |

`DELETE /auth/sessions/current` signs out the session whose token you sent.

## Accounts

| Method | Path                   | Auth | Permission | Returns                   |
| ------ | ---------------------- | ---- | ---------- | ------------------------- |
| `POST` | `/accounts`            | No   |            | `201` the account         |
| `GET`  | `/accounts/me`         | Yes  |            | The account               |
| `GET`  | `/accounts/me/players` | Yes  |            | `{ data }` of its players |

### `POST /accounts`

| Field      | Rules                                  |
| ---------- | -------------------------------------- |
| `username` | 3 to 20 letters, digits or underscores |
| `email`    | An email address, up to 254 characters |
| `password` | 8 to 128 characters                    |

### Account

| Field            | What it is             |
| ---------------- | ---------------------- |
| `id`             | Account id             |
| `username`       | Username               |
| `email`          | Email address          |
| `emailConfirmed` | Whether it's confirmed |
| `createdAt`      | When it was made       |

### Player

| Field         | What it is            |
| ------------- | --------------------- |
| `gameId`      | Game id               |
| `username`    | Username              |
| `slot`        | Slot on the account   |
| `accountType` | Account type          |
| `createdAt`   | When it was made      |
| `lastLoginAt` | Last login, or `null` |

## Access

| Method   | Path                                         | Auth | Permission       | Returns                   |
| -------- | -------------------------------------------- | ---- | ---------------- | ------------------------- |
| `GET`    | `/access/me`                                 | Yes  |                  | Your role and permissions |
| `GET`    | `/access/permissions`                        | Yes  | `roles.read`     | `{ data }` of permissions |
| `GET`    | `/access/roles`                              | Yes  | `roles.read`     | `{ data }` of roles       |
| `POST`   | `/access/roles`                              | Yes  | `roles.manage`   | `201` the role            |
| `PUT`    | `/access/roles/:id`                          | Yes  | `roles.manage`   | The role                  |
| `DELETE` | `/access/roles/:id`                          | Yes  | `roles.manage`   | `204`                     |
| `PUT`    | `/access/accounts/:id/role`                  | Yes  | `roles.manage`   | `204`                     |
| `PUT`    | `/access/accounts/:id/overrides/:permission` | Yes  | `accounts.grant` | `204`                     |
| `DELETE` | `/access/accounts/:id/overrides/:permission` | Yes  | `accounts.grant` | `204`                     |
| `GET`    | `/access/audit`                              | Yes  | `audit.read`     | `{ data, meta }`          |

Every `:id` here is a UUID. `:permission` is a permission key of up to 64 characters.

`GET /access/me` returns `role`, `rank`, `permissions` and `owner`.

### Role body

`POST /access/roles` and `PUT /access/roles/:id` take the same body.

| Field         | Rules                                      |
| ------------- | ------------------------------------------ |
| `name`        | 1 to 40 characters                         |
| `description` | Up to 280 characters, empty by default     |
| `color`       | `#rrggbb`                                  |
| `rank`        | Whole number from 1 to 99                  |
| `permissions` | Up to 100 permission keys, none by default |

### Role

| Field         | What it is              |
| ------------- | ----------------------- |
| `id`          | Role id                 |
| `key`         | Built-in key, or `null` |
| `name`        | Name                    |
| `description` | Description             |
| `color`       | Colour                  |
| `rank`        | Rank                    |
| `builtIn`     | Whether Peck made it    |
| `permissions` | Permission keys         |

Peck's own roles can't be changed. A role still held by accounts can't be deleted and gets `409`. You can't change your own access.

### Permission

| Field         | What it is     |
| ------------- | -------------- |
| `key`         | Permission key |
| `group`       | Group          |
| `label`       | Name           |
| `description` | What it allows |

### `PUT /access/accounts/:id/role`

| Field    | Rules                         |
| -------- | ----------------------------- |
| `roleId` | A role id, or `null` for none |

### `PUT /access/accounts/:id/overrides/:permission`

| Field    | Rules               |
| -------- | ------------------- |
| `effect` | `grant` or `revoke` |

`DELETE` on the same path removes the override.

### `GET /access/audit`

| Query    | Rules                     |
| -------- | ------------------------- |
| `limit`  | 1 to 100, `50` by default |
| `offset` | 0 or more, `0` by default |

Each entry has `id`, `at`, `actorId`, `action`, `targetKind`, `targetId`, `targetName` and `detail`. `meta` repeats the `limit` and `offset`.

## Play

| Method | Path    | Auth | Permission | Returns          |
| ------ | ------- | ---- | ---------- | ---------------- |
| `POST` | `/play` | Yes  |            | A ticket to play |

It picks a node and issues a login ticket for it.

| Field       | What it is                      |
| ----------- | ------------------------------- |
| `ticket`    | Login ticket                    |
| `expiresAt` | When it ends, 5 minutes on      |
| `server`    | The API's address, `API_URL`    |
| `username`  | The player's username           |
| `gameId`    | The player's game id, or `null` |
| `node`      | The node's `id` and `name`      |
| `flashvars` | The client's settings           |

A banned account gets `403`. With no node open, or `CONTENT_URL`, `GAME_DEPLOY_VERSION` or `GAME_BUILD_VERSION` unset, it answers `503`.

## Servers

| Method | Path                 | Auth | Permission      | Returns             |
| ------ | -------------------- | ---- | --------------- | ------------------- |
| `GET`  | `/servers`           | No   |                 | `{ data }` of nodes |
| `GET`  | `/servers/:id/rooms` | No   |                 | `{ data }` of rooms |
| `PUT`  | `/servers/:id/drain` | Yes  | `server.manage` | `204`               |

`:id` is the node id. An unknown node gets `404`.

### Server

| Field      | What it is                   |
| ---------- | ---------------------------- |
| `id`       | Node id                      |
| `name`     | Name players see             |
| `players`  | Players on it                |
| `capacity` | Player limit                 |
| `status`   | `open`, `full` or `draining` |

### Room

| Field         | What it is       |
| ------------- | ---------------- |
| `name`        | Full room name   |
| `displayName` | Name players see |
| `players`     | Players in it    |
| `capacity`    | Players it holds |

### `PUT /servers/:id/drain`

| Field      | Rules   |
| ---------- | ------- |
| `draining` | Boolean |

A draining node takes nobody new. The change goes in the audit log.

## Launcher

These sit at the root of the API.

| Method | Path         | Auth   | Permission | Returns       |
| ------ | ------------ | ------ | ---------- | ------------- |
| `GET`  | `/flashvars` | No     |            | The flashvars |
| `GET`  | `/player`    | Ticket |            | The player    |

`GET /player` takes the login ticket from `POST /play` as the bearer token. It doesn't use up the ticket. A ticket that has run out gets `401`.

### Flashvars

| Field              | What it is                    |
| ------------------ | ----------------------------- |
| `content`          | `CONTENT_URL`                 |
| `deploy_version`   | `GAME_DEPLOY_VERSION`         |
| `build_version`    | `GAME_BUILD_VERSION`          |
| `smartfoxServer`   | Node's public host            |
| `smartfoxPort`     | Node's public port            |
| `blueboxServer`    | Node's public host            |
| `blueboxPort`      | Node's public port            |
| `smartfoxTls`      | Always `0`                    |
| `website`          | `WEBSITE_URL`                 |
| `mdUrl`            | `API_URL` with a trailing `/` |
| `playerWallHost`   | `API_URL` followed by `/wall` |
| `currentTimestamp` | Time now in seconds           |

### Player

| Field               | What it is          |
| ------------------- | ------------------- |
| `id`                | Account id          |
| `screen_name`       | Player's username   |
| `game_account_type` | Account type        |
| `language`          | Always `en`         |
| `game_server`       | Node as `host:port` |
| `rename_required`   | Always `false`      |

## Masterpieces

These sit at the root of the API. Pictures are kept in the S3 bucket.

| Method | Path                         | Auth | Permission            | Returns            |
| ------ | ---------------------------- | ---- | --------------------- | ------------------ |
| `GET`  | `/crossdomain.xml`           | No   |                       | Flash policy file  |
| `POST` | `/mp`                        | No   |                       | Upload result      |
| `GET`  | `/masterpieces/pending`      | Yes  | `masterpieces.review` | `{ data }` waiting |
| `GET`  | `/masterpieces/:id/review`   | Yes  | `masterpieces.review` | The picture        |
| `PUT`  | `/masterpieces/:id/decision` | Yes  | `masterpieces.review` | `204`              |
| `GET`  | `/masterpieces/:id`          | No   |                       | The picture        |

`:id` looks like `ps-` followed by a UUID.

### `POST /mp`

The game uploads here. It's a form with two fields.

| Field       | What it is                 |
| ----------- | -------------------------- |
| `authToken` | Upload token from the game |
| `image`     | The picture, up to 1 MB    |

It answers `{ "success": true, "uuid": "<id>" }`, or `{ "success": false }` if anything is wrong or no bucket is set.

### Reviewing

`GET /masterpieces/pending` lists each waiting picture's `id` and its `creator` with `gameId` and `username`.

`GET /masterpieces/:id/review` returns a waiting or approved picture. `GET /masterpieces/:id` only returns approved ones and is cached for 10 minutes. Both answer `404` if there's no picture.

`PUT /masterpieces/:id/decision` takes `{ "approve": true }` or `false`. A rejected picture is deleted from the bucket. A picture that isn't waiting gets `404`.

## Walls

| Method | Path    | Auth  | Permission | Returns          |
| ------ | ------- | ----- | ---------- | ---------------- |
| `POST` | `/wall` | Token |            | Depends on `cmd` |

The Jammer Wall in the client calls this. The body is JSON, up to 16 KB. `cmd` says what to do and `t` is the wall token the emulator gives out for the `wt` packet.

| `cmd` | Extra fields  | What it does                    |
| ----- | ------------- | ------------------------------- |
| `CHK` |               | When the wall last changed      |
| `GET` |               | The wall's posts and look       |
| `PUT` | The post      | Posts on the wall               |
| `DEL` | `x`           | Deletes a post                  |
| `GMB` |               | Posts the player has hidden     |
| `AMB` | `x`           | Hides a post                    |
| `CLW` |               | Clears the player's own wall    |
| `RMP` | `mp`          | Takes masterpieces off own wall |
| `ACK` | `x` as a list | Marks replies as read           |

A post is cut to 70 characters. Muted players can't post, and nobody can post more than 6 times a minute. A bad token gets `{ "s": false, "e": "token" }`.

## Moderation

| Method   | Path                          | Auth | Permission         | Returns                         |
| -------- | ----------------------------- | ---- | ------------------ | ------------------------------- |
| `GET`    | `/moderation/reports`         | Yes  | `players.moderate` | `{ data }` of open reports      |
| `PUT`    | `/moderation/reports/:id`     | Yes  | `players.moderate` | `204`, resolves it              |
| `GET`    | `/moderation/sanctions`       | Yes  | `players.moderate` | `{ data }` of running sanctions |
| `DELETE` | `/moderation/sanctions/:id`   | Yes  | `players.moderate` | `204`, lifts it                 |
| `POST`   | `/moderation/broadcast`       | Yes  | `server.manage`    | `202`, sends it                 |
| `DELETE` | `/moderation/parties/:gameId` | Yes  | `players.moderate` | `202`, ends it                  |
| `PUT`    | `/moderation/jamagrams/:id`   | Yes  | `players.moderate` | `204`, changes its message      |

`:id` is a UUID for reports and sanctions, and a whole number for Jam-a-Grams. `:gameId` is the host's game id. A report that isn't open, a sanction that isn't running, or a host that doesn't exist gets `404`.

### Broadcast body

| Field    | What it is                                              |
| -------- | ------------------------------------------------------- |
| `text`   | Up to 256 characters, with no `%` or `\|`               |
| `system` | Whether it shows as a system message, `true` by default |

### Redact body

| Field     | What it is                                         |
| --------- | -------------------------------------------------- |
| `message` | Up to 256 characters with no `%`, empty by default |

### Report

| Field       | What it is              |
| ----------- | ----------------------- |
| `id`        | Report id               |
| `reporter`  | `gameId` and `username` |
| `reported`  | `gameId` and `username` |
| `reasonId`  | Rule broken             |
| `dataType`  | Kind of thing reported  |
| `data`      | The thing reported      |
| `roomName`  | Reporter's room         |
| `createdAt` | When it was made        |

### Sanction

| Field       | What it is              |
| ----------- | ----------------------- |
| `id`        | Sanction id             |
| `kind`      | `ban` or `mute`         |
| `player`    | `gameId` and `username` |
| `reasonId`  | Rule broken             |
| `note`      | Staff note              |
| `createdAt` | When it was given       |
| `expiresAt` | When it ends, or `null` |
