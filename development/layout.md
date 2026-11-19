# Project layout

Peck is a Bun workspace. The root `package.json` lists `apps/*`, `packages/*` and `plugins/*` as workspaces.

## Apps

| Folder          | Package          | What it holds                                                       |
| --------------- | ---------------- | ------------------------------------------------------------------- |
| `apps/emulator` | `@peck/emulator` | The game server. Network, sessions, the dispatcher and handlers     |
| `apps/api`      | `@peck/api`      | The Hono API. Each feature is a module in `src/modules`             |
| `apps/console`  | `@peck/console`  | The `peck` command line. Each command is a folder in `src/commands` |
| `apps/website`  | `@peck/website`  | The Nuxt site. It reads the API's types from `@peck/api/rpc`        |

The apps don't export anything for other packages to use, apart from `@peck/api/rpc`.

## Packages

| Package             | What it holds                                                    |
| ------------------- | ---------------------------------------------------------------- |
| `@peck/banner`      | The banner the `dev` and `start` scripts print                   |
| `@peck/cluster`     | Presence, tickets, nodes and events, kept in a `ClusterStore`    |
| `@peck/content`     | Reads the game's content and writes the JSON files the seeds use |
| `@peck/database`    | Entities, repositories, migrations and seeds                     |
| `@peck/game`        | Game rules and state with no I/O                                 |
| `@peck/logger`      | `createLogger`, built on pino                                    |
| `@peck/packets`     | Every incoming and outgoing packet                               |
| `@peck/permissions` | Permissions, roles and the rules that check them                 |
| `@peck/plugins`     | Handlers, guards, middleware, commands and plugins               |
| `@peck/protocol`    | Frames, messages, codecs and the packet framework                |
| `@peck/redis`       | `createRedis`, a wrapper round Bun's `RedisClient`               |
| `@peck/shared`      | Constants, time helpers and types used everywhere                |
| `@peck/ui`          | Vue components and the theme for the website                     |

## Dependencies

Each package lists what it uses in its own `package.json`, as `workspace:*`.

| Package             | Depends on                                        |
| ------------------- | ------------------------------------------------- |
| `@peck/shared`      | nothing                                           |
| `@peck/protocol`    | `shared`                                          |
| `@peck/packets`     | `protocol`, `shared`                              |
| `@peck/game`        | `shared`                                          |
| `@peck/redis`       | `shared`                                          |
| `@peck/cluster`     | `redis`                                           |
| `@peck/database`    | `permissions`, `shared`                           |
| `@peck/plugins`     | `database`, `game`, `logger`, `protocol`, `redis` |
| `@peck/content`     | nothing                                           |
| `@peck/permissions` | nothing                                           |
| `@peck/logger`      | nothing                                           |

| App              | Depends on                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `@peck/emulator` | `cluster`, `database`, `game`, `logger`, `packets`, `permissions`, `plugins`, `protocol`, `redis`, `shared` |
| `@peck/api`      | `cluster`, `database`, `logger`, `permissions`, `redis`, `shared`                                           |
| `@peck/console`  | `cluster`, `content`, `database`, `plugins`, `redis`                                                        |
| `@peck/website`  | `api`, `permissions`, `ui`                                                                                  |

`@peck/game` has no I/O. It never imports the database, Redis or the protocol. The emulator joins them up.

## Modules

Every module is a folder with an `index.ts` in it. Each package's `src/index.ts` re-exports its modules. The packet areas, like `incoming/chat`, have a barrel of their own.

::: code-group

```ts twoslash [packages/cluster/src/index.ts]
export * from '#cluster/choice'
export * from '#cluster/events'
export * from '#cluster/memory'
export * from '#cluster/nodes'
export * from '#cluster/presence'
export * from '#cluster/redis'
export * from '#cluster/store'
export * from '#cluster/tickets'
export * from '#cluster/uploads'
export * from '#cluster/walls'
```

:::

Each package's `exports` points at `src/index.ts`. Other packages import it by name, like `@peck/database`.

## Import aliases

Inside a package, imports use a `#name/*` alias. It's set in the `imports` field of the package's `package.json`.

::: code-group

```jsonc [packages/database/package.json]
"imports": {
  "#database/*": "./src/*/index.ts"
}
```

:::

So `#database/entities/like` is `packages/database/src/entities/like/index.ts`. An alias only works inside its own package.

| Package             | Alias            |
| ------------------- | ---------------- |
| `@peck/emulator`    | `#emulator/*`    |
| `@peck/api`         | `#api/*`         |
| `@peck/console`     | `#console/*`     |
| `@peck/banner`      | `#banner/*`      |
| `@peck/cluster`     | `#cluster/*`     |
| `@peck/content`     | `#content/*`     |
| `@peck/database`    | `#database/*`    |
| `@peck/game`        | `#game/*`        |
| `@peck/packets`     | `#packets/*`     |
| `@peck/permissions` | `#permissions/*` |
| `@peck/plugins`     | `#plugins/*`     |
| `@peck/protocol`    | `#protocol/*`    |
| `@peck/ui`          | `#ui/*`          |

`@peck/logger`, `@peck/redis` and `@peck/shared` have no alias. The barrels in `@peck/game`, `@peck/packets`, `@peck/protocol` and `@peck/shared` use relative paths like `./codec/index.ts`.

## Where things go

| What             | Where                                                          |
| ---------------- | -------------------------------------------------------------- |
| Incoming packets | `packages/packets/src/incoming/<area>/<name>/index.ts`         |
| Outgoing packets | `packages/packets/src/outgoing/<area>/<name>/index.ts`         |
| Packet headers   | `packages/packets/src/incoming/headers` and `outgoing/headers` |
| Handlers         | `apps/emulator/src/handlers/<area>/<name>/index.ts`            |
| The handler list | `apps/emulator/src/handlers/index.ts`                          |
| Entities         | `packages/database/src/entities/<name>/index.ts`               |
| Repositories     | `packages/database/src/repositories/<name>/index.ts`           |
| Migrations       | `packages/database/migrations/<timestamp>_<name>.ts`           |
| Seeds            | `packages/database/src/seeds/<name>/index.ts`                  |
| Console commands | `apps/console/src/commands/<group>/<name>/index.ts`            |
| API modules      | `apps/api/src/modules/<name>`                                  |
| Plugins          | `plugins/<name>`                                               |
| Tests            | `tests/<package>`                                              |

Small areas keep all their packets in the area's `index.ts`. `packages/packets/src/incoming/like/index.ts` has both like packets in it.

A handler folder can also hold a helper that isn't a handler. `apps/emulator/src/handlers/like/targets` is an `@injectable()` class the like handlers share.
