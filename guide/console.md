# Console

Run these from the project root.

```sh
bun peck <command> [options]
```

`bun peck help` lists them all. Add `--help` to any command to see its options.

## Database

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `database:migrate`  | Runs peck's and every plugin's migrations |
| `database:rollback` | Reverts peck's or a plugin's migrations   |
| `database:seed`     | Runs peck's and every plugin's seeds      |

## Content

| Command            | What it does                             |
| ------------------ | ---------------------------------------- |
| `content:import`   | Imports the game's content for the seeds |
| `catalogue:import` | Imports minigames and shop lists         |

## Game

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `player:rename` | Changes a player's username     |
| `shop:stock`    | Puts things in a shop           |
| `shop:unstock`  | Takes things out of a shop      |
| `broadcast`     | Shows a message to every player |
| `party:end`     | Ends a player's hosted party    |

## Rewards

| Command          | What it does                |
| ---------------- | --------------------------- |
| `code:create`    | Makes a gift code           |
| `code:list`      | Lists the gift codes        |
| `eco:gift`       | Adds or changes an eco gift |
| `referral:level` | Sets up a referral treasure |

See [Rewards](./rewards) for how to set them up.

## Plugins

| Command        | What it does                        |
| -------------- | ----------------------------------- |
| `plugins:list` | Lists the plugins and what they add |

## Update

```sh
bun peck update
```

Pulls the latest `main`, installs dependencies and runs the migrations. It won't do anything if you have uncommitted changes or your branch has drifted from the repo.

| Option         | What it does                           |
| -------------- | -------------------------------------- |
| `--check`      | Only lists what's new                  |
| `--repository` | Another repository to update from      |
| `--branch`     | Another branch, `main` by default      |
| `--database`   | Database to migrate, or `DATABASE_URL` |
