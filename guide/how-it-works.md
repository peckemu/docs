# How it works

## Parts

| Part       | What it does                              |
| ---------- | ----------------------------------------- |
| Emulator   | The game server. The client connects here |
| API        | Accounts, signing in and starting a game  |
| PostgreSQL | Stores accounts, animals, items and dens  |
| Redis      | Online players, buddies and login tickets |
| Content    | The game's data. You import it            |
| Client     | Not included                              |

`bun run dev` runs the emulator and the API. PostgreSQL and Redis need to be running already.

## Joining a game

1. The player signs in on the API.
2. The API gives them a ticket and the client's settings.
3. The client loads the game files from your content server.
4. The client connects to the emulator and logs in with the ticket.

## Content

The emulator doesn't know what any item, room or animal is. That comes from the game's content, which you import into the database. See [Content](./content).
