# Installation

Read [How it works](./how-it-works) first if you're new.

## What you need

- [Bun](https://bun.sh)
- PostgreSQL
- Redis

## Setup

Clone the repo and copy `.env.example` to `.env.local`.

```sh
git clone https://github.com/peckemu/peck
cd peck
cp .env.example .env.local
```

Then install everything, migrate, import and seed.

```sh
bun install
bun run db:migrate
bun peck content:import
bun run db:seed
```

`content:import` needs the content settings filled in. Peck doesn't come with any game content. You'll have to sort that bit out yourself. See [Content](./content).

## Run it

```sh
bun run dev
```

That starts the emulator and the API. Use `bun run dev:emulator` or `bun run dev:api` to run just one.

## Keep it up to date

```sh
bun peck update
```

[Console](./console#update) has the details.
