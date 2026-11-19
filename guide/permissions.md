# Permissions

Every account has at most one role. A role has a rank and a set of permissions. An account can also have overrides that grant or revoke single permissions on top of its role.

The keys and built-in roles live in `packages/permissions`. The database keeps a copy so roles can be changed without a deploy.

## Permissions

From `packages/permissions/src/permissions/index.ts`.

| Key                   | Group    | What it allows                                         |
| --------------------- | -------- | ------------------------------------------------------ |
| `accounts.read`       | Accounts | See accounts and their players                         |
| `accounts.manage`     | Accounts | Change accounts and sign them out                      |
| `accounts.grant`      | Accounts | Grant or revoke single permissions for an account      |
| `roles.read`          | Roles    | See roles and who holds them                           |
| `roles.manage`        | Roles    | Create, change, delete and assign roles below your own |
| `audit.read`          | Audit    | See every change staff have made                       |
| `players.moderate`    | Players  | Mute, kick and ban players                             |
| `masterpieces.review` | Players  | Approve or reject masterpieces from the art studio     |
| `server.manage`       | Server   | Change how the server runs                             |

No API route checks `accounts.read` or `accounts.manage` yet.

## Roles

From `packages/permissions/src/roles/index.ts`.

| Key         | Name           | Rank | Permissions                                                                                                                                 |
| ----------- | -------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `owner`     | Peck Owner     | 100  | All of them                                                                                                                                 |
| `admin`     | Peck Admin     | 80   | `accounts.read`, `accounts.manage`, `accounts.grant`, `roles.read`, `roles.manage`, `audit.read`, `players.moderate`, `masterpieces.review` |
| `moderator` | Peck Moderator | 40   | `accounts.read`, `players.moderate`, `masterpieces.review`                                                                                  |
| `support`   | Peck Support   | 20   | `accounts.read`                                                                                                                             |

`server.manage` is only on the owner role.

These four are built in. Built-in roles can't be changed or deleted through the API. Seeding writes them again from the code each time. Any change made in the database won't last.

## Tables

| Table                  | What it holds                                              |
| ---------------------- | ---------------------------------------------------------- |
| `permissions`          | Every permission key, its group, label and order           |
| `roles`                | Built-in and custom roles with their name, colour and rank |
| `role_permissions`     | Which permissions each role has                            |
| `account_roles`        | Each account's one role                                    |
| `permission_overrides` | Grants and revokes for single accounts                     |
| `audit_log`            | Every change staff made                                    |

The database checks a few things itself. A rank is 1 to 100, and only a built-in role can have rank 100. A colour is `#rrggbb`. A role's name is 1 to 40 characters.

## Seeding

```sh
bun run db:seed
```

The `permissions` and `roles` seeds run in production too. The `accounts` seed doesn't. It makes this account.

::: code-group

```ts [packages/database/src/seeds/accounts/index.ts]
{
  username: 'sxip',
  password: 'peck123',
  role: 'owner',
  players: [{ username: 'sxip', accountType: AccountType.Internal }],
},
```

:::

Seeding again keeps the password but gives the account the owner role again.

## What an account can do

`effectivePermissions` in `packages/permissions/src/rules/index.ts` works it out.

1. No role means no permissions, whatever the overrides say.
2. Start with the role's permissions.
3. Add each `grant` override and remove each `revoke` override.

The owner role skips step 3. Overrides never change what an owner can do.

## Rank rules

| Action                  | Rule                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Create a role           | Needs `roles.manage`. Rank 1 to 99 and below your own                                         |
| Give a role permissions | You can only give permissions you have                                                        |
| Change or delete a role | Needs `roles.manage`. The role must be custom and below your rank                             |
| Delete a role           | Nobody can hold it                                                                            |
| Assign or remove a role | Needs `roles.manage`. The account's current role and the new one must both be below your rank |
| Set an override         | Needs `accounts.grant` and the permission itself. The account's rank must be below yours      |
| Change your own access  | Never allowed                                                                                 |

Nothing outranks 100. That means the owner role can't be given out through the API.

## API

Every route sends the session token from `POST /auth/sessions` as `Authorization: Bearer <token>`.

| Route                                               | Needs            |
| --------------------------------------------------- | ---------------- |
| `GET /access/me`                                    | Signed in        |
| `GET /access/permissions`                           | `roles.read`     |
| `GET /access/roles`                                 | `roles.read`     |
| `POST /access/roles`                                | `roles.manage`   |
| `PUT /access/roles/:id`                             | `roles.manage`   |
| `DELETE /access/roles/:id`                          | `roles.manage`   |
| `PUT /access/accounts/:id/role`                     | `roles.manage`   |
| `PUT /access/accounts/:id/overrides/:permission`    | `accounts.grant` |
| `DELETE /access/accounts/:id/overrides/:permission` | `accounts.grant` |
| `GET /access/audit`                                 | `audit.read`     |

`GET /access/me` returns the account's role, rank, permissions and whether it's the owner.

A role body looks like this. `description` and `permissions` are optional.

```json
{
  "name": "Helper",
  "description": "Answers questions",
  "color": "#3c8cf0",
  "rank": 10,
  "permissions": ["accounts.read"]
}
```

`PUT /access/accounts/:id/role` takes `{"roleId": "<uuid>"}`, or `{"roleId": null}` to take the role away. An override takes `{"effect": "grant"}` or `{"effect": "revoke"}`. `DELETE` removes it.

`GET /access/audit` pages with `limit` (1 to 100, default 50) and `offset`. The newest entries come first.

## Using it in routes

`withPermission` in `apps/api/src/middleware/permission/index.ts` goes after `withAuth`. It answers `403` with `You don't have permission` if any key is missing.

::: code-group

```ts [apps/api/src/modules/servers/routes/index.ts]
.put(
  '/:id/drain',
  withAuth,
  withPermission('server.manage'),
  validate('param', serverIdSchema),
  validate('json', drainSchema),
  async (c) => {
```

:::

It puts the account's access on the context as `access`.

## In the game

The emulator reads the same tables at login. An account with `players.moderate` gets the moderator tools and logs in invisible. See [Moderation](./moderation).

## Audit log

These changes write a row to `audit_log` with who did it, when, and what changed.

| Action                 | When                                |
| ---------------------- | ----------------------------------- |
| `role.created`         | A role is made                      |
| `role.updated`         | A role is changed                   |
| `role.deleted`         | A role is deleted                   |
| `member.role_changed`  | An account's role is set or removed |
| `override.granted`     | A grant override is set             |
| `override.revoked`     | A revoke override is set            |
| `override.removed`     | An override is deleted              |
| `server.drained`       | A node is drained                   |
| `server.reopened`      | A node is opened again              |
| `masterpiece.approved` | A masterpiece is approved           |
| `masterpiece.rejected` | A masterpiece is rejected           |

[Moderation](./moderation#audit-log) lists the rest.
