# Packets

Packets are defined in `packages/packets`. The headers are the `Incoming` and `Outgoing` constants in `incoming/headers` and `outgoing/headers`. The emulator's handlers are in `apps/emulator/src/handlers`.

Most packets are `xt`. The session and chat tables show the format of each one. [Plugins](/plugins/handlers) can add handlers of their own.

The packet name is the class name without `Incoming` or `Outgoing`.

## Session

### Incoming

| Header   | Packet            | Format | What the handler does        |
| -------- | ----------------- | ------ | ---------------------------- |
| `ka`     | `KeepAlive`       | `xt`   | Does nothing                 |
| `login`  | `Login`           | `xml`  | Logs a player in             |
| `rndK`   | `RandomKey`       | `xml`  | Hands out the login key      |
| `verChk` | `VersionCheck`    | `xml`  | Accepts any SmartFox version |
| `ves`    | `EmailActivation` | `xt`   | No handler                   |

### Outgoing

| Header  | Packet            | Format | What it says                          |
| ------- | ----------------- | ------ | ------------------------------------- |
| `apiKO` | `ApiObsolete`     | `xml`  | The version was refused               |
| `apiOK` | `ApiOk`           | `xml`  | The version was accepted              |
| `login` | `LoginResult`     | `json` | The login result                      |
| `rndK`  | `RandomKey`       | `xml`  | The login key                         |
| `vea`   | `EmailValidated`  | `xt`   | The email was validated               |
| `ves`   | `EmailActivation` | `xt`   | Whether the activation email was sent |

## Room

### Incoming

| Header | Packet             | What the handler does                             |
| ------ | ------------------ | ------------------------------------------------- |
| `rc`   | `RoomCount`        | Sends how many buddies are in each land           |
| `rf`   | `FirstFiveMinutes` | Says whether the first five minutes room is ready |
| `rj`   | `RoomJoin`         | Puts the player in a room                         |
| `rl`   | `RoomLeave`        | Leaves a game inside the room                     |
| `rm`   | `ShardList`        | Lists the shards                                  |

### Outgoing

| Header | Packet             | What it says                                 |
| ------ | ------------------ | -------------------------------------------- |
| `rc`   | `RoomCount`        | How many buddies are in each land            |
| `rf`   | `FirstFiveMinutes` | Whether the first five minutes room is ready |
| `rj`   | `RoomJoin`         | Whether the player joined a room             |
| `rm`   | `ShardList`        | The shards on each node                      |
| `rp`   | `RoomProperties`   | What room to load                            |
| `rl`   | `RoomList`         | The rooms the client knows                   |

`RoomList` is never sent. The client keeps its own list of rooms as it joins them.

## Chat

### Incoming

| Header   | Packet       | Format | What the handler does                     |
| -------- | ------------ | ------ | ----------------------------------------- |
| `pubMsg` | `PublicChat` | `xml`  | Repeats a public chat message to the room |

### Outgoing

| Header | Packet         | Format                    | What it says              |
| ------ | -------------- | ------------------------- | ------------------------- |
| `uc`   | `RoomChat`     | `xt`                      | Someone in the room spoke |
| `ua`   | `AdminMessage` | A message from Animal Jam |

## Avatar

### Incoming

| Header | Packet              | What the handler does                        |
| ------ | ------------------- | -------------------------------------------- |
| `aa`   | `AvatarAdd`         | Buys another animal                          |
| `ab`   | `AvatarSlot`        | Buys another animal slot                     |
| `ad`   | `AvatarData`        | Sends one of a player's avatars              |
| `af`   | `AvatarPendingFlag` | Sets a pending flag                          |
| `afp`  | `AvatarFastPass`    | Makes the first animal                       |
| `ag`   | `AvatarLookup`      | Looks a player up by name                    |
| `ags`  | `AvatarLookupById`  | Looks a player up by room id                 |
| `ak`   | `AvatarRemove`      | Removes one of the player's animals for gems |
| `al`   | `AvatarList`        | Lists a player's avatars                     |
| `ao`   | `AvatarOrdain`      | Chooses the animals a non-member keeps       |
| `ap`   | `AvatarPaint`       | Recolours the player's animal                |
| `apb`  | `AvatarPhoto`       | Pays for a photo booth picture               |
| `apc`  | `AvatarPhotoCheck`  | Asks about a photo booth picture             |
| `as`   | `AvatarSwitch`      | Switches the player's animal                 |
| `au`   | `Movement`          | Moves the player                             |

### Outgoing

| Header | Packet             | What it says                           |
| ------ | ------------------ | -------------------------------------- |
| `aa`   | `AvatarAdd`        | Whether another animal was added       |
| `ab`   | `AvatarSlot`       | Whether another animal slot was bought |
| `ac`   | `AvatarJoined`     | An avatar appears in the room          |
| `ad`   | `AvatarData`       | One of a player's avatars              |
| `afp`  | `AvatarFastPass`   | Whether the first animal was made      |
| `ag`   | `AvatarLookup`     | A player looked up                     |
| `ak`   | `AvatarRemove`     | Whether an animal was removed          |
| `al`   | `AvatarList`       | A player's avatars                     |
| `an`   | `NameBar`          | A player's name bar changed            |
| `ao`   | `AvatarOrdain`     | Whether the kept animals were taken    |
| `ap`   | `AvatarPaint`      | Whether the animal was recoloured      |
| `apb`  | `AvatarPhoto`      | The gems left                          |
| `apc`  | `AvatarPhotoCheck` | Whether a photo can be paid for        |
| `ar`   | `AvatarLeft`       | An avatar leaves the room              |
| `as`   | `AvatarSwitch`     | Someone switched animals               |
| `au`   | `Movement`         | Avatars in the room moved              |

## Player

### Incoming

| Header | Packet            | What the handler does                   |
| ------ | ----------------- | --------------------------------------- |
| `zg`   | `UserVariables`   | Lists the player's user variables       |
| `zs`   | `UserVariableSet` | Sets one of the player's user variables |

### Outgoing

| Header | Packet                | What it says                |
| ------ | --------------------- | --------------------------- |
| `zg`   | `UserVariables`       | The player's user variables |
| `zs`   | `UserVariableChanged` | A user variable changed     |

## Item

### Incoming

| Header | Packet          | What the handler does       |
| ------ | --------------- | --------------------------- |
| `ib`   | `ItemBuy`       | Buys clothing               |
| `id`   | `DiamondBundle` | Buys a shop's whole bundle  |
| `il`   | `ItemList`      | Lists an avatar's items     |
| `ir`   | `ItemRecycle`   | Recycles clothing for gems  |
| `iu`   | `ItemUse`       | Dresses the player's animal |

### Outgoing

| Header | Packet          | What it says                  |
| ------ | --------------- | ----------------------------- |
| `ib`   | `ItemBuy`       | Whether clothing was bought   |
| `id`   | `DiamondBundle` | Whether a bundle was bought   |
| `il`   | `ItemList`      | An avatar's items             |
| `ir`   | `ItemRecycle`   | The recycled clothing         |
| `iu`   | `ItemUse`       | Whether the clothing changed  |
| `ip`   | `ItemPrize`     | A prize to keep or throw away |

## Currency

### Incoming

| Header | Packet             | What the handler does              |
| ------ | ------------------ | ---------------------------------- |
| `cd`   | `GemDonation`      | Donates gems                       |
| `ce`   | `CurrencyExchange` | Exchanges one currency for another |
| `grc`  | `RedeemCode`       | Redeems a code                     |

### Outgoing

| Header | Packet               | What it says                 |
| ------ | -------------------- | ---------------------------- |
| `cd`   | `GemDonation`        | Whether a donation worked    |
| `ce`   | `CurrencyExchange`   | Whether an exchange worked   |
| `cu`   | `Currency`           | A balance changed            |
| `grc`  | `RedeemCode`         | What a redeemed code came to |
| `grm`  | `MembershipRedeemed` | A membership was redeemed    |

## Den

### Incoming

| Header | Packet           | What the handler does                    |
| ------ | ---------------- | ---------------------------------------- |
| `db`   | `DenBuy`         | Buys a den item or den room              |
| `dc`   | `DenChange`      | Switches the player's den room           |
| `de`   | `DenEmpty`       | Empties the player's den                 |
| `dEc`  | `DenEcoConsumer` | Switches a den eco item on or off        |
| `dEf`  | `DenEcoState`    | Describes the den's eco system           |
| `dEr`  | `DenEcoRedeem`   | Redeems the den's eco credits            |
| `dh`   | `DenEpic`        | Lists the epic dens                      |
| `di`   | `DenItems`       | Lists the player's den items             |
| `dj`   | `DenJoin`        | Puts the player in a den                 |
| `dl`   | `DenRooms`       | Lists the player's den rooms             |
| `dp`   | `DenPrivacy`     | Sets den privacy or tells someone's      |
| `dph`  | `DenPhantom`     | Turns the player into a phantom or back  |
| `dr`   | `DenRecycle`     | Recycles den items or den rooms for gems |
| `ds`   | `DenStateSave`   | Saves the player's den item places       |
| `dsb`  | `DenShopBuy`     | Buys from a den shop stand               |
| `dsi`  | `DenShopItems`   | Shows a stand's stock                    |
| `dsu`  | `DenShopUpdate`  | Changes the player's stand stock         |

### Outgoing

| Header | Packet           | What it says                               |
| ------ | ---------------- | ------------------------------------------ |
| `db`   | `DenBuy`         | Whether a den item or den room was bought  |
| `dc`   | `DenChange`      | The den room switched to                   |
| `de`   | `DenEmpty`       | The den was emptied                        |
| `dEc`  | `DenEcoConsumer` | The den's eco item switches                |
| `dEf`  | `DenEcoState`    | The den's eco system                       |
| `dEr`  | `DenEcoRedeem`   | Whether the eco credits were redeemed      |
| `dh`   | `DenEpic`        | The epic dens                              |
| `di`   | `DenItems`       | The player's den items                     |
| `dl`   | `DenRooms`       | The player's den rooms                     |
| `dp`   | `DenPrivacy`     | A player's den privacy                     |
| `dph`  | `DenPhantom`     | A player turned into a phantom or back     |
| `dpk`  | `DenKicked`      | The player was sent out of a den           |
| `dr`   | `DenRecycle`     | The recycled den items or rooms            |
| `ds`   | `DenState`       | The den's placed items                     |
| `dsb`  | `DenShopBuy`     | Something bought from a den shop stand     |
| `dsi`  | `DenShopItems`   | A stand's stock                            |
| `dss`  | `DenStateSaved`  | Which den items were saved                 |
| `dsu`  | `DenShopUpdate`  | Whether a den shop stand changed           |
| `drc`  | `DenVisitors`    | Someone came into or left the player's den |

## Buddy

### Incoming

| Header | Packet         | What the handler does                 |
| ------ | -------------- | ------------------------------------- |
| `ba`   | `BuddyRequest` | Asks a player to be a buddy           |
| `bb`   | `Block`        | Blocks a player                       |
| `bc`   | `BuddyAnswer`  | Answers a buddy request               |
| `bd`   | `BuddyRemove`  | Ends a buddyship                      |
| `bi`   | `BlockInfo`    | Says whether a player blocks this one |
| `bl`   | `BuddyList`    | Sends the buddy and blocked lists     |
| `br`   | `BuddyWhere`   | Sends a buddy's location              |
| `bu`   | `Unblock`      | Unblocks a player                     |

### Outgoing

| Header | Packet         | What it says                     |
| ------ | -------------- | -------------------------------- |
| `ba`   | `BuddyRequest` | What came of a buddy request     |
| `bb`   | `Block`        | Whether a player was blocked     |
| `bd`   | `BuddyRemove`  | A buddyship ended                |
| `bi`   | `BlockInfo`    | Whether a player blocks this one |
| `bl`   | `BuddyList`    | The buddy or blocked list        |
| `br`   | `BuddyWhere`   | Where a buddy is                 |
| `bs`   | `BuddyStatus`  | A buddy changed                  |
| `bu`   | `Unblock`      | Whether a player was unblocked   |

## Trade

### Incoming

| Header | Packet            | What the handler does                        |
| ------ | ----------------- | -------------------------------------------- |
| `tb`   | `TradeBusy`       | Sends the trade window state                 |
| `ti`   | `TradeAction`     | Offers, answers, cancels or confirms a trade |
| `tl`   | `TradeList`       | Sends a player's trade list                  |
| `ts`   | `TradeListChange` | Changes the player's trade list              |

### Outgoing

| Header | Packet      | What it says             |
| ------ | ----------- | ------------------------ |
| `ti`   | `Trade`     | What happened to a trade |
| `tl`   | `TradeList` | A player's trade list    |

## Jam-a-Gram

### Incoming

| Header | Packet            | What the handler does                   |
| ------ | ----------------- | --------------------------------------- |
| `eb`   | `JamagramBuddy`   | Answers a buddy request card            |
| `ec`   | `JamagramClear`   | Clears the inbox cache                  |
| `ed`   | `JamagramDelete`  | Deletes a Jam-a-Gram                    |
| `eg`   | `JamagramGift`    | Accepts or returns a Jam-a-Gram's gift  |
| `ei`   | `JamagramPrivacy` | Changes the player's Jam-a-Gram privacy |
| `el`   | `JamagramList`    | Sends the player's Jam-a-Grams          |
| `er`   | `JamagramRead`    | Opens a Jam-a-Gram                      |
| `es`   | `JamagramSend`    | Sends a Jam-a-Gram                      |

### Outgoing

| Header | Packet            | What it says                       |
| ------ | ----------------- | ---------------------------------- |
| `eb`   | `JamagramBuddy`   | The answer to a buddy request card |
| `ed`   | `JamagramDelete`  | The Jam-a-Grams deleted            |
| `eg`   | `JamagramGift`    | Whether a gift was kept            |
| `ei`   | `JamagramPrivacy` | Whether the privacy changed        |
| `el`   | `JamagramList`    | The Jam-a-Grams                    |
| `ep`   | `JamagramPush`    | A Jam-a-Gram arrived               |
| `er`   | `JamagramRead`    | Whether a Jam-a-Gram was opened    |
| `es`   | `JamagramSend`    | Whether a Jam-a-Gram was sent      |
| `eu`   | `JamagramUpdate`  | A Jam-a-Gram's message changed     |

## Wall

### Incoming

| Header | Packet            | What the handler does               |
| ------ | ----------------- | ----------------------------------- |
| `wci`  | `WallVisit`       | Counts a visit to someone's wall    |
| `wps`  | `WallParameters`  | Changes how the player's wall looks |
| `wsg`  | `WallSettings`    | Sends a wall's access               |
| `wss`  | `WallSettingsSet` | Sets the player's wall access       |
| `wt`   | `WallToken`       | Gives a token for someone's wall    |

### Outgoing

| Header | Packet            | What it says                      |
| ------ | ----------------- | --------------------------------- |
| `wci`  | `WallVisit`       | Whether a visit was counted       |
| `wps`  | `WallParameters`  | Whether the wall's look was kept  |
| `wsg`  | `WallSettings`    | Who may open a wall               |
| `wss`  | `WallSettingsSet` | Whether the wall setting was kept |
| `wt`   | `WallToken`       | A wall's token                    |

## Like

### Incoming

| Header | Packet  | What the handler does         |
| ------ | ------- | ----------------------------- |
| `crg`  | `Likes` | Sends a like count            |
| `crp`  | `Like`  | Likes a wall or a masterpiece |

### Outgoing

| Header | Packet  | What it says             |
| ------ | ------- | ------------------------ |
| `crg`  | `Likes` | How many like something  |
| `crp`  | `Like`  | Whether a like was taken |

## Masterpiece

### Incoming

| Header | Packet               | What the handler does                  |
| ------ | -------------------- | -------------------------------------- |
| `dmc`  | `MasterpieceCreator` | Names who painted a masterpiece        |
| `dmi`  | `DenMasterpieces`    | Lists the masterpieces placed in a den |

### Outgoing

| Header | Packet               | What it says              |
| ------ | -------------------- | ------------------------- |
| `dmc`  | `MasterpieceCreator` | Who painted a masterpiece |
| `dmi`  | `DenMasterpieces`    | The masterpieces in a den |

## Party

### Incoming

| Header | Packet            | What the handler does                |
| ------ | ----------------- | ------------------------------------ |
| `scp`  | `PartyHost`       | Hosts parties                        |
| `sj`   | `PartyJoin`       | Goes to a party                      |
| `sjp`  | `HostedPartyJoin` | Goes to a party a player hosts       |
| `sl`   | `PartyList`       | Lists the parties on and coming      |
| `slp`  | `HostedPartyList` | Lists the parties players host here  |
| `sm`   | `Masterpieces`    | Sends the party board's masterpieces |
| `sphp` | `HostingTime`     | Sends a host's time left             |
| `spn`  | `HostedPartyNode` | Sends a hosted party's server        |

### Outgoing

| Header | Packet              | What it says                        |
| ------ | ------------------- | ----------------------------------- |
| `scp`  | `PartyHost`         | Whether a party was hosted          |
| `sj`   | `PartyJoin`         | Why a party was refused             |
| `sjp`  | `HostedPartyJoin`   | Whether a hosted party was joined   |
| `sl`   | `PartyList`         | The parties on and coming           |
| `slp`  | `HostedPartyList`   | The parties players host            |
| `sm`   | `Masterpieces`      | The masterpieces                    |
| `sphp` | `HostingTime`       | How long a player has left hosting  |
| `spn`  | `HostedPartyNode`   | A hosted party's server             |
| `spk`  | `HostedPartyKilled` | The player's hosted party was ended |

## Pet

### Incoming

| Header | Packet           | What the handler does                |
| ------ | ---------------- | ------------------------------------ |
| `pad`  | `AdoptAPets`     | Lists a player's adopt a pet cards   |
| `padc` | `AdoptAPetCount` | Counts a player's adopt a pet cards  |
| `pads` | `AdoptAPetsSeen` | Marks adopt a pet cards seen         |
| `pb`   | `PetBuy`         | Adopts a diamond pet                 |
| `pc`   | `PetCreate`      | Adopts a pet from the pet creator    |
| `pd`   | `PetRelease`     | Frees a pet                          |
| `pi`   | `PetSalon`       | Changes the pet out in the salon     |
| `pl`   | `PetList`        | Lists a player's pets                |
| `pm`   | `PetMastery`     | Shows or hides a pet's mastery badge |
| `pn`   | `PetName`        | Names a hatched egg                  |
| `ps`   | `PetSwitch`      | Chooses the player's pet             |

### Outgoing

| Header | Packet           | What it says                            |
| ------ | ---------------- | --------------------------------------- |
| `pad`  | `AdoptAPets`     | A player's adopt a pet cards            |
| `padc` | `AdoptAPetCount` | How many adopt a pet cards a player has |
| `pc`   | `PetCreate`      | Whether a pet was adopted               |
| `pd`   | `PetRelease`     | Whether a pet was freed                 |
| `pi`   | `PetSalon`       | The restyled pet                        |
| `pl`   | `PetList`        | A player's pets                         |
| `pm`   | `PetMastery`     | The rebadged pet                        |
| `pn`   | `PetName`        | A pet was named                         |
| `ps`   | `PetSwitch`      | A player's pet                          |
| `pu`   | `PetsUnlocked`   | The player's unlocked pets              |

## Minigame

### Incoming

| Header | Packet                | What the handler does                         |
| ------ | --------------------- | --------------------------------------------- |
| `ma`   | `MinigameMastery`     | Gives a pet mastery points for a minigame     |
| `mcp`  | `MinigameCustomPvp`   | Joins a two player game a player hosts        |
| `mg`   | `MinigameGems`        | Gives minigame gems                           |
| `mi`   | `MinigameInfo`        | Describes minigames                           |
| `mj`   | `MinigameJoin`        | Starts a minigame                             |
| `ml`   | `MinigameLeave`       | Leaves a minigame                             |
| `mlb`  | `MinigameLeaderboard` | Sends a minigame's leaderboards               |
| `mm`   | `MinigameMessage`     | Answers a minigame's own messages             |
| `mp`   | `MinigamePvp`         | Asks, accepts or turns down a two player game |
| `ms`   | `MinigameStart`       | Starts a waiting minigame now                 |
| `msv`  | `MinigameScore`       | Keeps a minigame score                        |

### Outgoing

| Header | Packet                | What it says                               |
| ------ | --------------------- | ------------------------------------------ |
| `ma`   | `MinigameMastery`     | The next mastery award serial              |
| `mg`   | `MinigameGems`        | The next gem award serial                  |
| `mi`   | `MinigameInfo`        | Minigames                                  |
| `mj`   | `MinigameJoin`        | Who is playing                             |
| `ml`   | `MinigameLeft`        | A player left a minigame                   |
| `mlb`  | `MinigameLeaderboard` | A minigame's leaderboards                  |
| `mm`   | `MinigameMessage`     | A message to a minigame                    |
| `mp`   | `MinigamePvp`         | A two player game asked for or turned down |
| `mr`   | `MinigameEmpty`       | A minigame's room is empty                 |
| `ms`   | `MinigameStart`       | A minigame starts                          |

## Adventure

### Incoming

| Header       | Packet              | What the handler does               |
| ------------ | ------------------- | ----------------------------------- |
| `qj`         | `QuestJoin`         | Joins or opens a public adventure   |
| `qjc`        | `QuestCreate`       | Opens a private adventure           |
| `qjp`        | `QuestJoinPrivate`  | Joins a private adventure           |
| `qjf`        | `QuestJoinBuddy`    | Joins a buddy's adventure           |
| `qjx`        | `QuestCancel`       | Leaves an adventure lobby           |
| `qjk`        | `QuestKick`         | Kicks a player from a private lobby |
| `qs`         | `QuestStart`        | Starts an adventure                 |
| `qx`         | `QuestExit`         | Leaves an adventure                 |
| `qat`        | `QuestTrigger`      | Sets off an actor                   |
| `qatt`       | `QuestTreasure`     | Keeps or turns down a treasure      |
| `qpup`       | `QuestPickUp`       | Picks up an item                    |
| `qpgift`     | `QuestGift`         | Picks a gift                        |
| `qpgiftplr`  | `QuestPlayerGift`   | Picks a gift of their own           |
| `qpgiftdone` | `QuestGiftsDone`    | Finishes picking gifts              |
| `qau`        | `QuestPosition`     | Says where an actor is              |
| `qas`        | `QuestSeek`         | Asks an actor to seek               |
| `qaut`       | `QuestUntrigger`    | Not handled yet                     |
| `qaa`        | `QuestHit`          | Says something was hit              |
| `qap`        | `QuestAttack`       | Says a phantom attacks a player     |
| `qbzap`      | `QuestBeamZap`      | Says a beam caught the player       |
| `qpzap`      | `QuestPhantomZap`   | Says a phantom caught the player    |
| `qpad`       | `QuestDestructible` | Says a phantom hit a destructible   |
| `qph`        | `QuestHeal`         | Says a heal landed                  |
| `qp`         | `QuestThrow`        | Throws a weapon                     |
| `qm`         | `QuestSwipe`        | Swings a weapon                     |
| `qprr`       | `QuestRespawn`      | Asks to come back                   |
| `qaskr`      | `QuestAnswer`       | Not handled yet                     |
| `qmgc`       | `QuestMinigame`     | Not handled yet                     |
| `qfrmgdone`  | `QuestRoomGame`     | Not handled yet                     |
| `qcq`        | `QuestClone`        | Not handled yet                     |
| `qmi`        | `QuestMovedItems`   | Asks where items were moved         |
| `qdroppup`   | `QuestDrop`         | Drops an item                       |
| `qps`        | `QuestPlant`        | Plants a seed                       |
| `qep`        | `QuestEat`          | Says a plant bit a phantom          |
| `qpa`        | `QuestPlantAte`     | Says a plant started eating         |
| `qssau`      | `QuestScroll`       | Moves in a side scrolling adventure |
| `qplayswf`   | `QuestFilm`         | Not handled yet                     |

### Outgoing

| Header        | Packet              | What it says                                 |
| ------------- | ------------------- | -------------------------------------------- |
| `qj`          | `QuestJoin`         | Whether a public adventure was joined        |
| `qjc`         | `QuestCreate`       | Whether a private adventure was opened       |
| `qjp`         | `QuestJoinPrivate`  | Whether a private adventure was joined       |
| `qw`          | `QuestWaiting`      | Who waits in a lobby                         |
| `qjx`         | `QuestCancel`       | A lobby was left                             |
| `qs`          | `QuestStart`        | An adventure starts                          |
| `qx`          | `QuestExit`         | An adventure was left                        |
| `qxt`         | `QuestExitType`     | Sends a player out of an adventure           |
| `qplq`        | `QuestPlayerLeft`   | A player left an adventure                   |
| `qrc`         | `QuestRoomChange`   | A player went to another adventure room      |
| `qqm`         | `QuestBundle`       | Several adventure messages                   |
| `quxp`        | `QuestXp`           | Adventure experience earned                  |
| `qulu`        | `QuestLevel`        | A player levelled up                         |
| `qaward`      | `QuestAward`        | An adventure award                           |
| `qatt`        | `QuestTreasure`     | A treasure's prize                           |
| `qpgift`      | `QuestGifts`        | An adventure's gifts                         |
| `qpgiftplr`   | `QuestPlayerGifts`  | A player's own gifts                         |
| `qporbs`      | `QuestCrystals`     | The crystals gathered                        |
| `qusu`        | `QuestStats`        | The player's attack and defence              |
| `qseed`       | `QuestSeed`         | A seed count                                 |
| `qspn`        | `QuestSpawn`        | An actor appears                             |
| `qau`         | `QuestPosition`     | An actor moved                               |
| `qas`         | `QuestSeek`         | An actor seeks                               |
| `qahs`        | `QuestActorHealth`  | An actor was hit                             |
| `qad`         | `QuestDeath`        | An actor was defeated                        |
| `qrestore`    | `QuestRestore`      | An actor came back                           |
| `qswfs`       | `QuestSwfState`     | An actor's animation changes                 |
| `qsp`         | `QuestPath`         | An actor walks another path                  |
| `qicon`       | `QuestIcon`         | An actor's icon shows or hides               |
| `qmi`         | `QuestMovedItems`   | Where items were moved                       |
| `qpup`        | `QuestPickUp`       | What a pick up came to                       |
| `qgi`         | `QuestGiveItem`     | Hands a player an item                       |
| `qavsw`       | `QuestAvatarSwitch` | A player is disguised                        |
| `qviu`        | `QuestVolume`       | A volume's progress                          |
| `qtorch`      | `QuestTorch`        | A torch is lit or put out                    |
| `qap`         | `QuestAttack`       | An actor attacks a player                    |
| `qbzap`       | `QuestBeamZap`      | A beam zaps                                  |
| `qpzap`       | `QuestPhantomZap`   | A phantom zaps a player                      |
| `qpd`         | `QuestDead`         | A player was defeated                        |
| `qprr`        | `QuestRespawn`      | A player may come back                       |
| `quhp`        | `QuestHealth`       | A player's health                            |
| `qrspn`       | `QuestRespawned`    | A player came back                           |
| `qp`          | `QuestThrow`        | A weapon was thrown                          |
| `qm`          | `QuestSwipe`        | A weapon was swung                           |
| `qps`         | `QuestPlant`        | A seed was planted                           |
| `qpa`         | `QuestPlantAte`     | A plant ate a phantom                        |
| `qepr`        | `QuestRecoil`       | A plant recoils                              |
| `qssau`       | `QuestScroll`       | A player moved in a side scrolling adventure |
| `qplayswf`    | `QuestFilm`         | Plays a film                                 |
| `qpreloadswf` | `QuestPreload`      | Loads a film                                 |
| `qfade`       | `QuestFade`         | Fades the screen                             |
| `qshake`      | `QuestShake`        | Shakes the room                              |
| `qsnd`        | `QuestSound`        | Plays a sound                                |
| `qsndVO`      | `QuestVoiceOver`    | Plays a voice over                           |
| `qmusic`      | `QuestMusic`        | Changes the music                            |
| `qmlib`       | `QuestMediaLibrary` | Loads a sound pack                           |
| `qsndpk`      | `QuestSoundPack`    | Loads a sound pack                           |
| `qposturi`    | `QuestPostUri`      | Records a page view                          |

These are built but nothing sends them yet, because they need an adventure script to say when: `qaward`, `qqm`, `qspn`, `qrestore`, `qswfs`, `qsp`, `qicon`, `qgi`, `qavsw`, `qviu`, `qtorch`, `qusu`, `qseed`, `qepr`, `qrc`, `qplayswf`, `qpreloadswf`, `qfade`, `qshake`, `qsnd`, `qsndVO`, `qsndpk`, `qposturi`.

## Referral

### Incoming

| Header | Packet               | What the handler does                  |
| ------ | -------------------- | -------------------------------------- |
| `refc` | `ReferralCode`       | Asks for the referral code             |
| `refh` | `ReferralAssociated` | Asks whether the player has a referrer |
| `refa` | `ReferralAssociate`  | Names the player's referrer            |
| `refr` | `ReferralList`       | Asks for the player's referrals        |

### Outgoing

| Header | Packet               | What it says                      |
| ------ | -------------------- | --------------------------------- |
| `refc` | `ReferralCode`       | The referral code                 |
| `refh` | `ReferralAssociated` | Whether the player has a referrer |
| `refa` | `ReferralAssociate`  | Whether the referrer was kept     |
| `refr` | `ReferralList`       | The player's referrals            |

## World

### Incoming

| Header | Packet          | What the handler does     |
| ------ | --------------- | ------------------------- |
| `nd`   | `NodeHop`       | Asks for another node     |
| `wig`  | `WorldItemGift` | Takes a world item's gift |

### Outgoing

| Header | Packet          | What it says                          |
| ------ | --------------- | ------------------------------------- |
| `nd`   | `NodeHop`       | The node to move to                   |
| `wig`  | `WorldItemGift` | Whether a world item's gift was given |

## Moderation

### Incoming

| Header | Packet           | What the handler does          |
| ------ | ---------------- | ------------------------------ |
| `fb`   | `Ban`            | Bans a player                  |
| `fi`   | `Invisible`      | Hides or shows a moderator     |
| `fk`   | `Kick`           | Kicks a player                 |
| `fm`   | `Mute`           | Mutes a player                 |
| `fr`   | `Report`         | Reports a player               |
| `fra`  | `ReportEvidence` | Reports a player with evidence |
| `fs`   | `Silence`        | Silences a player              |
| `ft`   | `IdleTimeout`    | Disconnects an idle player     |

### Outgoing

| Header | Packet             | What it says                             |
| ------ | ------------------ | ---------------------------------------- |
| `fb`   | `Ban`              | Whether a ban worked                     |
| `fd`   | `ModerationNotice` | A staff action notice                    |
| `fi`   | `Invisible`        | A moderator's unseen state               |
| `fk`   | `Kick`             | Whether a kick worked                    |
| `fm`   | `Mute`             | Whether a mute worked                    |
| `fr`   | `Report`           | Whether a report was taken               |
| `fra`  | `ReportEvidence`   | Whether a report with evidence was taken |
| `fs`   | `Silence`          | Whether a silence worked                 |

## Achievement

### Incoming

| Header | Packet         | What the handler does         |
| ------ | -------------- | ----------------------------- |
| `za`   | `Achievements` | Lists a player's achievements |

### Outgoing

| Header | Packet         | What it says            |
| ------ | -------------- | ----------------------- |
| `za`   | `Achievements` | A player's achievements |

## Newspaper

### Incoming

| Header | Packet          | What the handler does       |
| ------ | --------------- | --------------------------- |
| `nps`  | `NewspaperSeen` | Marks a newspaper page seen |

### Outgoing

| Header | Packet          | What it says              |
| ------ | --------------- | ------------------------- |
| `nps`  | `NewspaperSeen` | A newspaper page was seen |

## Content

### Incoming

| Header | Packet        | What the handler does |
| ------ | ------------- | --------------------- |
| `gl`   | `GenericList` | Sends a generic list  |

### Outgoing

| Header | Packet        | What it says   |
| ------ | ------------- | -------------- |
| `gl`   | `GenericList` | A generic list |
