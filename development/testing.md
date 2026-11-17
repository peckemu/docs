# Testing

Tests use `bun:test` and live in `tests` at the root of the repo.

Git ignores everything in `tests` apart from `tests/tests.txt`. They stay on your machine and aren't pushed.

## Running them

```sh
bun test tests
```

To run one folder or file, pass its path.

```sh
bun test tests/plugins
bun test tests/database/migrations.test.ts
```

The tests don't need PostgreSQL or Redis running. The database is PGlite in memory and the cluster uses `MemoryStore`.

## Layout

There's a folder for each package or app the tests cover.

| Folder              | What it tests                                        |
| ------------------- | ---------------------------------------------------- |
| `tests/api`         | API routes, through `app.request`                    |
| `tests/cluster`     | Presence, tickets and the other cluster stores       |
| `tests/console`     | Console commands                                     |
| `tests/content`     | The content reader                                   |
| `tests/database`    | Migrations, the schema and repositories              |
| `tests/emulator`    | Handlers, the dispatcher and the server              |
| `tests/game`        | Game rules                                           |
| `tests/packets`     | That every packet is exported with a header          |
| `tests/permissions` | Permission rules                                     |
| `tests/plugins`     | The plugin loader, host, events and a fixture plugin |
| `tests/protocol`    | Frames, codecs and `PacketFactory`                   |

`tests/tsconfig.json` makes the folder its own TypeScript project, and `bun run typecheck` checks the tests too. Apps don't export their internals. Tests import them by relative path, like `../../apps/emulator/src/dispatch/dispatcher/index.ts`.

## The database

`tests/database/postgres.ts` has the helpers.

| Helper                                | What it does                                             |
| ------------------------------------- | -------------------------------------------------------- |
| `postgres()`                          | Opens an empty `PgliteQuerierPool` with Peck's naming    |
| `migrator(pool, options?)`            | A UQL `Migrator` for Peck's migrations                   |
| `useDatabase()`                       | One migrated database for a `describe` block             |
| `addAccount(pool, username)`          | Adds an account and returns its id                       |
| `addPlayer(pool, username)`           | Adds a player on its own account and returns its game id |
| `addSession(pool, accountId, lasts?)` | Signs an account in and returns the token                |

`useDatabase()` runs the migrations before the tests, deletes every account after each test, and closes the pool at the end. Rows that cascade from an account, like its players and sessions, go with it.

::: code-group

```ts [tests/database/postgres.ts]
export const postgres = (): PgliteQuerierPool =>
  new PgliteQuerierPool(undefined, undefined, { namingStrategy: NAMING })
```

:::

`PgliteQuerierPool` comes from `uql-orm/pglite`. Code that wants a `Database` gets the pool cast with `database.pool as unknown as Database`.

## Emulator tests

Emulator tests build the real container with `createContainer` and fill in what the test doesn't use.

::: code-group

```ts [tests/emulator/dispatcher.test.ts]
const container = createContainer({
  config: {} as Config,
  database: {} as Database,
  redis: {} as RedisClient,
  logger: quiet,
  handlers: registry,
})
```

:::

| Option     | What tests pass                                             |
| ---------- | ----------------------------------------------------------- |
| `config`   | `{} as Config`, or the few settings the test needs          |
| `database` | `{} as Database`, or the PGlite pool from `useDatabase()`   |
| `redis`    | `{} as RedisClient`                                         |
| `logger`   | `createLogger({ logLevel: 'silent', logPretty: false })`    |
| `store`    | `new MemoryStore()` from `@peck/cluster`, for cluster state |
| `handlers` | A `HandlerRegistry`, to test some handlers on their own     |
| `plugins`  | A `PluginHost`, to test a plugin                            |

Without `store`, the container makes a `RedisStore` from the Redis client. Most emulator tests pass a `MemoryStore`.

A session needs a transport. Tests use one that keeps what it's sent.

::: code-group

```ts [tests/emulator/dispatcher.test.ts]
const transport = (): Transport & { sent: string[] } => {
  const sent: string[] = []
  return {
    sent,
    remoteAddress: '127.0.0.1',
    closed: false,
    send: (frame: string) => {
      sent.push(frame)
      return Promise.resolve()
    },
    close: () => Promise.resolve(),
  }
}
```

:::

`SessionManager.open(transport)` makes the session. Setting `session.player` logs it in.

::: code-group

```ts [tests/emulator/dispatcher.test.ts]
const session = sessions.open(wire)
const player = new Player(session.id, {
  username: name,
  accountType: AccountType.Member,
})
rooms.join(player, 'jamaa')
session.player = player
```

:::

Then the test sends raw frames through the dispatcher and checks the result and what each session was sent.

::: code-group

```ts [tests/emulator/dispatcher.test.ts]
const move = '%xt%o%au%1%1%5%6%0%0%'

it('runs the handler and sends to the rest of the room', async () => {
  const { dispatcher, join } = setup()
  const walker = join('a')
  const other = join('b')
  expect(await dispatcher.dispatch(walker.session, move)).toBe('handled')
  expect(other.sent).toEqual(['%xt%au%1%1%1%1%5%6%0%'])
  expect(walker.sent).toEqual([])
})
```

:::

Catalogues start empty. Tests register what they need, like `rooms.register({ name: 'jamaa' })` or `denItems.register(...)`.

## Plugin tests

`tests/plugins/plugins.test.ts` loads the `greet` plugin from `tests/plugins/fixtures/greet`. It runs the plugin's migrations and seeds on PGlite, builds the container with `plugins: host`, and dispatches the plugin's packet.

::: code-group

```ts [tests/plugins/plugins.test.ts]
expect(
  await container
    .get<Dispatcher>(Dispatcher)
    .dispatch(session, '%xt%o%grt%-1%'),
).toBe('handled')
expect(sent).toEqual(['%xt%grt%-1%Hello%'])
```

:::

## Checks

| Command                | What it runs                   |
| ---------------------- | ------------------------------ |
| `bun run typecheck`    | `bun --bun tsc -b`             |
| `bun run lint`         | `bun --bun eslint .`           |
| `bun run lint:fix`     | `bun --bun eslint . --fix`     |
| `bun run format`       | `bun --bun prettier --write .` |
| `bun run format:check` | `bun --bun prettier --check .` |

`tsc -b` builds every project in the root `tsconfig.json`, including `tests`. ESLint uses the strict type checked rules from `typescript-eslint` and skips `apps/website` and `packages/ui`.

## CI

`.github/workflows/check.yml` runs on every push to `main` and every pull request. It checks types, lint and formatting. It skips the tests since they aren't in the repo, so run them yourself before you push.
