# Console

The console is in `apps/console`. Run it from the project root.

```sh
bun peck <command> [options]
```

It loads `.env` and `.env.local` first. `bun peck help` lists every command, and `--help` after a command lists its options.

## Options

Options are written `--name value`. A flag takes no value. An unknown option stops the command.

When an option isn't given, the console tries its env variable, then its default. If there's still no value and the option isn't optional, it asks for one in the terminal. Without a terminal the command fails with `Missing` and the option's description.

In the tables below, "Asks" means the console asks for it when nothing else gives a value.

## `content:import`

Imports the game's content for the seeds.

| Option        | Env                     | Default                     | Flag |
| ------------- | ----------------------- | --------------------------- | ---- |
| `--flashvars` | `CONTENT_FLASHVARS_URL` | Asks                        |      |
| `--content`   | `CONTENT_URL`           | Asks                        |      |
| `--key`       | `CONTENT_HASH_PREFIX`   | Asks                        |      |
| `--out`       |                         | `packages/database/content` |      |
| `--save`      |                         |                             | Yes  |

`--save` writes the three values to `.env.local`. It prints the deploy it imported and the rows in each file.

```sh
bun peck content:import --save
```

## `catalogue:import`

Imports minigames and shop lists.

| Option   | Env | Default                     | Flag |
| -------- | --- | --------------------------- | ---- |
| `--from` |     | Asks                        |      |
| `--out`  |     | `packages/database/content` |      |

`--from` is a packet log, or the URL of a Phantom database. A URL starting `postgres://` or `postgresql://` is read as a database. A log is read for `mi` and `gl` packets.

It merges into `minigames.json` and `list-contents.json` and keeps the rows already there.

```sh
bun peck catalogue:import --from packets.log
```

## `database:migrate`

Runs Peck's and every plugin's migrations.

| Option       | Env            | Default | Flag |
| ------------ | -------------- | ------- | ---- |
| `--database` | `DATABASE_URL` | Asks    |      |

It prints how many were applied for Peck and each plugin.

```sh
bun peck database:migrate
```

## `database:rollback`

Reverts Peck's or a plugin's migrations.

| Option       | Env            | Default | Flag |
| ------------ | -------------- | ------- | ---- |
| `--database` | `DATABASE_URL` | Asks    |      |
| `--plugin`   |                | `peck`  |      |
| `--step`     |                | `1`     |      |

`--plugin` is the plugin's name, or `peck` for Peck's own. `--step` must be a whole number of 1 or more.

```sh
bun peck database:rollback --step 2
```

## `database:seed`

Runs Peck's and every plugin's seeds.

| Option       | Env            | Default   | Flag |
| ------------ | -------------- | --------- | ---- |
| `--database` | `DATABASE_URL` | Asks      |      |
| `--only`     |                | All seeds |      |

`--only` takes seed names separated by commas. An unknown name stops it. With `NODE_ENV=production` only the seeds marked for production run, which leaves out `accounts`.

Peck's seeds are `avatars`, `rooms`, `parties`, `items`, `diamonds`, `permissions`, `den-rooms`, `minigames`, `achievements`, `pets`, `roles`, `accounts`, `den-items`, `schedule`, `list-contents`, `exchanges` and `lists`.

```sh
bun peck database:seed --only items,den-items
```

## `player:rename`

Changes a player's username.

| Option       | Env            | Default | Flag |
| ------------ | -------------- | ------- | ---- |
| `--database` | `DATABASE_URL` | Asks    |      |
| `--redis`    | `REDIS_URL`    | Asks    |      |
| `--player`   |                | Asks    |      |
| `--to`       |                | Asks    |      |

`--player` is their username now and `--to` the new one. It tells the running nodes through Redis.

```sh
bun peck player:rename --player oldname --to newname
```

## `shop:stock`

Puts things in a shop.

| Option       | Env            | Default        | Flag |
| ------------ | -------------- | -------------- | ---- |
| `--database` | `DATABASE_URL` | Asks           |      |
| `--list`     |                | Asks           |      |
| `--items`    |                | Asks           |      |
| `--type`     |                | The list's own |      |

`--list` is the shop's list id. `--items` is definition ids separated by commas. `--type` is the kind of thing they are. It fails if there's no such list.

```sh
bun peck shop:stock --list 1234 --items 100,101,102
```

## `shop:unstock`

Takes things out of a shop.

| Option       | Env            | Default    | Flag |
| ------------ | -------------- | ---------- | ---- |
| `--database` | `DATABASE_URL` | Asks       |      |
| `--list`     |                | Asks       |      |
| `--items`    |                | Everything |      |

`--items` is definition ids separated by commas. Leave it out to empty the list.

```sh
bun peck shop:unstock --list 1234 --items 101
```

## `plugins:list`

Lists the plugins and what they add. It takes no options.

Each line shows the plugin's name, version, and its handlers, seeds, commands and whether it has migrations.

```sh
bun peck plugins:list
```

## `update`

Updates Peck to the latest version. It needs git.

| Option         | Env            | Default                           | Flag |
| -------------- | -------------- | --------------------------------- | ---- |
| `--repository` |                | `https://github.com/peckemu/peck` |      |
| `--branch`     |                | `main`                            |      |
| `--database`   | `DATABASE_URL` | None                              |      |
| `--check`      |                |                                   | Yes  |

It fetches the branch and lists the new commits. `--check` stops there. Otherwise it fast-forwards, runs `bun install` and migrates the database.

It refuses if you have uncommitted changes or your history differs from the repository. With no database set it skips the migrations and tells you to run `database:migrate`.

```sh
bun peck update --check
```

## Plugin commands

Plugins can add their own commands. They show in `bun peck help` after Peck's and take options the same way. `plugins:list` shows how many each plugin adds.

The console looks for plugins in `PLUGINS_DIR`, which is the `plugins` folder by default. `PLUGINS` limits it to the names you list, separated by commas.

A plugin command with the same name as one of Peck's replaces it.
