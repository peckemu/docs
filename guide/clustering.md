# Clustering

Several emulators can share one database and one Redis. Each one is a node. The API picks a node for every player, and players can move between nodes from the server selector.

## Running a node

Every node uses the same `DATABASE_URL` and `REDIS_URL`. These are set for each node.

| Variable        | Default           | What it does                         |
| --------------- | ----------------- | ------------------------------------ |
| `NODE_ID`       |                   | Fixed node id, or empty to pick one  |
| `NODE_NAME`     | `Server <id>`     | Name shown in the server list        |
| `PUBLIC_HOST`   | `127.0.0.1`       | Host the client connects to          |
| `PUBLIC_PORT`   | same as `PORT`    | Port the client connects to          |
| `NODE_CAPACITY` | `MAX_CONNECTIONS` | Players the API will send to it      |
| `PECK_VERSION`  | `dev`             | Build name kept in the node's record |

The node joins the cluster after its port is open and leaves it when it stops.

## Node ids

Ids go from 1 to 64. The code is in `packages/cluster/src/nodes/index.ts`.

| `NODE_ID` | What happens                                                                                |
| --------- | ------------------------------------------------------------------------------------------- |
| Set       | The node claims that id. It stops with `Node <id> is already running` if a live node has it |
| Empty     | The node takes the lowest free id. It stops with `No free node id` if all 64 are taken      |

A claim lasts 30 seconds and each heartbeat renews it. If a heartbeat finds the id held by another process, the node logs `node id was taken by another node`.

## Heartbeat

Every 10 seconds the node writes its record and its occupied rooms to Redis. Both expire after 30 seconds. A node that crashes drops off the list within half a minute, and one that stops cleanly removes them straight away.

| Key                    | What it holds                       |
| ---------------------- | ----------------------------------- |
| `peck:nodes`           | The ids of the live nodes           |
| `peck:node:<id>`       | Name, host, port, capacity, players |
| `peck:node-owner:<id>` | Which process holds the id          |
| `peck:node-rooms:<id>` | The node's occupied rooms           |
| `peck:node-drain:<id>` | Set while the node is draining      |

## Picking a node

`POST /play` and `GET /flashvars` on the API both call `chooseNode`.

::: code-group

```ts twoslash [packages/cluster/src/choice/index.ts]
import { type NodeInfo } from '#cluster/nodes'

/**
 * How full a node gets before the next one is used
 */
export const PACK_RATIO = 0.85

/**
 * Picks a node for a new player
 * @param nodes The live nodes
 * @returns The node, or null
 */
export const chooseNode = (nodes: readonly NodeInfo[]): NodeInfo | null => {
  const open = nodes
    .filter((node) => !node.draining && node.players < node.capacity)
    .sort((a, b) => a.id - b.id)

  const fill = (node: NodeInfo): number => node.players / node.capacity

  const roomy = open.find((node) => fill(node) < PACK_RATIO)
  if (roomy) return roomy

  return [...open].sort((a, b) => fill(a) - fill(b))[0] ?? null
}
```

:::

It skips draining and full nodes. It fills the lowest id first until it's 85% full, then moves on. When every node is past 85% it picks the emptiest. With no node open the API answers `503` with `No server is open`.

## Login tickets

`POST /play` gives the player a ticket for the node it picked. The ticket lasts 5 minutes and is kept in Redis under a SHA-256 of the token.

The emulator redeems the ticket with its own node id. Redeeming uses the ticket up, even when the node id doesn't match. A ticket for another node fails with `Ticket has expired`.

## Shards

Room instances are numbered, and the number is the shard. The name has it after a `#`, like `jamaa_township.room_main#1`.

Each node owns 1010 shards. `SHARDS_PER_NODE` and the helpers are in `packages/game/src/shards/index.ts`.

| Node | Shards       |
| ---- | ------------ |
| 1    | 1 to 1010    |
| 2    | 1011 to 2020 |
| 3    | 2021 to 3030 |

A node opens new instances from its first shard upwards. Dens, party rooms and single rooms aren't part of any shard.

## Server selector

The shard list handler is in `apps/emulator/src/handlers/room/shards/index.ts`. It sends the node the player is on first, then every other node they can move to, each with its host and its shards.

| Bars   | When                                            |
| ------ | ----------------------------------------------- |
| 0      | Nobody on the shard                             |
| 1 to 3 | How full the shard's start room is              |
| 4      | The start room is full, or the node is draining |

Every node always lists its first shard, even when it's empty. Each shard also shows how many of the player's buddies are on it. Invisible buddies aren't counted.

## Moving between nodes

The room join handler in `apps/emulator/src/handlers/room/join/index.ts` checks the shard in the room name. If the shard belongs to another node it:

1. Looks the node up. It has to be live and reachable, and it can't be draining.
2. Moves the player's ticket to that node.
3. Refuses the join with `RoomJoinError.OtherNode` and the node's host.

The client then connects to that host and logs in again with the same ticket. If the node can't be used, the player joins on the node they're on.

A node counts as reachable when this check passes.

::: code-group

```ts [apps/emulator/src/cluster/node/index.ts]
return node.id !== this.lease?.id && node.host !== host && node.port === port
```

:::

Every node needs the same `PUBLIC_PORT` and its own `PUBLIC_HOST`. The client is only sent the host and keeps using the port it already has. Nodes that share a host, or use another port, don't show in the selector. The API can still send new players to them.

## Presence

Every logged in player has a presence key, `presence:<gameId>`, with their node, room and whether they're invisible. It's written at login and on each room join, refreshed every 20 seconds, and removed at logout. It expires after 60 seconds, which clears it up if a node crashes.

Buddy lists, buddy counts in the selector and finding a buddy all read presence.

## Cluster events

Nodes talk over the Redis channel `peck:events`. Every node gets every event and acts on the players it has.

| Event                 | Sent by                  | What it does                            |
| --------------------- | ------------------------ | --------------------------------------- |
| `buddy-request`       | Emulator                 | Shows a buddy request                   |
| `buddy-added`         | Emulator                 | Adds a buddy                            |
| `buddy-declined`      | Emulator                 | Tells the asker no                      |
| `buddy-removed`       | Emulator                 | Removes a buddy                         |
| `buddy-status`        | Emulator                 | A buddy came online or went offline     |
| `block`               | Emulator                 | A player blocked or unblocked someone   |
| `player-renamed`      | `bun peck player:rename` | Renames a buddy and logs the player out |
| `masterpiece-decided` | API                      | Tells the painter it was reviewed       |
| `jamagram-sent`       | Emulator, API            | A Jam-a-Gram arrived                    |
| `jamagram-gift`       | Emulator                 | A gift came back                        |
| `player-banned`       | Emulator                 | Tells the player and closes them        |
| `player-muted`        | Emulator, API            | Mutes the player                        |
| `player-unmuted`      | Emulator, API            | Lifts the mute                          |
| `player-kicked`       | Emulator                 | Closes the player                       |

## Draining

A draining node keeps the players it has. It takes nobody new.

```sh
curl -X PUT http://127.0.0.1:3000/servers/2/drain \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"draining":true}'
```

The route needs `server.manage`. Send `{"draining":false}` to open it again. Both are written to the audit log as `server.drained` and `server.reopened`.

| While draining       |                                          |
| -------------------- | ---------------------------------------- |
| `chooseNode`         | Skips it                                 |
| Moving between nodes | Refused, the player stays where they are |
| Server selector      | Its shards show 4 bars                   |
| `GET /servers`       | Its status is `draining`                 |

The drain flag has no lifetime. It stays until it's turned off, even across restarts.

## Server routes

| Route                    | Auth            | What it does                                 |
| ------------------------ | --------------- | -------------------------------------------- |
| `GET /servers`           | None            | Lists the live nodes and their status        |
| `GET /servers/:id/rooms` | None            | Lists a node's occupied rooms, fullest first |
| `PUT /servers/:id/drain` | `server.manage` | Drains a node or opens it again              |

A node's status is `open`, `full` or `draining`.
