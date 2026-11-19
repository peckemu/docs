# Adventures

Players can join, host and play adventures. What happens in each one was decided by the game's servers, and the client doesn't have it. You add each adventure yourself as a row in `quest_definitions`.

Until you do, joining one fails with `NV`.

## What works

- Public and private lobbies, joining a buddy, kicking from a private lobby and leaving
- Starting, with each adventure in a room of its own
- Chests, pick ups, carrying and dropping items
- Fighting phantoms, being hit, healing and coming back
- Planting seeds
- Prizes, experience and adventure levels
- The gifts at the end, which are kept once per player

Leaving an adventure puts the player back in the room they came from.

## What doesn't

Peck has no script engine. It never plays sounds, fades the screen, spawns phantoms or moves players on to the next room. Each adventure is one room.

Questions, films and minigames inside an adventure do nothing. Neither does playing it again (`qcq`).

[Packets](/reference/packets#adventure) lists the packets that are built but never sent.

## Adding one

Migration `20261119100000_quests.ts` makes the table. The emulator reads it when it starts, so restart it after you change anything.

| Column           | What it is                                                 |
| ---------------- | ---------------------------------------------------------- |
| `def_id`         | The adventure's id, as the client knows it                 |
| `title_str_id`   | The string id of its name                                  |
| `room_def_id`    | The room it starts in. It has to be a room Peck has loaded |
| `avatar_limit`   | The most players, `4` by default                           |
| `avatar_min`     | The fewest players needed to start, `1` by default         |
| `level_min`      | The lowest adventure level that can join                   |
| `hard_level_min` | The lowest adventure level that can join on hard           |
| `members_only`   | Whether only members can join                              |
| `avatar_type`    | `0` for any animal, `1` for land and `2` for ocean         |
| `actors`         | The actors it starts with, as a JSON list                  |
| `gifts`          | The gifts at the end, as a JSON list of prizes             |
| `gift_actor`     | The id of the actor that opens the gifts                   |
| `popup_type`     | Which gift screen the client shows                         |
| `crystal_goal`   | The crystals needed for the gifts                          |
| `music`          | The music it plays                                         |
| `sound_packs`    | The sound packs it loads, as a JSON list of ids            |

Ocean adventures are refused with `NOCEAN` from a land room, and land ones with `NLAND` from an ocean room.

### Actors

Each actor needs an `actorId` and a `type`. The rest is optional.

| Field          | What it is                              |
| -------------- | --------------------------------------- |
| `actorId`      | Its id, as the room's layout names it   |
| `type`         | What kind of actor it is                |
| `defId`        | Its definition                          |
| `defName`      | Its definition's name                   |
| `state`        | The state it starts in                  |
| `visible`      | Whether it shows                        |
| `requireClick` | Whether it has to be clicked            |
| `pathName`     | The path it walks                       |
| `swfState`     | The animation it starts with            |
| `prize`        | What it gives                           |
| `xp`           | The experience it gives                 |
| `health`       | Its health, `100` by default            |
| `membersOnly`  | Whether only members can keep its prize |

| Type | Actor                          |
| ---- | ------------------------------ |
| `1`  | Picked up by walking onto it   |
| `11` | A phantom                      |
| `12` | A phantom boss                 |
| `13` | A treasure chest               |
| `15` | An item that can be carried    |
| `16` | Named by its definition's name |
| `17` | An item in a group             |
| `21` | A plant                        |
| `23` | Something phantoms can break   |

Phantoms, bosses, plants and things phantoms break can be hit. A chest with no `prize` is empty.

### Prizes

| `kind` | Prize      | `value`        |
| ------ | ---------- | -------------- |
| `1`    | A den item | Its definition |
| `2`    | Clothing   | Its definition |
| `3`    | Gems       | How many       |
| `4`    | Crystals   | How many       |

Clothing also takes a `color`.

### An example

The ids here are made up. Use ones from your own content.

```sql
INSERT INTO quest_definitions
  (def_id, title_str_id, room_def_id, avatar_limit, actors, gifts, gift_actor, crystal_goal, sound_packs)
VALUES (
  1, 1000, 500, 4,
  '[
    { "actorId": "chest1", "type": 13, "prize": { "kind": 3, "value": 40 } },
    { "actorId": "orb1", "type": 1, "xp": 5 },
    { "actorId": "phantom1", "type": 11, "health": 60, "xp": 20 }
  ]',
  '[{ "kind": 2, "value": 1234, "color": 0 }, { "kind": 3, "value": 300 }]',
  'giftchest',
  1,
  '[]'
);
```

## Levels and health

These numbers are made up. The client doesn't show how the real game worked them out.

| What                     | Value                                 |
| ------------------------ | ------------------------------------- |
| Experience for level `n` | `25 × n × (n − 1)`, up to level `100` |
| A player's health        | `100`                                 |
| A phantom's hit          | `20`                                  |
| Another player's hit     | `25`                                  |
| A heal                   | `20`                                  |

Experience and levels are saved per animal. Finishing with fewer than `crystal_goal` crystals gives 150 gems in place of a gift.

## What's kept

| Table               | What it holds                                      |
| ------------------- | -------------------------------------------------- |
| `quest_completions` | How many times each player finished each adventure |
| `quest_prizes`      | Every prize a player kept, and when                |
