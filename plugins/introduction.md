# Plugins

A plugin adds to Peck without changing Peck's own code. `bun peck update` keeps working, because there's nothing of yours in Peck's files to clash with.

A plugin can add:

- packet handlers, or replace Peck's own
- its own packets
- middleware that runs around every packet
- listeners for players logging in, leaving and moving between rooms
- console commands
- database tables, through migrations
- seeds

Everything a plugin needs comes from `@peck/plugins`, plus `@peck/database` and `@peck/protocol` if it touches the database or packets.

## Where they go

Each plugin is its own folder inside `plugins` at the root of the repo.

```
peck/
├─ apps/
├─ packages/
└─ plugins/
   └─ visits/
      ├─ package.json
      ├─ migrations/
      └─ src/
         └─ index.ts
```

`plugins/*` is a Bun workspace. A plugin can depend on the `@peck` packages with `workspace:*`.

## Turning them on

Every folder in `plugins` with a `package.json` is loaded. Use `PLUGINS` to pick which ones.

| Variable      | Default               | What it does                                                   |
| ------------- | --------------------- | -------------------------------------------------------------- |
| `PLUGINS_DIR` | `plugins` in the repo | The folder plugins load from                                   |
| `PLUGINS`     |                       | Folder names to load, comma separated. Empty loads all of them |

```sh
PLUGINS=visits,welcome
```

The emulator and the console both read these. A plugin's commands and migrations only show up when it's turned on. A name in `PLUGINS` with no folder stops both with `Plugin <name> was not found`.

To see what loaded:

```sh
bun peck plugins:list
```

```
visits 1.0.0  0 handlers, 0 seeds, 1 commands, migrations
```

## How a plugin is loaded

1. Peck goes through the folders in name order and skips any without a `package.json`.
2. It imports the file named by `main` in `package.json`, or `src/index.ts` if there's no `main`.
3. The default export has to be a class that extends `Plugin`. Anything else is an error.
4. Plugins are sorted so each one comes after the plugins in its `dependencies`.

Loading fails if two plugins have the same name, a dependency isn't loaded, or two plugins depend on each other.

## When the emulator starts

1. The plugins' handlers go into the handler list, after Peck's own.
2. The content loaders run.
3. Each plugin's middleware is added.
4. Each plugin's `setup` runs, in dependency order.
5. The server starts and joins the cluster.
6. The `start` event goes out.

When it stops, the `stop` event goes out and then each plugin's `stop` runs, in reverse order.

## Next

[Your first plugin](./first-plugin) builds a small plugin from scratch.
