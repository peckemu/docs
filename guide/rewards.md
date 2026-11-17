# Rewards

Gift codes, eco gifts and referral treasures don't come with the content. You set them up with the [console](/reference/console).

## Gift codes

Players type a code into the game and get what it gives.

```sh
bun peck code:create --code WELCOME --gems 500 --uses 100 --expires 2027-01-01
```

A code can give gems, diamonds, membership days, clothing and den items. Case doesn't matter.

Each account can only use a code once. `--uses` caps how many accounts can use it, `--expires` turns it off after a date and `--verified` needs a confirmed email.

`bun peck code:list` shows every code and how many times it's been used.

What the player sees:

| Result             | When                                                         |
| ------------------ | ------------------------------------------------------------ |
| The rewards        | The code worked                                              |
| Code not valid     | It doesn't exist, has expired, is used up or they've used it |
| Confirm your email | It needs a confirmed email and the account doesn't have one  |

Rewards go straight into the inventory. There's no Jam-a-Gram with them like the real game had.

Membership days make every player on the account a member. Peck doesn't track an end date yet, so it never runs out.

## Eco gifts

Eco gifts are earned by raising a den's eco score. Each one has a bit from `0` to `30`, and they come in that order.

```sh
bun peck eco:gift --bit 0 --score 100 --item 4541
```

`--score` is the score needed and `--item` is the den item it gives. `--color`, `--name` and `--desc` are optional. Running it again with the same bit changes that gift.

Claiming one asks the player to keep it or throw it away. Keeping it puts the den item in their den. If they close it without picking, it comes back next time they log in.

If you don't add any, there's nothing to claim.

## Referrals

New players have three days to say who referred them. The refer a friend popup shows a player's code, which is their account id, and everyone they've referred.

The popup has four treasures. You pick how many referrals each one takes and which gift code it pays out.

```sh
bun peck code:create --code REFER1 --gems 1000 --uses 1
bun peck referral:level --level 1 --referrals 1 --code REFER1
```

Treasures don't count as a use of the code, so keep treasure codes to yourself.

If the referrer's online on the same node they get the treasure straight away. If not, they get it next time they log in.

If you don't set any up, the treasures never open.
