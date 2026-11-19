# Rewards

Gift codes, eco gifts and referral treasures aren't in the content. You make them yourself with the [console](/reference/console).

## Gift codes

Players type a code into the game and get what it gives.

```sh
bun peck code:create --code WELCOME --gems 500 --uses 100 --expires 2027-01-01
```

A code can give any mix of gems, diamonds, membership days, clothing and den items. Case doesn't matter, so `welcome` works for `WELCOME`.

Each account can use a code once. `--uses` limits how many accounts can use it in all, and `--expires` stops it working after that date. `--verified` makes it need a confirmed email.

`bun peck code:list` lists every code with how many times it's been used.

What the player sees:

| Result             | When                                                         |
| ------------------ | ------------------------------------------------------------ |
| The rewards        | The code worked                                              |
| Code not valid     | It doesn't exist, has expired, is used up or they've used it |
| Confirm your email | It needs a confirmed email and the account doesn't have one  |

Rewards go straight into the inventory with no popup. The real game sent them as a Jam-a-Gram.

Membership days make every player on the account a member. Peck doesn't track an end date, so it never runs out.

## Eco gifts

Players earn eco gifts by raising their den's eco score. Each gift has a bit from `0` to `30`, and they're earned in that order.

```sh
bun peck eco:gift --bit 0 --score 100 --item 4541
```

`--score` is the score needed and `--item` is the den item it gives. `--color`, `--name` and `--desc` are optional. Running it again with the same bit changes that gift.

When a player claims one, the client asks whether to keep it. Keeping it puts the den item in their den. A prize they haven't answered is shown again the next time they log in.

With no eco gifts set up, the eco screen has nothing to give.

## Referrals

A new player can name who referred them in their first three days. Players see their referral code and the players they referred in the refer a friend popup. The code is the account's id.

The popup has four treasures. Each one opens after a number of referrals and gives a gift code's rewards.

```sh
bun peck code:create --code REFER1 --gems 1000 --uses 1
bun peck referral:level --level 1 --referrals 1 --code REFER1
```

Giving a treasure doesn't count as a use of its code. A code with `--uses 1` still works for every player who reaches that treasure. Keep treasure codes to yourself.

A treasure is given as soon as the referral that opens it is saved. If the referrer is online on the same node, they get it straight away. Otherwise they see it next time they log in.

Without any levels set up, the treasures never open.
