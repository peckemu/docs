# Moderation

Players report each other in the game. Staff act in the game with the client's moderator tools and review reports through the API.

Staff means any account with `players.moderate`. The built-in roles with it are `owner`, `admin` and `moderator`. See [Permissions](./permissions).

## Reports

| Packet                   | Handler                                          | Keeps                                 |
| ------------------------ | ------------------------------------------------ | ------------------------------------- |
| `ReportIncoming`         | `apps/emulator/src/handlers/moderation/report`   | Reporter, player, reason and room     |
| `ReportEvidenceIncoming` | `apps/emulator/src/handlers/moderation/evidence` | The same, plus the data type and data |

A player can send 5 reports a minute. A report is refused if the player doesn't exist, if it's about the reporter's own player, or if the evidence is longer than 64 characters.

Reports go in the `reports` table as `open`. They stay open until staff resolve them through the API.

## Staff tools

| Tool      | Handler                                           | Kept as         |
| --------- | ------------------------------------------------- | --------------- |
| Ban       | `apps/emulator/src/handlers/moderation/ban`       | `ban` sanction  |
| Mute      | `apps/emulator/src/handlers/moderation/mute`      | `mute` sanction |
| Silence   | `apps/emulator/src/handlers/moderation/silence`   | `mute` sanction |
| Kick      | `apps/emulator/src/handlers/moderation/kick`      | Audit log only  |
| Invisible | `apps/emulator/src/handlers/moderation/invisible` | Audit log only  |

Mute and silence do the same thing. Silence keeps the reason the moderator picked and mute keeps reason `0`.

Each tool can be used 10 times in 10 seconds. Invisible can be toggled 5 times in 5 seconds.

These three are only on the API and the console.

| Tool                   | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| Broadcast              | Shows a message to every player on every node                |
| Ending a party         | Ends a hosted party early and gives the host's diamonds back |
| Redacting a Jam-a-Gram | Changes a Jam-a-Gram's message, which updates in the inbox   |

Reports only say who sent a Jam-a-Gram, so you'll need to find its id in the `jamagrams` table yourself. Redacting it to an empty message hides the report button too.

## How long sanctions last

From `packages/game/src/moderation/index.ts`.

| Tool            | Unit    | `0`                 | Below `0` | Longest  |
| --------------- | ------- | ------------------- | --------- | -------- |
| Ban             | Hours   | Forever             | Forever   | 10 years |
| Mute or silence | Minutes | Lifts running mutes | Forever   | 10 years |

Anything longer than 10 years is cut down to 10 years. If an account has more than one running ban or mute, the one that ends last counts.

## Who can act on whom

The moderation tools handler's `refusal` decides.

::: code-group

```ts [apps/emulator/src/handlers/moderation/tools/index.ts]
const actor = await this.access.actorOf(staff.accountId)
if (!can(actor, 'players.moderate')) return 'not staff'
if (!target) return 'no such player'
if (target.accountId === staff.accountId) return 'own account'

const other = await this.access.actorOf(target.accountId)
if (can(other, 'players.moderate') && other.rank >= actor.rank) {
  return 'staff outranks'
}
```

:::

Staff can act on any player who isn't staff. To act on other staff they need a higher rank. Nobody can act on their own account, even from another player on it. A refused action is logged at `warn` with the reason and the client is told it failed.

## Ban

The ban is put on the account and covers every player on it. Every node gets a `player-banned` event, tells that account's players how long is left and closes them.

A banned account can't get back in.

| Where          | Answer                               |
| -------------- | ------------------------------------ |
| `POST /play`   | `403` with `Account is banned`       |
| Emulator login | Login fails with `Account is banned` |

## Mute

A muted player can't send chat they type or typed Jam-a-Grams. The other chat kinds still work. Every node gets a `player-muted` event and tells the player how many minutes are left.

Mutes are loaded again at login. Logging out won't clear one. A mute of `0` minutes lifts every running mute on the account and sends `player-unmuted`. It's refused if there was nothing to lift.

## Kick

A kick only works if the player is online on any node. It sends `player-kicked` and the node with the player tells them and closes their connection. Nothing stops them logging in again.

## Invisible

Staff log in invisible. The login handler sets it.

::: code-group

```ts [apps/emulator/src/handlers/session/login/index.ts]
player.moderator = can(actor, 'players.moderate')
player.invisible = player.moderator
```

:::

The invisible packet turns it off and on. An invisible player:

- isn't shown to anyone in the room
- can't use room chat
- isn't counted in the buddy counts for each land or the server selector
- can't be found by buddies looking for where they are
- can't be asked to a minigame table

Every toggle is written to the audit log.

## Audit log

Moderation writes these rows to `audit_log`. They can be read with `GET /access/audit`, which needs `audit.read`.

| Action              | Target           | Detail                                    |
| ------------------- | ---------------- | ----------------------------------------- |
| `player.banned`     | Player           | Sanction id, reason, note, when it ends   |
| `player.muted`      | Player           | Sanction id, reason, note, when it ends   |
| `player.kicked`     | Player           | Note                                      |
| `player.invisible`  | The staff player | Whether they're now invisible             |
| `sanction.lifted`   | Player           | Sanction id and kind                      |
| `report.resolved`   | Report           |                                           |
| `server.broadcast`  | Every server     | The message and whether it's a system one |
| `party.ended`       | The host         |                                           |
| `jamagram.redacted` | The sender       | The card's id, the old and new message    |

## API

Every route needs a session token as `Authorization: Bearer <token>`, and `players.moderate` unless it says otherwise. They're in `apps/api/src/modules/moderation/routes/index.ts`.

| Route                                | What it does                                       |
| ------------------------------------ | -------------------------------------------------- |
| `GET /moderation/reports`            | Lists the open reports, oldest first               |
| `PUT /moderation/reports/:id`        | Resolves a report                                  |
| `GET /moderation/sanctions`          | Lists the running bans and mutes, newest first     |
| `DELETE /moderation/sanctions/:id`   | Lifts a ban or mute                                |
| `POST /moderation/broadcast`         | Shows a message to everyone. Needs `server.manage` |
| `DELETE /moderation/parties/:gameId` | Ends a player's hosted party                       |
| `PUT /moderation/jamagrams/:id`      | Changes a Jam-a-Gram's message                     |

Resolving a report that isn't open answers `404` with `Report is not open`. Lifting a sanction that has ended or was already lifted answers `404` with `Sanction is not running`.

Bans and mutes can only be given in the game. The API can only lift them.

A broadcast takes `{ "text": "...", "system": true }`. The text can be up to 256 characters with no `%` or `|`. Ending a party answers `404` if the player isn't found. A redaction takes `{ "message": "..." }`, and leaving it out clears the message.

The console's `broadcast` and `party:end` do the same as the API, but aren't written to the audit log.

The lists come back as `{ "data": [...] }`. The views are in `apps/api/src/modules/moderation/views/index.ts`.

A report has `id`, `reporter`, `reported`, `reasonId`, `dataType`, `data`, `roomName` and `createdAt`. `reporter` and `reported` each have a `gameId` and `username`.

A sanction has `id`, `kind`, `player`, `reasonId`, `note`, `createdAt` and `expiresAt`. `expiresAt` is `null` when it lasts forever.

Lifting a mute tells the nodes straight away. If the account has another mute still running, the player stays muted until that one ends. Lifting a ban sends nothing, since the player isn't online. They can log in again.
