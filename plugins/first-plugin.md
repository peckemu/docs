# Your first plugin

This builds a plugin called `visits`. It counts how many times each room is joined, keeps the counts in its own table, and adds a console command that prints the busiest rooms.

You'll end up with this:

```
plugins/visits/
├─ package.json
├─ migrations/
│  └─ 20261118120000_visits.ts
└─ src/
   ├─ index.ts
   ├─ visit/
   │  └─ index.ts
   └─ top/
      └─ index.ts
```

## 1. The package

Make the folder and its `package.json`.

::: code-group

```json [plugins/visits/package.json]
{
  "name": "@peck/plugin-visits",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "imports": {
    "#visits/*": "./src/*/index.ts"
  },
  "dependencies": {
    "@peck/database": "workspace:*",
    "@peck/plugins": "workspace:*",
    "uql-orm": "0.104.1"
  }
}
```

:::

With no `main`, Peck loads `src/index.ts`. Run `bun install` once so the workspace picks it up.

## 2. The table

The migration makes the table. Start the file name with the date and time. That's how migrations are kept in order.

::: code-group

```ts twoslash [plugins/visits/migrations/20261118120000_visits.ts]
import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Creates the visits table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('visits', (table) => {
      table.text('room').primaryKey()
      table.integer('count').notNullable()
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('visits')
  },
})
```

:::

The entity tells the database what a row looks like. Fields are camel case and columns are snake case. Peck converts between the two.

::: code-group

```ts twoslash [plugins/visits/src/visit/index.ts]
import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A room's visits
 * @class
 */
@Entity<Visit>({ name: 'visits' })
export class Visit {
  /**
   * The field it is keyed by
   */
  declare public [idKey]?: 'room'

  /**
   * The room name
   */
  @Id({ type: 'text' })
  public room!: string

  /**
   * How many times it was joined
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}
```

:::

## 3. The plugin

The default export is the plugin. `setup` runs once when the emulator starts. That's where you listen for events.

::: code-group

```ts twoslash [plugins/visits/src/index.ts]
// @filename: src/visit/index.ts
import { Entity, Field, Id, type idKey } from 'uql-orm'

@Entity<Visit>({ name: 'visits' })
export class Visit {
  declare public [idKey]?: 'room'

  @Id({ type: 'text' })
  public room!: string

  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}

// @filename: src/index.ts
// ---cut---
import { join } from 'node:path'

import { Plugin, type PluginContext } from '@peck/plugins'

import { Visit } from '#visits/visit'

/**
 * Counts room visits
 * @class
 */
export default class VisitsPlugin extends Plugin {
  /**
   * The plugin name
   */
  public readonly name = 'visits'

  /**
   * The plugin version
   */
  public readonly version = '1.0.0'

  /**
   * The migrations folder
   */
  public override readonly migrations = join(import.meta.dir, '../migrations')

  /**
   * Counts each room joined
   * @param context The plugin context
   */
  public override setup(context: PluginContext): void {
    context.events.on('join', async (session) => {
      const room = session.player?.room?.template.name
      if (!room) return

      await context.database.upsertOne(
        Visit,
        { room: true },
        { room, count: 1 },
        { count: { $inc: 1 } },
      )
    })
  }
}
```

:::

`upsertOne` adds the row the first time a room is joined and adds one to `count` after that. `session.player` is the player who joined, and `room.template.name` is the room's name without the instance number on the end. Every copy of Jamaa Township counts as one room.

Hover over anything in the code above to see its type.

## 4. Try it

```sh
bun peck plugins:list
bun peck database:migrate
bun run dev
```

`plugins:list` should show `visits`. `database:migrate` runs Peck's migrations and then the plugin's. Log in, walk about a bit, and the `visits` table fills up.

## 5. A command

A command runs in the console rather than the emulator. It has to open its own database connection.

::: code-group

```ts twoslash [plugins/visits/src/top/index.ts]
// @filename: src/visit/index.ts
import { Entity, Field, Id, type idKey } from 'uql-orm'

@Entity<Visit>({ name: 'visits' })
export class Visit {
  declare public [idKey]?: 'room'

  @Id({ type: 'text' })
  public room!: string

  @Field({ type: Number, columnType: 'integer', nullable: false })
  public count!: number
}

// @filename: src/top/index.ts
// ---cut---
import { createDatabase } from '@peck/database'
import { Command, type Options } from '@peck/plugins'

import { Visit } from '#visits/visit'

/**
 * Prints the busiest rooms
 * @class
 */
export class TopCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'visits:top'

  /**
   * The command description
   */
  public readonly description = 'Prints the busiest rooms'

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    limit: { description: 'How many rooms', fallback: '10' },
  }

  /**
   * Prints the rooms
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const database = createDatabase(String(options['database']))

    try {
      const visits = await database.findMany(Visit, {
        $sort: { count: 'desc' },
        $limit: Number(options['limit']),
      })

      for (const visit of visits) console.log(`${visit.room}  ${visit.count}`)
    } finally {
      await database.end()
    }
  }
}
```

:::

Then add it to the plugin.

```ts
import { TopCommand } from '#visits/top'
```

```ts
/**
 * The commands
 */
public override readonly commands = [new TopCommand()]
```

```sh
bun peck visits:top --limit 5
```

`--limit` is optional because it has a `fallback`. `database` comes from `DATABASE_URL` in `.env.local`, and if that's missing too the console asks for it.

## Where to go from here

- [Events](./events) lists every event and what a session can do.
- [Packets and handlers](./handlers) covers handling packets, replacing Peck's handlers and writing middleware.
- [Database](./database) covers migrations, seeds and rolling back.
- [Commands](./commands) covers command options.
