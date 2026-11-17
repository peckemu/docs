# Events

`setup` gets a `PluginContext`. It's how a plugin gets at the rest of the emulator.

| Member     | What it is                                             |
| ---------- | ------------------------------------------------------ |
| `log`      | A logger with the plugin's name on every line          |
| `events`   | The events below                                       |
| `sessions` | Every open session                                     |
| `database` | The database                                           |
| `get`      | Gets anything out of the emulator's container by token |

`stop` gets the same context.

## Listening

`context.events.on` takes the event name and a listener, and gives back a function that stops listening.

```ts twoslash
import { Plugin, type PluginContext } from '@peck/plugins'
// ---cut---
export default class WelcomePlugin extends Plugin {
  public readonly name = 'welcome'

  public readonly version = '1.0.0'

  public override setup(context: PluginContext): void {
    context.events.on('login', (session) => {
      context.log.info({ player: session.player?.username }, 'logged in')
    })
  }
}
```

| Event    | Listener gets       | When                           |
| -------- | ------------------- | ------------------------------ |
| `start`  |                     | The emulator has started       |
| `stop`   |                     | The emulator is stopping       |
| `login`  | `session`           | A player logs in               |
| `logout` | `session`           | A logged in player disconnects |
| `join`   | `session`, `roomId` | A player joins a room          |
| `leave`  | `session`, `roomId` | A player leaves a room         |

Listeners run one after another and can be async. If one throws, the error is logged and the rest still run. A broken plugin can't stop players logging in.

`roomId` is the id of that copy of the room, which changes every time the emulator restarts. Use `session.player?.room?.template.name` for a name that stays the same.

## Sessions

A session is one player's connection.

| Member          | What it is                         |
| --------------- | ---------------------------------- |
| `id`            | The session id                     |
| `player`        | The player, or `null` before login |
| `authenticated` | Whether they've logged in          |
| `closed`        | Whether the connection has closed  |
| `log`           | A logger with the session id on it |
| `send(packet)`  | Sends a packet                     |
| `close()`       | Closes the connection              |

`context.sessions` is every open session on this node. You can loop over it with `for...of`.

| Member                              | What it does                         |
| ----------------------------------- | ------------------------------------ |
| `size`                              | How many sessions are open           |
| `get(id)`                           | Finds a session by id, or `null`     |
| `byPlayer(gameId)`                  | Finds a player's session, or `null`  |
| `inRoom(roomId)`                    | Lists the sessions in a room         |
| `broadcast(roomId, packet, except)` | Sends a packet to everyone in a room |

These only see players on the node the plugin is running on. With more than one node, a player on another node won't be in here. See [Clustering](/guide/clustering).

## Sending a packet

Build the packet with `PacketFactory` and send it.

```ts twoslash
import { RoomChatOutgoing } from '@peck/packets'
import { type PluginContext } from '@peck/plugins'
import { PacketFactory } from '@peck/protocol'
import { ChatKind } from '@peck/shared'

declare const context: PluginContext
// ---cut---
context.events.on('join', async (session, roomId) => {
  if (!session.player) return

  await context.sessions.broadcast(
    roomId,
    PacketFactory.create<RoomChatOutgoing>(RoomChatOutgoing, {
      room: roomId,
      userId: session.player.id,
      text: 'Hello',
      kind: ChatKind.Free,
    }),
    session,
  )
})
```

This makes every player who joins a room say hello to everyone already there. Leaving `session` off the end would send it to them as well.

## The container

`context.get` gets anything the emulator's container holds, using the same tokens as Peck.

```ts twoslash
import { type Logger } from '@peck/logger'
import { LoggerToken, RedisToken, type PluginContext } from '@peck/plugins'
import { type RedisClient } from '@peck/redis'

declare const context: PluginContext
// ---cut---
const redis = context.get<RedisClient>(RedisToken)
const log = context.get<Logger>(LoggerToken)
```

`DatabaseToken`, `RedisToken` and `LoggerToken` come from `@peck/plugins`. The database is already on the context, so its token is rarely needed here.
