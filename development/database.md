# Database

Everything Peck keeps in PostgreSQL goes through `@peck/database`. It uses the UQL ORM, from the `uql-orm` package.

## The pool

`createDatabase(url, max = 10)` in `packages/database/src/pool` opens a pool. The `Database` type is UQL's `BunSqlQuerierPool`.

Tables and columns are snake case. `NAMING` is a `SnakeCaseNamingStrategy`. The field `likerGameId` becomes the column `liker_game_id`.

`Querier` is the type of the querier a transaction gets.

## Entities

Each entity is a class in `packages/database/src/entities/<name>/index.ts`. It uses UQL's decorators, `@Entity`, `@Id`, `@Field` and the relation ones like `@ManyToOne`.

::: code-group

```ts twoslash [packages/database/src/entities/like/index.ts]
import { LIKE_TYPES, type LikeType } from '#database/entities/like'
// ---cut---
import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  sql,
} from 'uql-orm'

import { Player } from '#database/entities/player'

@Entity<Like>({
  name: 'likes',
  checks: [
    {
      name: 'likes_resource_id_check',
      where: (like) => sql`length(${like.resourceId}) <= 100`,
    },
  ],
})
export class Like {
  declare public [idKey]?: 'resourceType' | 'resourceId' | 'likerGameId'

  declare public [filledKey]?: 'at'

  @Id({ type: 'text', enum: LIKE_TYPES })
  public resourceType!: LikeType

  @Id({ type: 'text' })
  public resourceId!: string

  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public likerGameId!: number

  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public at!: Date

  @ManyToOne({ entity: () => Player, references: (like) => like.likerGameId })
  public liker?: Player
}
```

:::

`[idKey]` names the key fields. `[filledKey]` names the ones the database fills in.

Every entity goes in `ENTITIES` in `packages/database/src/entities/index.ts`. The schema test and `uql.config.ts` both read it.

## Repositories

A repository is a class in `packages/database/src/repositories/<name>/index.ts`. Its constructor takes the `Database`.

::: code-group

```ts twoslash [packages/database/src/repositories/likes/index.ts]
import { Like, type LikeType } from '#database/entities/like'
import { type Database } from '#database/pool'

export class LikeRepository {
  private readonly database: Database

  public constructor(database: Database) {
    this.database = database
  }

  public async like(
    type: LikeType,
    id: string,
    gameId: number,
  ): Promise<boolean> {
    const liked = await this.database.exists(Like, {
      $where: { resourceType: type, resourceId: id, likerGameId: gameId },
    })
    if (liked) return false

    await this.database.insertOne(Like, {
      resourceType: type,
      resourceId: id,
      likerGameId: gameId,
    })

    return true
  }
}
```

:::

Export it from `repositories/index.ts`. The emulator binds each repository in `createContainer`. A new one needs a line there before handlers can inject it.

::: code-group

```ts [apps/emulator/src/container/index.ts]
{
  provide: LikeRepository,
  useFactory: () => new LikeRepository(inject<Database>(DatabaseToken)),
},
```

:::

Work that has to happen all at once uses `this.database.transaction(async (querier) => { ... })`.

## Migrations

Migrations are in `packages/database/migrations`. Each file is named `<YYYYMMDDHHMMSS>_<name>.ts`, like `20261107220400_likes.ts`. The timestamp keeps them in order.

A migration's default export is `defineBuilderMigration` from `uql-orm/migrate`, with an `up` and a `down`. Column names are written in snake case.

::: code-group

```ts twoslash [packages/database/migrations/20261107220400_likes.ts]
import { currentTimestamp } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

export default defineBuilderMigration({
  async up(schema) {
    await schema.createTable('likes', (table) => {
      table
        .text('resource_type')
        .notNullable()
        .enum(['masterpiece', 'jammerwall'])
      table.text('resource_id').notNullable()
      table
        .integer('liker_game_id')
        .notNullable()
        .references('players', 'game_id')
        .onDelete('CASCADE')
      table.timestamptz('at').notNullable().defaultValue(currentTimestamp)
      table.primaryKey(['resource_type', 'resource_id', 'liker_game_id'])
      table.index(['liker_game_id'], 'likes__liker_game_id_idx')
    })

    await addChecks(schema, 'likes', {
      _uql_likes__likes_resource_id_check_fbfa50:
        'length("resource_id") <= 100',
    })
  },

  async down(schema) {
    await schema.dropTable('likes')
  },
})
```

:::

`addChecks` from `#database/checks` adds `CHECK` constraints with raw SQL, one for each name it's given.

The path to the folder is exported as `MIGRATIONS` from `packages/database/src/paths`.

## Running migrations

| Command                                      | What it does                               |
| -------------------------------------------- | ------------------------------------------ |
| `bun peck database:migrate`                  | Runs Peck's migrations, then each plugin's |
| `bun peck database:rollback`                 | Reverts the last of Peck's migrations      |
| `bun peck database:rollback --step 3`        | Reverts the last three                     |
| `bun peck database:rollback --plugin visits` | Reverts a plugin's last migration          |

`bun run db:migrate` and `bun run db:rollback` in the root call the same commands. Both take `--database`, which falls back to `DATABASE_URL`.

The commands are in `apps/console/src/commands/database`. They build a UQL `Migrator` for each set in `apps/console/src/migrations`. Peck's set is called `peck`. Each plugin's set keeps its own `uql_migrations_<name>` table.

## Seeds

A seed extends `Seed` from `packages/database/src/seeder`.

| Member         | What it is                                        |
| -------------- | ------------------------------------------------- |
| `name`         | The seed's name                                   |
| `production`   | Whether it runs in production. `false` by default |
| `run(querier)` | Writes the seed's rows                            |

Peck's seeds are in `packages/database/src/seeds/<name>/index.ts`. They run in the order of `SEEDS` in `seeds/index.ts`.

`Seeder` runs each seed in its own transaction. With `NODE_ENV=production` it only runs seeds with `production` set to `true`.

```sh
bun peck database:seed
bun peck database:seed --only rooms,items
```

`database:seed` runs `SEEDS` and then every plugin's seeds. `--only` takes seed names, and an unknown name stops it before anything runs. `bun run db:seed` in the root calls the same command.

Most seeds read the JSON files `content:import` writes. See [Content](../guide/content).

## The schema test

`tests/database/migrations.test.ts` checks the migrations and the entities agree.

::: code-group

```ts [tests/database/migrations.test.ts]
it('matches the entities', async () => {
  const plan = await migrator(database.pool, { entities: ENTITIES }).planSync({
    safe: false,
    drop: true,
  })
  expect(plan).toEqual([])
})
```

:::

The test runs every migration on an empty database, then asks UQL what it would change to match `ENTITIES`. The plan has to be empty. Anything in one and not the other fails it.

The same file also runs every migration up and back down again.

## Package scripts

`packages/database/package.json` has scripts for the `uql-migrate` CLI. They read `packages/database/uql.config.ts`, which uses `DATABASE_URL`, `ENTITIES` and `./migrations`.

| Script     | Runs                            |
| ---------- | ------------------------------- |
| `sync`     | `uql-migrate sync`              |
| `generate` | `uql-migrate generate:entities` |
| `up`       | `uql-migrate up`                |
| `down`     | `uql-migrate down`              |
| `status`   | `uql-migrate status`            |
| `seed`     | `seed.ts`, Peck's seeds only    |

Run them with `bun --cwd=packages/database run <script>`. Most of the time use the console commands instead, as they include plugins.
