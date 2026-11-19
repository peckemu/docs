# Commands

A plugin's commands show up in `bun peck help` next to Peck's own. They run in the console rather than the emulator. They can't see who's online, but they can use the database and Redis.

## Writing one

A command extends `Command` and has a `name`, a `description` and a `run` method.

```ts twoslash
import { Command, Plugin } from '@peck/plugins'
// ---cut---
/**
 * Says hello
 * @class
 */
export class HelloCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'hello'

  /**
   * The command description
   */
  public readonly description = 'Says hello'

  /**
   * Says it
   */
  public run(): Promise<void> {
    console.log('Hello')

    return Promise.resolve()
  }
}

export default class HelloPlugin extends Plugin {
  public readonly name = 'hello'

  public readonly version = '1.0.0'

  public override readonly commands = [new HelloCommand()]
}
```

```sh
bun peck hello
```

Name them `<plugin>:<what it does>`, like `visits:top`. That keeps them clear of Peck's.

## Options

`options` lists the flags the command takes. `run` gets their values.

```ts twoslash
import { Command, type Options } from '@peck/plugins'
// ---cut---
export class GiveCommand extends Command {
  public readonly name = 'gems:give'

  public readonly description = 'Gives a player gems'

  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    player: { description: 'Their username' },
    amount: { description: 'How many gems', fallback: '100' },
    quiet: { description: 'Prints nothing', flag: true },
  }

  public async run(options: Options): Promise<void> {
    const player = String(options['player'])
    const amount = Number(options['amount'])

    if (options['quiet'] !== true) console.log(`Giving ${player} ${amount}`)
  }
}
```

```sh
bun peck gems:give --player sxip --amount 500
```

| Field         | What it does                                         |
| ------------- | ---------------------------------------------------- |
| `description` | Shown in `--help`, and as the question if it's asked |
| `env`         | An env variable to use if the flag isn't given       |
| `fallback`    | The value if neither is set                          |
| `flag`        | Makes it an on or off switch with no value           |
| `optional`    | Doesn't ask for it if it's missing                   |

If an option isn't given, has no `env` or `fallback` and isn't `optional`, the console asks for it. With no terminal to ask in, the command fails.

Values come through as strings, or `true` for a flag. Convert them yourself.

## Using the database

A command opens its own connection with `createDatabase` and should close it when it's done. [Your first plugin](./first-plugin#_5-a-command) has an example.
