# Production

Running Peck for other people is much the same as running it on your own machine. There's no build step. You mostly have more settings to get right.

## Processes

Peck runs as two processes. Both need PostgreSQL and Redis.

| Process  | Command                  | Listens on               |
| -------- | ------------------------ | ------------------------ |
| Emulator | `bun run start:emulator` | TCP on `HOST` and `PORT` |
| API      | `bun run start:api`      | HTTP on `API_PORT`       |
| Both     | `bun run start`          |                          |

Bun runs the TypeScript as it is. Each app reads `.env` and then `.env.local` from the project root, as set in `apps/emulator/package.json` and `apps/api/package.json`.

```json
"start": "bun --env-file=../../.env --env-file=../../.env.local src/index.ts"
```

The website in `apps/website` isn't part of `bun run start`. It's a Nuxt app with its own `build` and `preview` scripts.

Both processes stop cleanly on `SIGINT` and `SIGTERM`. The emulator leaves the cluster before it closes its port.

## First deploy

```sh
bun install
bun run db:migrate
bun peck content:import
NODE_ENV=production bun run db:seed
```

With `NODE_ENV=production` the seeder only runs seeds marked for production. That's every seed except `accounts`. The `sxip` owner account won't be made. Run that seed on its own if you want it.

```sh
bun peck database:seed --only accounts
```

It needs the `roles` seed to have run first, or it stops with `Role owner is not seeded`.

Gift codes, eco gifts and referral treasures start empty. [Rewards](./rewards) shows how to set them up. Adventures have to be added by hand as well. See [Adventures](./adventures).

## Docker

The emulator and the API each have a Dockerfile. Build them from the project root.

```sh
docker build -f apps/emulator/Dockerfile -t peck-emulator .
docker build -f apps/api/Dockerfile -t peck-api .
```

Each image installs only that app's dependencies and runs it with `NODE_ENV=production`. They don't read `.env` or `.env.local`. Pass the settings in as environment variables.

```sh
docker run --env-file .env.local -p 443:443 peck-emulator
docker run --env-file .env.local -p 3000:3000 peck-api
```

Inside a container `localhost` is the container itself. Point `DATABASE_URL` and `REDIS_URL` at hosts it can reach.

The images don't run migrations or seeds. Run `bun run db:migrate` from a checkout before you start a new version. `docker-compose.yml` only starts PostgreSQL and Redis for local use.

## Updating

```sh
bun peck update
```

It pulls `main`, runs `bun install` and then the migrations. It doesn't restart the emulator or the API. The migrations only run when `DATABASE_URL` is set. Otherwise it prints `No database set, run database:migrate later`. [Console](./console#update) has the options.

## Ports

| Variable      | Default        | What it is                            |
| ------------- | -------------- | ------------------------------------- |
| `HOST`        | `0.0.0.0`      | Address the emulator listens on       |
| `PORT`        | `443`          | Port the emulator listens on          |
| `PUBLIC_PORT` | same as `PORT` | Port the client is told to connect to |
| `PUBLIC_HOST` | `127.0.0.1`    | Host the client is told to connect to |
| `API_PORT`    | `3000`         | Port the API listens on               |

The emulator speaks plain TCP. The flashvars the API hands out set `smartfoxTls` to `0`.

Set `PUBLIC_HOST` to an address players can reach. The API gives it to the client as the game server.

## PostgreSQL and Redis

Both apps stop with `Missing DATABASE_URL` or `Missing REDIS_URL` if either is empty. The emulator runs `select 1` and connects to Redis before it opens its port.

PostgreSQL keeps accounts, players, items, dens, reports and the audit log. Redis keeps the live state.

| In Redis        | Lifetime                      |
| --------------- | ----------------------------- |
| Node records    | 30 seconds, renewed every 10  |
| Player presence | 60 seconds, renewed every 20  |
| Login tickets   | 5 minutes                     |
| Cluster events  | Sent over pub/sub, never kept |

[Clustering](./clustering) explains each of these.

## Settings that matter

[Configuration](./configuration) lists the usual ones. These change how Peck behaves in production.

| Variable              | Default                    | What it does                                                                                                   |
| --------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`            |                            | `production` skips the `accounts` seed, makes `LOG_PRETTY` default to `false` and turns off the banner colours |
| `API_URL`             | `http://127.0.0.1:3000`    | Public address of the API, sent to the client                                                                  |
| `API_ORIGINS`         |                            | Sites allowed to call the API from a browser                                                                   |
| `WEBSITE_URL`         | `http://127.0.0.1`         | Sent to the client in the flashvars                                                                            |
| `CONTENT_URL`         |                            | Where the client loads the game files from                                                                     |
| `GAME_DEPLOY_VERSION` |                            | Client build to load                                                                                           |
| `GAME_BUILD_VERSION`  |                            | Build number sent to the client                                                                                |
| `PECK_VERSION`        | `dev`                      | Build name the node reports to the cluster                                                                     |
| `START_ROOM`          | `jamaa_township.room_main` | Room players land in when a join fails                                                                         |
| `PLUGINS`             |                            | Plugins to load, comma separated. Empty loads them all                                                         |
| `PLUGINS_DIR`         | `plugins` in the repo      | Folder the plugins are in                                                                                      |

`POST /play` and `GET /flashvars` answer `503` with `The game content is not set up` until `CONTENT_URL`, `GAME_DEPLOY_VERSION` and `GAME_BUILD_VERSION` are all set.

If a name in `PLUGINS` has no folder, the emulator stops with `Plugin <name> was not found`.

## CORS

`API_ORIGINS` is a comma separated list of sites. It goes straight into Hono's `cors` middleware.

::: code-group

```ts [apps/api/src/app/index.ts]
cors({
  origin: [...origins],
  allowHeaders: ['Authorization', 'Content-Type'],
})
```

:::

A site that isn't on the list gets no `Access-Control-Allow-Origin` header. If the list is empty, no site can call the API from a browser. `.env.example` allows the website on port `3001`.

The Flash client's paths skip CORS and the security headers. Those are `/wall`, `/mp` and `/crossdomain.xml`.

## Health check

```sh
curl http://127.0.0.1:3000/health
```

It answers `{"status":"ok"}`. It doesn't check the database or Redis.

## Logs

Both apps log with [pino](https://getpino.io) to standard output.

| Variable     | Default                                       | What it does                   |
| ------------ | --------------------------------------------- | ------------------------------ |
| `LOG_LEVEL`  | `info`                                        | Lowest level written           |
| `LOG_PRETTY` | `true`, or `false` with `NODE_ENV=production` | Coloured lines instead of JSON |

`.env.example` sets `LOG_PRETTY=true`, which wins over `NODE_ENV`. Set it to `false` for JSON.

The API logs one `request` line for every request with the method, path, status and time in milliseconds. Errors it didn't expect are logged as `request failed` and answered with `500`.

Emulator log lines to keep an eye on:

| Message                             | Level | Meaning                                     |
| ----------------------------------- | ----- | ------------------------------------------- |
| `listening`                         | info  | The port is open                            |
| `joined the cluster`                | info  | The node has its id                         |
| `too many connections`              | warn  | A connection was turned away                |
| `dropped`                           | warn  | A client broke a limit. `reason` says which |
| `heartbeat failed`                  | warn  | Redis couldn't be reached                   |
| `node id was taken by another node` | error | Two nodes think they have the same id       |

## Limits

The defaults are in `apps/emulator/src/limits/index.ts`. The variables are on [Configuration](./configuration#limits).

| Limit                         | What happens                                            |
| ----------------------------- | ------------------------------------------------------- |
| `MAX_CONNECTIONS`             | New connections are closed straight away                |
| `MAX_CONNECTIONS_PER_ADDRESS` | Same, counted for each address                          |
| `MAX_FRAME_BYTES`             | A bigger frame drops the client with `sent a bad frame` |
| `PACKET_RATE`, `PACKET_BURST` | Dropped with `sent too many packets`                    |
| `MAX_QUEUED_CHUNKS`           | Dropped with `sent faster than it could be handled`     |
| `MAX_REFUSED`                 | Dropped with `sent too many refused packets`            |
| `LOGIN_TIMEOUT_MS`            | Dropped with `did not log in in time`                   |

The packet rate is a token bucket. A client starts with `PACKET_BURST` tokens and gets `PACKET_RATE` back each second.

A packet is refused when the client isn't logged in yet or a handler's guard turns it down, such as a throttle. Sockets that send nothing for 7 minutes are closed.
