# Database

A plugin keeps its data in its own tables. It makes them with migrations, the same way Peck does. See [Database](/development/database) for how Peck's own tables are set up.

## Migrations

Point `migrations` at the plugin's migrations folder.

```ts twoslash
import { join } from 'node:path'

import { Plugin } from '@peck/plugins'
// ---cut---
export default class VisitsPlugin extends Plugin {
  public readonly name = 'visits'

  public readonly version = '1.0.0'

  public override readonly migrations = join(import.meta.dir, '../migrations')
}
```

Each file is named `<date and time>_<name>.ts` and exports a migration with `up` and `down`. [Your first plugin](./first-plugin#_2-the-table) has an example.

```sh
bun peck database:migrate
```

This runs Peck's migrations first, then each plugin's in plugin order. Every plugin keeps track of its own in a table called `uql_migrations_<name>`, with anything that isn't a letter, number or underscore turned into `_`. So `visits` gets `uql_migrations_visits`.

To roll back, name the plugin.

```sh
bun peck database:rollback --plugin visits --step 1
```

Without `--plugin` it rolls back Peck's own migrations instead.

Use table names that won't clash with Peck's. Starting them with the plugin's name works.

## Entities

An entity describes a table's rows. You can then query it without writing SQL. Peck uses [uql](https://uql-orm.dev), where entities are classes with decorators.

```ts twoslash
import { Entity, Field, Id, type idKey } from 'uql-orm'
// ---cut---
@Entity<Visit>({ name: 'visits' })
export class Visit {
  declare public [idKey]?: 'room'

  @Id({ type: 'text' })
  public room!: string

  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}
```

`context.database` in `setup`, and `DatabaseToken` in a handler, give you the same database Peck uses.

```ts twoslash
import { Entity, Field, Id, type idKey } from 'uql-orm'
import { type Database } from '@peck/database'

@Entity<Visit>({ name: 'visits' })
class Visit {
  declare public [idKey]?: 'room'
  @Id({ type: 'text' })
  public room!: string
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}

declare const database: Database
// ---cut---
const visit = await database.findOneById(Visit, 'jamaa_township.room_main')

const busiest = await database.findMany(Visit, {
  $sort: { count: 'desc' },
  $limit: 10,
})

await database.updateOneById(Visit, 'jamaa_township.room_main', {
  count: { $inc: 1 },
})
```

To change more than one row at once, use a transaction. Either all the changes go through or none do.

```ts twoslash
import { Entity, Field, Id, type idKey } from 'uql-orm'
import { type Database } from '@peck/database'

@Entity<Visit>({ name: 'visits' })
class Visit {
  declare public [idKey]?: 'room'
  @Id({ type: 'text' })
  public room!: string
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}

declare const database: Database
// ---cut---
await database.transaction(async (querier) => {
  await querier.deleteMany(Visit, { $where: { count: 0 } })
  await querier.insertOne(Visit, { room: 'jamaa_township.room_main', count: 1 })
})
```

## Seeds

A seed puts rows in when you run `bun peck database:seed`. Peck's seeds run first, then every plugin's.

```ts twoslash
import { Entity, Field, Id, type idKey } from 'uql-orm'

@Entity<Visit>({ name: 'visits' })
class Visit {
  declare public [idKey]?: 'room'
  @Id({ type: 'text' })
  public room!: string
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}
// ---cut---
import { Seed } from '@peck/database'
import { type SqlQuerier } from 'uql-orm'

/**
 * Starts the counts at zero
 * @class
 */
export class VisitsSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'visits'

  /**
   * Writes the rows
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    await querier.upsertOne(
      Visit,
      { room: true },
      { room: 'jamaa_township.room_main', count: 0 },
    )
  }
}
```

Add it with `public override readonly seeds = [new VisitsSeed()]`.

Seeds can run more than once. Use `upsertOne`, because `insertOne` fails the second time.
