# Environment

Every variable Peck reads. The emulator, API and console load `.env` and then `.env.local`. `bun run dev:website` loads `.env.local`. [Configuration](/guide/configuration) covers the ones you'll change most.

"Default" is what the code uses when the variable is unset. `.env.example` sets some to other values, shown in the last column.

## Emulator

The emulator stops with `Missing <name>` if a required variable is empty. A number that isn't a whole number of 0 or more stops it with `<name> is not a whole number`.

| Variable       | Default                       | What it does                     | `.env.example` |
| -------------- | ----------------------------- | -------------------------------- | -------------- |
| `HOST`         | `0.0.0.0`                     | Address it listens on            | `0.0.0.0`      |
| `PORT`         | `443`                         | Port it listens on               | `443`          |
| `DATABASE_URL` | Required                      | PostgreSQL address               | Set            |
| `REDIS_URL`    | Required                      | Redis address                    | Set            |
| `LOG_LEVEL`    | `info`                        | How much to log                  | `info`         |
| `LOG_PRETTY`   | `true`, `false` in production | Readable logs instead of JSON    | `true`         |
| `START_ROOM`   | `jamaa_township.room_main`    | Room players are sent to first   |                |
| `PLUGINS_DIR`  | `plugins`                     | Folder plugins are loaded from   |                |
| `PLUGINS`      | All                           | Plugins to load, comma separated |                |

### Limits

| Variable                      | Default | What it does                           |
| ----------------------------- | ------- | -------------------------------------- |
| `MAX_FRAME_BYTES`             | `65536` | Largest packet it reads                |
| `MAX_CONNECTIONS`             | `5000`  | Connections across the node            |
| `MAX_CONNECTIONS_PER_ADDRESS` | `10`    | Connections from one address           |
| `PACKET_RATE`                 | `30`    | Packets a second a client can send     |
| `PACKET_BURST`                | `60`    | Packets a client can send in a burst   |
| `MAX_QUEUED_CHUNKS`           | `32`    | Writes queued before a client is cut   |
| `MAX_REFUSED`                 | `20`    | Refused packets before a client is cut |
| `LOGIN_TIMEOUT_MS`            | `15000` | Time a client has to log in            |

`.env.example` sets each of these to its default.

### Cluster

| Variable        | Default          | What it does                | `.env.example` |
| --------------- | ---------------- | --------------------------- | -------------- |
| `NODE_ID`       | Picks a free one | Fixed node id               | Empty          |
| `NODE_NAME`     | `Server <id>`    | Name in the server list     | Empty          |
| `PUBLIC_HOST`   | `127.0.0.1`      | Host the client connects to | `127.0.0.1`    |
| `PUBLIC_PORT`   | `PORT`           | Port the client connects to | `443`          |
| `NODE_CAPACITY` | `5000`           | Players the node takes      | `5000`         |
| `PECK_VERSION`  | `dev`            | Version the node reports    |                |

## API

The API stops with `Missing <name>` if a required variable is empty.

| Variable              | Default                       | What it does                              | `.env.example` |
| --------------------- | ----------------------------- | ----------------------------------------- | -------------- |
| `API_PORT`            | `3000`                        | Port it listens on                        | `3000`         |
| `API_URL`             | `http://127.0.0.1:<API_PORT>` | Public address of the API                 | Empty          |
| `API_ORIGINS`         | None                          | Sites allowed to call it, comma separated | Set            |
| `DATABASE_URL`        | Required                      | PostgreSQL address                        | Set            |
| `REDIS_URL`           | Required                      | Redis address                             | Set            |
| `LOG_LEVEL`           | `info`                        | How much to log                           | `info`         |
| `LOG_PRETTY`          | `true`, `false` in production | Readable logs instead of JSON             | `true`         |
| `CONTENT_URL`         | Empty                         | `content` in the flashvars                | Empty          |
| `GAME_DEPLOY_VERSION` | Empty                         | `deploy_version` in the flashvars         | `1829`         |
| `GAME_BUILD_VERSION`  | Empty                         | `build_version` in the flashvars          | Empty          |
| `WEBSITE_URL`         | `http://127.0.0.1`            | `website` in the flashvars                | Empty          |

`API_URL` also sets `mdUrl` and `playerWallHost` in the flashvars. If `CONTENT_URL`, `GAME_DEPLOY_VERSION` or `GAME_BUILD_VERSION` is empty, `/play` and `/flashvars` answer `503`.

### Masterpieces

| Variable               | Default | What it does    | `.env.example` |
| ---------------------- | ------- | --------------- | -------------- |
| `S3_BUCKET`            | Empty   | Bucket name     | Empty          |
| `S3_ENDPOINT`          | Empty   | Bucket endpoint | Empty          |
| `S3_REGION`            | `auto`  | Bucket region   | `auto`         |
| `S3_ACCESS_KEY_ID`     | Empty   | Access key      | Empty          |
| `S3_SECRET_ACCESS_KEY` | Empty   | Secret key      | Empty          |

With no `S3_BUCKET`, masterpiece uploads fail.

## Console

Some options fall back to a variable. See [Console](./console).

| Variable                | Used by                                 |
| ----------------------- | --------------------------------------- |
| `DATABASE_URL`          | Every command that opens the database   |
| `REDIS_URL`             | `player:rename`                         |
| `CONTENT_FLASHVARS_URL` | `content:import --flashvars`            |
| `CONTENT_URL`           | `content:import --content`              |
| `CONTENT_HASH_PREFIX`   | `content:import --key`                  |
| `PLUGINS_DIR`           | Folder plugins are loaded from          |
| `PLUGINS`               | Plugins to load, comma separated        |
| `NODE_ENV`              | `production` runs only production seeds |

`.env.example` leaves the three `CONTENT_*` variables empty. `content:import --save` fills them in `.env.local`.

## Website

| Variable                | Default                 | What it does               | `.env.example`          |
| ----------------------- | ----------------------- | -------------------------- | ----------------------- |
| `NUXT_PUBLIC_BASE_URL`  | `http://127.0.0.1:3000` | API address for signing in | `http://127.0.0.1:3000` |
| `NUXT_PUBLIC_SITE_NAME` | `Peck`                  | Site name                  | `Peck`                  |
| `GOOGLE_MAPS_API_KEY`   | None                    | Google Maps key            |                         |

## Packages

| Variable       | Read by             | What it does                               |
| -------------- | ------------------- | ------------------------------------------ |
| `DATABASE_URL` | `packages/database` | Required by its seed script and ORM config |
| `NODE_ENV`     | `packages/database` | `production` runs only production seeds    |
| `NODE_ENV`     | `packages/banner`   | `production` turns off colour              |
| `NO_COLOR`     | `packages/banner`   | Any value turns off colour                 |
| `TERM`         | `packages/banner`   | `dumb` turns off colour                    |

`NODE_ENV=production` also turns `LOG_PRETTY` off by default in the emulator and the API.
