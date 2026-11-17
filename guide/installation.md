# Installation

Read [How it works](./how-it-works) first if you're new.

## What you need

- [Bun](https://bun.sh)
- PostgreSQL and Redis, or Docker to run them for you

## 1. Get the code

```sh
git clone https://github.com/peckemu/peck
cd peck
bun install
```

## 2. Start PostgreSQL and Redis

```sh
docker compose up -d
```

This uses the same user, password and ports as `.env.example`. Skip it if you've got your own, and point `DATABASE_URL` and `REDIS_URL` at them in the next step.

## 3. Add your settings

```sh
cp .env.example .env.local
```

The defaults are fine for running it on your own machine. You'll need to fill in the content settings yourself. See [Content](./content).

## 4. Fill the database

```sh
bun run db:migrate
bun peck content:import
bun run db:seed
```

Peck doesn't come with any game content. You'll have to sort that bit out yourself.

## 5. Run it

```sh
bun run dev
```

That starts the emulator, the API and the website. The website is on `http://localhost:3001`. Sign in as `sxip` with the password `peck123`, then change it.

To run one on its own, use `bun run dev:emulator`, `bun run dev:api` or `bun run dev:website`.

## If it doesn't start

| Error                        | Fix                                                      |
| ---------------------------- | -------------------------------------------------------- |
| `Missing DATABASE_URL`       | `.env.local` is missing, or that line in it is empty     |
| `Failed to connect`          | PostgreSQL isn't running. Run `docker compose up -d`     |
| `Missing content/rooms.json` | Run `bun peck content:import` before seeding             |
| `Pack <id> answered 404`     | The content settings are wrong. See [Content](./content) |

## Keep it up to date

```sh
bun peck update
```

[Console](./console#update) has the details.
