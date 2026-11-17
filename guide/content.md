# Content

Peck has no game data in it. The importer downloads it and `db:seed` loads it into the database. Finding the content is up to you.

## Settings

| Variable                | What it is                             |
| ----------------------- | -------------------------------------- |
| `CONTENT_FLASHVARS_URL` | Gives the deploy and build version     |
| `CONTENT_URL`           | Where the game files are               |
| `CONTENT_HASH_PREFIX`   | The key the file names are hashed with |

File names on the content server are hashed, so with the wrong key nothing is found.

## Importing

```sh
bun peck content:import
```

Add `--save` to write the settings you pass to `.env.local`.

```sh
bun peck content:import --flashvars <url> --content <url> --key <key> --save
```

The files go in `packages/database/content`, which git ignores. There's one each for rooms, items, avatars, den items, den rooms, pets, diamonds, exchanges, parties, achievements and shop lists.

## Seeding

```sh
bun run db:seed
```

It stops if a file is missing, except `exchanges.json`.

It also makes an owner account, `sxip` with the password `peck123`. Change the password. Seeding again won't reset it.

## Minigames and shop stock

These aren't in the content, the game server sends them. `catalogue:import` reads them from a packet log.

```sh
bun peck catalogue:import --from packets.log
```

It writes `minigames.json` and `list-contents.json`. Seed again after. Without them there are no minigames and the shops are empty.

## Updating

When the game updates, import and seed again. Existing data is updated, not wiped. Set `GAME_DEPLOY_VERSION` to the client's build.

## Errors

| Error                              | Fix                                           |
| ---------------------------------- | --------------------------------------------- |
| `Flashvars answered 404`           | Check `CONTENT_FLASHVARS_URL`                 |
| `Flashvars have no deploy version` | The flashvars URL isn't the right one         |
| `Pack <id> answered 404`           | Check `CONTENT_HASH_PREFIX` and `CONTENT_URL` |
| `Missing content/rooms.json`       | Run `content:import` first                    |
