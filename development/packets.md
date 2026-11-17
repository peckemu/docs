# Packets

Packets are split over two packages. `@peck/protocol` reads and writes frames and holds the packet framework. `@peck/packets` holds every packet the emulator knows.

## Frames

The client and server send text frames, each ending in a NUL byte. `FrameDecoder` in `packages/protocol/src/wire/decoder` splits the socket's bytes into frames. `FrameEncoder` in `wire/encoder` adds the NUL to each frame it writes.

A frame bigger than `MAX_FRAME_BYTES` throws a `ProtocolError` with the code `FRAME_TOO_LARGE`. The emulator drops the client.

The Flash policy request `<policy-file-request/>` is answered before any packet code runs. That's `SocketPolicy` in `wire/policy`.

## Formats

The first character of a frame picks its format. `PacketFactory` reads `%` as XT, `<` as XML and `{` as JSON. Anything else throws `UNKNOWN_FORMAT`.

| Format | Message class | Client sends                                                | Server sends                                            |
| ------ | ------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| `xt`   | `XtMessage`   | `%xt%o%au%1%1%5%6%0%0%`                                     | `%xt%au%1%1%1%1%5%6%0%`                                 |
| `xml`  | `XmlMessage`  | `<msg t='sys'><body action='verChk' r='0'>...</body></msg>` | `<msg t="sys"><body action="apiOK" r="0"></body></msg>` |
| `json` | `JsonMessage` | `{"b":{"c":"<header>","r":-1,"p":{}}}`                      | `{"t":"xt","b":{"r":-1,"o":{"_cmd":"login",...}}}`      |

An XT frame from the client is `%xt%<extension>%<header>%<room>%<args>%`. One from the server is `%xt%<header>%<room>%<args>%`. A value with a `%` in it can't be written, and `toString()` throws `XT_VALUE`.

An XML frame's header is the `action` attribute on `<body>` and its room is `r`. The `h` attribute on `<msg>` is kept as the login signature.

Every message has a `format`, a `header` and a `room`. The classes are in `packages/protocol/src/wire`.

## Codecs

Each format has a codec in `packages/protocol/src/codec`. `XtCodec`, `XmlCodec` and `JsonCodec` read a message's fields from a packet's schema and write them back. `Codecs` picks the right one.

Not every field kind works in every format. `@Packet` checks the class when it loads and throws a `TypeError` if a field won't fit.

| Kind      | `xt` | `xml` | `json` |
| --------- | ---- | ----- | ------ |
| `rest`    | yes  | no    | no     |
| `array`   | yes  | no    | yes    |
| `record`  | no   | no    | yes    |
| `message` | no   | yes   | no     |

Every other kind works in all three.

## Fields

Fields are declared with `Field` from `packages/protocol/src/codec/field`. In XT they're read and written in the order the class declares them.

| Definition                          | Value                                         |
| ----------------------------------- | --------------------------------------------- |
| `Field.string()`                    | A string                                      |
| `Field.int()`                       | A decimal integer                             |
| `Field.uint()`                      | A 32 bit unsigned integer                     |
| `Field.number()`                    | Any finite number                             |
| `Field.bool()`                      | A flag, written `1` or `0`                    |
| `Field.enum(values)`                | An integer from the values of an object       |
| `Field.list(item)`                  | A count followed by that many items           |
| `Field.array(item, length)`         | A fixed number of items with no count         |
| `Field.rest(item?)`                 | Every XT argument left                        |
| `Field.split(separator, item?)`     | One value holding several, joined             |
| `Field.object(shape)`               | A nested shape of fields                      |
| `Field.optional(item)`              | A value that may be absent                    |
| `Field.map(item, { read, write? })` | A value turned into something else            |
| `Field.record()`                    | A raw JSON object                             |
| `Field.message(key)`                | `signature` or `signedBody` of an XML message |

Most definitions take `FieldOptions`.

| Option     | What it does                                  |
| ---------- | --------------------------------------------- |
| `path`     | Where the value sits in XML, like `login/@z`  |
| `key`      | The key in JSON                               |
| `cdata`    | Wraps the value in CDATA in XML               |
| `redacted` | Shows `[redacted]` in `toJSON()` and the logs |
| `default`  | The value written when the field is unset     |

A `Field.map` without `write` is read only. Writing it throws.

## Packet classes

A packet is a class that extends `IncomingPacket` or `OutgoingPacket`, with the `@Packet` decorator on it.

```ts
@Packet(header, format, options?)
```

`header` is the packet's header and `format` is `'xt'`, `'xml'` or `'json'`. Outgoing packets can take `{ room }` for the default room and `{ handler }` for the XML envelope's `t` attribute. The default room is `0` for XML and `-1` for the rest. The default handler is `sys`.

The decorator adds the class to `incomingPackets` or `outgoingPackets`. These are `PacketRegistry` instances keyed by format and header. Two packets going the same way with the same format and header throw when the second one loads.

Incoming packets carry the frame's `header` and `room`. Outgoing packets have an optional `room` that overrides the default.

## PacketFactory

`PacketFactory` is in `packages/protocol/src/packet/factory`.

| Method                 | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `parse(frame)`         | Reads a client frame into its incoming packet, or `RawIncoming` |
| `parseAs(type, frame)` | Same, but throws `PACKET_TYPE` if it isn't a `type`             |
| `create(type, fields)` | Builds an outgoing packet. `fields` is typed from the class     |
| `raw(header, room?)`   | Builds a `RawOutgoing` XT packet by hand                        |

A frame with no registered class comes back as `RawIncoming`. It has `string()`, `int()`, `number()`, `boolean()` and `rest()` to read XT arguments one at a time.

`RawOutgoing` has the same methods for writing. Each one returns the packet.

::: code-group

```ts twoslash [tests/protocol/PacketFactory.test.ts]
import { expect } from 'bun:test'
import { PacketFactory } from '@peck/protocol'
// ---cut---
expect(
  PacketFactory.raw('zz').string('hello').int(5).boolean(true).toString(),
).toBe('%xt%zz%-1%hello%5%1%')
```

:::

`create` needs every field whose type doesn't allow `undefined`. `room` is always optional.

::: code-group

```ts twoslash [tests/protocol/PacketFactory.test.ts]
import { expect } from 'bun:test'
import { MovementOutgoing } from '@peck/packets'
import { PacketFactory } from '@peck/protocol'
// ---cut---
const packet = PacketFactory.create<MovementOutgoing>(MovementOutgoing, {
  avatars: [
    { userId: 10, path: [{ x: 7, y: 8 }], teleport: true },
    { userId: 11, path: [], teleport: false },
  ],
  room: 5,
})
expect(packet.toString()).toBe('%xt%au%5%2%10%1%7%8%1%11%0%0%')
```

:::

## The packets package

`packages/packets/src` has two folders, `incoming` and `outgoing`. Each has a folder per area, like `chat`, `room` or `trade`, and a folder per packet inside that.

Headers are constants. Incoming ones are in `Incoming` in `incoming/headers`. Outgoing ones are in `Outgoing` in `outgoing/headers`.

::: code-group

```ts twoslash [packages/packets/src/incoming/headers/index.ts]
/**
 * The incoming headers
 */
export const Incoming = {
  /**
   * The client's SmartFox version
   */
  VersionCheck: 'verChk',

  /**
   * Asks for the login key
   */
  RandomKey: 'rndK',
}
```

:::

The real file has a lot more.

Incoming class names end in `Incoming` and outgoing ones in `Outgoing`. `packages/packets/src/index.ts` exports both folders.

## An incoming packet

::: code-group

```ts twoslash [packages/packets/src/incoming/room/join/index.ts]
import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Joins a room
 * @class
 */
@Packet(Incoming.RoomJoin, 'xt')
export class RoomJoinIncoming extends IncomingPacket {
  /**
   * The full room name
   */
  @Field.string() public readonly target: string = ''

  /**
   * Whether a foreign room was allowed
   */
  @Field.int() public readonly confirmLanguageChange: number = 0

  /**
   * Whether to join unseen
   */
  @Field.int() public readonly invisible: number = 0

  /**
   * How the instance is picked
   */
  @Field.int() public readonly joinType: number = 0
}
```

:::

XML packets point at the value with `path`. An `@` reads an attribute.

::: code-group

```ts twoslash [packages/packets/src/incoming/session/version/index.ts]
import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Checks the client version
 * @class
 */
@Packet(Incoming.VersionCheck, 'xml')
export class VersionCheckIncoming extends IncomingPacket {
  /**
   * The plain version
   */
  @Field.string({ path: 'ver/@v' }) public readonly version: string = ''
}
```

:::

## An outgoing packet

Outgoing packets often have static builders for the ways they get sent. `ItemBuyHandler` sends `ItemBuyOutgoing.bought(...)` and `ItemBuyOutgoing.refused(...)`.

::: code-group

```ts twoslash [packages/packets/src/outgoing/item/buy/index.ts]
import { BuyStatus } from '@peck/packets'
import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'
// ---cut---
@Packet(Outgoing.ItemBuy, 'xt')
export class ItemBuyOutgoing extends OutgoingPacket {
  @Field.int() public readonly status: number = 0
  @Field.int() public readonly shopId: number = 0
  @Field.string() public readonly balance: string = ''
  @Field.int() public readonly currencyType: number = 0

  public static bought(
    room: number,
    shopId: number,
    balance: string,
    currencyType: number,
  ): ItemBuyOutgoing {
    return ItemBuyOutgoing.build(
      room,
      BuyStatus.Bought,
      shopId,
      balance,
      currencyType,
    )
  }

  public static refused(
    room: number,
    shopId: number,
    status: BuyStatus = BuyStatus.Refused,
  ): ItemBuyOutgoing {
    return ItemBuyOutgoing.build(room, status, shopId, '', 0)
  }

  private static build(
    room: number,
    status: number,
    shopId: number,
    balance: string,
    currencyType: number,
  ): ItemBuyOutgoing {
    return PacketFactory.create<ItemBuyOutgoing>(ItemBuyOutgoing, {
      room,
      status,
      shopId,
      balance,
      currencyType,
    })
  }
}
```

:::

The doc comments are left out here to save space. The real file has one on every field and method.

## Adding a packet

1. Add the header to `Incoming` or `Outgoing` in the `headers` folder.
2. Make a folder for it, like `packages/packets/src/incoming/<area>/<name>/index.ts`.
3. Write the class with `@Packet` and its fields.
4. Export it from the area's `index.ts`. Add the area to `incoming/index.ts` or `outgoing/index.ts` if it's new.

`tests/packets/packets.test.ts` imports every `{incoming,outgoing}/*/*/index.ts` and checks each class is exported from `@peck/packets` with a header. A packet that isn't exported is never registered, and `parse` returns `RawIncoming` for it.

An incoming packet does nothing until a handler takes it. See [Handlers](./handlers).
