# Handlers

A handler is a class that deals with one kind of incoming packet. Peck's own are in `apps/emulator/src/handlers`, and the API they're built on is in `@peck/plugins` so plugins can use it too.

## From frame to handler

`Server` in `apps/emulator/src/network/server` reads each frame off the socket and hands it to `Dispatcher.dispatch(session, frame)`.

1. `PacketFactory.parse` turns the frame into a packet.
2. `HandlerRegistry.resolve` finds the handler for that packet's class.
3. If the session hasn't logged in and the handler isn't `@Public()`, the packet is refused.
4. The handler's guards run. The first one to give a reason refuses the packet.
5. The middleware runs in the order it was added, then the handler.

`dispatch` returns what happened.

| Result      | When                                       |
| ----------- | ------------------------------------------ |
| `handled`   | The handler ran without throwing           |
| `unhandled` | Nothing handles that packet                |
| `refused`   | Not logged in, or a guard said no          |
| `failed`    | The handler threw, and the error is logged |

A `ProtocolError` isn't caught. A client that sends a bad frame gets dropped. So is one that's been refused more than `MAX_REFUSED` times.

## Writing a handler

A handler extends `PacketHandler<T>` and has `@Handler(SomePacket)` on it. `@Handler` makes the class injectable, and TypeScript complains if `handle` takes a different packet to the one the decorator names.

::: code-group

```ts twoslash [apps/emulator/src/handlers/like/add/index.ts]
import { inject } from '@needle-di/core'
import { LikeRepository } from '@peck/database'
import { LikeIncoming, LikeOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { LikeTargets } from '#emulator/handlers/like/targets'

/**
 * Likes a wall or a masterpiece
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(LikeIncoming)
export class LikeHandler extends PacketHandler<LikeIncoming> {
  /**
   * Keeps likes
   */
  private readonly likes = inject<LikeRepository>(LikeRepository)

  /**
   * Checks what can be liked
   */
  private readonly targets = inject<LikeTargets>(LikeTargets)

  /**
   * Keeps the like
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: LikeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const type = await this.targets.type(packet.resourceType, packet.resourceId)
    const liked = type
      ? await this.likes.like(type, packet.resourceId, context.player.gameId)
      : false

    await context.reply<LikeOutgoing>(LikeOutgoing, {
      room: packet.room,
      result: liked ? 1 : 0,
    })
  }
}
```

:::

`@Handler` also takes `{ replace: true }`. Without it, two handlers for the same packet is an error when the registry is built.

## Guards

Handlers need a logged in player unless they say otherwise.

| Decorator                   | What it does                                           |
| --------------------------- | ------------------------------------------------------ |
| `@Public()`                 | Lets the packet through before login                   |
| `@Guest()`                  | Refuses it once the player has logged in               |
| `@Keyed()`                  | Refuses it until the session has a login key           |
| `@Throttle({ limit, per })` | Refuses it after `limit` packets in `per` milliseconds |

`@Guest()` and `@Keyed()` only make sense with `@Public()`. Without it, a guest never gets that far. Here's the login key handler.

::: code-group

```ts twoslash [apps/emulator/src/handlers/session/key/index.ts]
import { RandomKeyIncoming, RandomKeyOutgoing } from '@peck/packets'
import { Guest, Handler, PacketHandler, Public } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Sends the login key
 * @class
 */
@Public()
@Guest()
@Handler(RandomKeyIncoming)
export class RandomKeyHandler extends PacketHandler<RandomKeyIncoming> {
  /**
   * Makes a key
   * @param _packet The packet
   * @param context The packet context
   */
  public async handle(
    _packet: RandomKeyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const key = crypto.randomUUID().replaceAll('-', '')
    context.session.randomKey = key
    await context.reply(RandomKeyOutgoing, { key })
  }
}
```

:::

A guard is a class that extends `Guard`, with a `check(context)` that returns the reason to refuse or `null`. `Guard.attach(target, guard)` puts one on a handler. [Packets and handlers](/plugins/handlers#guards) has an example of writing your own.

## Middleware

::: code-group

```ts twoslash [packages/plugins/src/middleware/index.ts]
import { type PacketContext } from '#plugins/context'

/**
 * Runs around a handler
 */
export type Middleware = (
  context: PacketContext,
  next: () => Promise<void>,
) => Promise<void>
```

:::

`Dispatcher.use(middleware)` adds one. The emulator adds each plugin's middleware when it starts. Middleware only sees packets that got past the guards.

## The context

`handle` gets the packet and a `HandlerContext` from `#emulator/dispatch/context`. Plugin handlers use `PacketContext` from `@peck/plugins` instead, which `HandlerContext` implements.

| Member     | What it is                                                    |
| ---------- | ------------------------------------------------------------- |
| `session`  | The session that sent it                                      |
| `packet`   | The packet being handled                                      |
| `sessions` | Every open session                                            |
| `player`   | The logged in player. It throws if there isn't one            |
| `room`     | The player's room, with `id`, `members` and `send`            |
| `log`      | The session's logger                                          |
| `reply`    | Builds a packet with `PacketFactory.create` and sends it back |

`room.send(type, fields, { exceptSelf })` sends to everyone in the player's room. Set `exceptSelf` to leave the sender out.

::: code-group

```ts twoslash [apps/emulator/src/handlers/chat/public/index.ts]
import { PublicChatIncoming, RoomChatOutgoing } from '@peck/packets'

import { type HandlerContext } from '#emulator/dispatch/context'

declare const context: HandlerContext
declare const packet: PublicChatIncoming
// ---cut---
await context.room.send<RoomChatOutgoing>(RoomChatOutgoing, {
  userId: context.player.id,
  text: packet.text,
  kind: packet.kind,
  room: packet.room,
})
```

:::

## Dependencies

Handlers get what they need from Needle DI, with `inject<T>(Token)` in a field. The container is built by `createContainer` in `apps/emulator/src/container`, and the dispatcher asks it for the handler each time a packet comes in.

A class is its own token. Anything that isn't a class uses an `InjectionToken`.

| Token               | Where it comes from | What it gives           |
| ------------------- | ------------------- | ----------------------- |
| `DatabaseToken`     | `@peck/plugins`     | The `Database`          |
| `RedisToken`        | `@peck/plugins`     | The `RedisClient`       |
| `LoggerToken`       | `@peck/plugins`     | The emulator's `Logger` |
| `ConfigToken`       | `#emulator/tokens`  | The emulator config     |
| `ClusterStoreToken` | `#emulator/tokens`  | The `ClusterStore`      |

Repositories, catalogues, game rules and cluster services are bound by class in `createContainer`. A class with `@injectable()` can be injected without being listed anywhere, like `LikeTargets` above.

## The handler list

Peck's handlers are listed by hand in `HANDLERS`. A handler that isn't in the list never runs. If a new one isn't doing anything, check it's in there.

::: code-group

```ts twoslash [apps/emulator/src/handlers/index.ts]
import { type HandlerType } from '@peck/plugins'

import { KeepAliveHandler } from '#emulator/handlers/session/keepalive'
import { RandomKeyHandler } from '#emulator/handlers/session/key'
import { LoginHandler } from '#emulator/handlers/session/login'
import { VersionCheckHandler } from '#emulator/handlers/session/version'

/**
 * The core handlers
 */
export const HANDLERS: readonly HandlerType[] = [
  VersionCheckHandler,
  RandomKeyHandler,
  LoginHandler,
  KeepAliveHandler,
]
```

:::

The real list is a lot longer. `createContainer` builds the registry from `HANDLERS` and then every plugin's handlers.

## Refusals

When a handler has a few reasons to say no, they go in a private `refusal()` method. It returns the reason, or `null` if the packet can go ahead, and `handle` logs it and stops.

::: code-group

```ts twoslash [apps/emulator/src/handlers/chat/public/index.ts]
import { type Player } from '@peck/game'
import { PublicChatIncoming, RoomChatOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { ChatKind } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

const TYPED: ReadonlySet<number> = new Set([
  ChatKind.Free,
  ChatKind.FreeSafeChat,
])
// ---cut---
@Handler(PublicChatIncoming)
export class PublicChatHandler extends PacketHandler<PublicChatIncoming> {
  public async handle(
    packet: PublicChatIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const refusal = this.refusal(packet, context.player)
    if (refusal !== null) {
      context.log.info({ refusal }, 'chat refused')
      return
    }

    await context.room.send<RoomChatOutgoing>(RoomChatOutgoing, {
      userId: context.player.id,
      text: packet.text,
      kind: packet.kind,
      room: packet.room,
    })
  }

  private refusal(packet: PublicChatIncoming, player: Player): string | null {
    if (player.invisible) return 'invisible'
    if (TYPED.has(packet.kind) && player.muted()) return 'muted'

    return null
  }
}
```

:::

The reason doesn't have to be a string. `ItemBuyHandler` returns a `BuyStatus` and sends it straight back to the client with `ItemBuyOutgoing.refused`.

## Adding a handler

1. Write the packet first. See [Packets](./packets).
2. Make a folder for it, like `apps/emulator/src/handlers/<area>/<name>/index.ts`.
3. Write the class with `@Handler(YourIncoming)` and whatever guards it needs.
4. Import it in `apps/emulator/src/handlers/index.ts` and add it to `HANDLERS`.
5. Add a test in `tests/emulator`. See [Testing](./testing).

If you'd rather not touch Peck's code at all, write it as a [plugin](/plugins/introduction).
