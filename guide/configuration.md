# Configuration

Settings go in `.env.local`. Start from `.env.example`, which has every variable in it.

## Emulator

| Variable     | Default   | What it does                    |
| ------------ | --------- | ------------------------------- |
| `HOST`       | `0.0.0.0` | Address the emulator listens on |
| `PORT`       | `443`     | Port the emulator listens on    |
| `LOG_LEVEL`  | `info`    | How much to log                 |
| `LOG_PRETTY` | `true`    | Readable logs instead of JSON   |

## Database and Redis

| Variable       | Default                                    |
| -------------- | ------------------------------------------ |
| `DATABASE_URL` | `postgres://peck:peck@localhost:5432/peck` |
| `REDIS_URL`    | `redis://localhost:6379`                   |

## Limits

| Variable                      | Default | What it does                           |
| ----------------------------- | ------- | -------------------------------------- |
| `MAX_FRAME_BYTES`             | `65536` | Largest packet the emulator reads      |
| `MAX_CONNECTIONS`             | `5000`  | Connections across the whole node      |
| `MAX_CONNECTIONS_PER_ADDRESS` | `10`    | Connections from one address           |
| `PACKET_RATE`                 | `30`    | Packets a second a client can send     |
| `PACKET_BURST`                | `60`    | Packets a client can send in a burst   |
| `MAX_QUEUED_CHUNKS`           | `32`    | Writes queued before a client is cut   |
| `MAX_REFUSED`                 | `20`    | Refused packets before a client is cut |
| `LOGIN_TIMEOUT_MS`            | `15000` | Time a client has to log in            |

## Cluster

| Variable        | Default        | What it does                        |
| --------------- | -------------- | ----------------------------------- |
| `NODE_ID`       |                | Fixed node id, or empty to pick one |
| `NODE_NAME`     |                | Name shown in the server list       |
| `PUBLIC_HOST`   | `127.0.0.1`    | Host the client connects to         |
| `PUBLIC_PORT`   | Same as `PORT` | Port the client connects to         |
| `NODE_CAPACITY` | `5000`         | Players the node takes              |

Players can only move between nodes if they all use the same `PUBLIC_PORT` and each one has its own `PUBLIC_HOST`.

## API

`/play` won't start a game until `CONTENT_URL`, `GAME_DEPLOY_VERSION` and `GAME_BUILD_VERSION` are all set.

| Variable              | Default | What it does                      |
| --------------------- | ------- | --------------------------------- |
| `API_PORT`            | `3000`  | Port the API listens on           |
| `API_URL`             |         | Public address of the API         |
| `API_ORIGINS`         |         | Sites allowed to call the API     |
| `GAME_DEPLOY_VERSION` |         | Client build to load, like `1829` |
| `GAME_BUILD_VERSION`  |         | Build number sent to the client   |

## Masterpieces

Masterpieces need an S3 bucket.

| Variable               | Default |
| ---------------------- | ------- |
| `S3_BUCKET`            |         |
| `S3_ENDPOINT`          |         |
| `S3_REGION`            | `auto`  |
| `S3_ACCESS_KEY_ID`     |         |
| `S3_SECRET_ACCESS_KEY` |         |
