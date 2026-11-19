# Packets and handlers

Plugin handlers work the same as Peck's own. [Handlers](/development/handlers) has the full details, and these are the bits that differ.

## Adding a handler

Write the handler, then list it in the plugin's `handlers`.

```ts twoslash
import {
  Handler,
  type PacketContext,
  PacketHandler,
  Plugin,
} from '@peck/plugins'
import { Field, IncomingPacket, OutgoingPacket, Packet } from '@peck/protocol'

/**
 * Asks how many players are on
 * @class
 */
@Packet('pon', 'xt')
export class OnlineIncoming extends IncomingPacket {}

/**
 * How many players are on
 * @class
 */
@Packet('pon', 'xt')
export class OnlineOutgoing extends OutgoingPacket {
  /**
   * The number of players
   */
  @Field.int() public readonly count: number = 0
}

/**
 * Replies with the player count
 * @class
 */
@Handler(OnlineIncoming)
export class OnlineHandler extends PacketHandler<OnlineIncoming> {
  /**
   * Handles the packet
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: OnlineIncoming,
    context: PacketContext,
  ): Promise<void> {
    await context.reply<OnlineOutgoing>(OnlineOutgoing, {
      room: packet.room,
      count: context.sessions.size,
    })
  }
}

/**
 * Tells players who is on
 * @class
 */
export default class OnlinePlugin extends Plugin {
  /**
   * The plugin name
   */
  public readonly name = 'online'

  /**
   * The plugin version
   */
  public readonly version = '1.0.0'

  /**
   * The handlers
   */
  public override readonly handlers = [OnlineHandler]
}
```

The real client never sends `pon`. A packet like this is only any use with a client you've changed yourself. Plugin handlers type their context as `PacketContext` from `@peck/plugins`. Peck's own handlers use the emulator's `HandlerContext`, which a plugin can't import.

A plugin can't take a header Peck already uses for the same direction and format. To change what one of Peck's packets does, replace its handler instead.

## Replacing one of Peck's handlers

Pass `replace: true` and the plugin's handler runs instead of Peck's.

```ts twoslash
import { PublicChatIncoming } from '@peck/packets'
import { Handler, type PacketContext, PacketHandler } from '@peck/plugins'
// ---cut---
@Handler(PublicChatIncoming, { replace: true })
export class QuietChatHandler extends PacketHandler<PublicChatIncoming> {
  public handle(packet: PublicChatIncoming, context: PacketContext): void {
    context.log.info({ text: packet.text }, 'chat ignored')
  }
}
```

That one ignores every chat message. Anything Peck's handler did, like checking mutes, is now up to yours.

Without `replace`, a second handler for the same packet is an error.

## Guards

Guards are decorators that run before the handler. If one fails, the handler doesn't run and the reason is logged.

| Guard                       | Lets the packet through if                                             |
| --------------------------- | ---------------------------------------------------------------------- |
| `@Public()`                 | Always, even before login                                              |
| `@Guest()`                  | The player hasn't logged in yet                                        |
| `@Keyed()`                  | The session has asked for a login key                                  |
| `@Throttle({ limit, per })` | It's been sent fewer than `limit` times in the last `per` milliseconds |

Handlers without `@Public()` only run for players who have logged in.

You can write your own by extending `Guard`. `check` returns the reason to refuse, or `null`.

```ts twoslash
import { Guard, type PacketContext } from '@peck/plugins'
// ---cut---
/**
 * Lets staff through
 * @class
 */
export class StaffGuard extends Guard {
  /**
   * Checks the player is staff
   * @param context The packet context
   * @returns The reason, or null
   */
  public check(context: PacketContext): string | null {
    return context.player.moderator ? null : 'not staff'
  }
}

/**
 * Only lets staff through
 * @returns The class decorator
 */
export const Staff =
  () =>
  (target: object, _context: ClassDecoratorContext): void => {
    Guard.attach(target, new StaffGuard())
  }
```

Then put `@Staff()` on a handler.

## Injecting

The emulator's container makes handlers, and they can use `inject` in their fields. This version of the handler from earlier counts every player in the database instead.

```ts twoslash
import { Field, IncomingPacket, OutgoingPacket, Packet } from '@peck/protocol'

@Packet('pon', 'xt')
export class OnlineIncoming extends IncomingPacket {}

@Packet('pon', 'xt')
export class OnlineOutgoing extends OutgoingPacket {
  @Field.int() public readonly count: number = 0
}
// ---cut---
import { inject } from '@needle-di/core'
import { type Database, Player } from '@peck/database'
import {
  DatabaseToken,
  Handler,
  type PacketContext,
  PacketHandler,
} from '@peck/plugins'

/**
 * Replies with the player count
 * @class
 */
@Handler(OnlineIncoming)
export class OnlineHandler extends PacketHandler<OnlineIncoming> {
  /**
   * The database
   */
  private readonly database = inject<Database>(DatabaseToken)

  /**
   * Handles the packet
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: OnlineIncoming,
    context: PacketContext,
  ): Promise<void> {
    const count = await this.database.count(Player, {})

    await context.reply<OnlineOutgoing>(OnlineOutgoing, {
      room: packet.room,
      count,
    })
  }
}
```

Anything Peck binds in its container can be injected the same way, including the repositories from `@peck/database`.

## Middleware

Middleware runs around the handler for every packet that gets past the guards. It gets the context and `next`. If it doesn't call `next()`, the handler doesn't run.

```ts twoslash
import { type Middleware, Plugin } from '@peck/plugins'
// ---cut---
/**
 * Logs how long each packet takes
 */
const timing: Middleware = async (context, next) => {
  const started = performance.now()

  await next()

  context.log.debug(
    { header: context.packet.header, ms: performance.now() - started },
    'packet handled',
  )
}

export default class TimingPlugin extends Plugin {
  public readonly name = 'timing'

  public readonly version = '1.0.0'

  public override readonly middleware = [timing]
}
```

Middleware is added in plugin order. The first plugin's runs outermost.
