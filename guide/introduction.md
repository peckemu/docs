# Introduction

Peck is an open source Animal Jam Classic emulator written in TypeScript with Bun. It's a hobby project, mostly for learning how game servers work.

## What works

- Login, animals, clothes and name bars
- Rooms, chat, dens and den shops
- Shops, recycling and currency exchange
- Buddies, blocking, trading and Jam-a-Grams
- Pets, parties, minigames and PvP
- Masterpieces, the Jammer Wall and AJHQ cards
- Achievements and the daily spin
- Reports, bans, mutes and kicks
- Clustering and plugins

## What doesn't

- There's no chat filter. Write one before you let real people on.
- Adventures aren't done.
- No game files are included. You'll need your own content.

## Where things are

| Folder              | What it is                                     |
| ------------------- | ---------------------------------------------- |
| `apps/emulator`     | The game server the client connects to         |
| `apps/api`          | The HTTP API for accounts, sign in and play    |
| `apps/console`      | The `peck` command line                        |
| `packages/protocol` | Frames, codecs and the packet framework        |
| `packages/packets`  | Every incoming and outgoing packet             |
| `packages/game`     | Game rules with no I/O                         |
| `packages/database` | Entities, repositories and migrations          |
| `packages/cluster`  | Presence, tickets and events shared over Redis |
| `packages/plugins`  | The handler and command API plugins build on   |

It's built for client build `1829`.

## Where next

- [How it works](./how-it-works) and [Installation](./installation) to get it running
- [Plugins](/plugins/introduction) to add your own features
- [Project layout](/development/layout) to work on Peck itself
