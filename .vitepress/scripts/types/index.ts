import { exists, mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

/**
 * The docs folder
 */
const DOCS = join(import.meta.dir, '../../..')

/**
 * Where the types go
 */
const OUTPUT = join(DOCS, '.vitepress/types')

/**
 * The folders with types to copy
 */
const SOURCES = ['packages', 'apps/emulator']

/**
 * The Peck repository
 */
const REPOSITORY = 'https://github.com/peckemu/peck'

/**
 * Where Peck is cloned
 */
const CLONE = join(DOCS, '.vitepress/cache/peck')

/**
 * A project reference
 */
type Reference = {
  /**
   * The project folder
   */
  readonly path: string
}

/**
 * A package's manifest
 */
type Manifest = {
  /**
   * The package name
   */
  readonly name: string

  /**
   * The subpath imports
   */
  readonly imports?: Readonly<Record<string, string>>
}

/**
 * Copies Peck's types into the docs
 * @class
 */
export class TypeSync {
  /**
   * The Peck folder
   */
  private readonly root: string

  /**
   * The module paths
   */
  private readonly paths: Record<string, string[]> = {}

  /**
   * Creates the sync
   * @param root The Peck folder
   */
  public constructor(root: string) {
    this.root = root
  }

  /**
   * Finds Peck, or clones it
   * @returns The Peck folder
   */
  public static async locate(): Promise<string> {
    const local = process.env['PECK_DIR'] ?? join(DOCS, '../peck')
    if (await exists(join(local, 'package.json'))) return local

    await rm(CLONE, { recursive: true, force: true })
    await Bun.$`git clone --quiet --depth 1 ${REPOSITORY} ${CLONE}`.quiet()
    await Bun.$`bun install --frozen-lockfile --ignore-scripts`
      .cwd(CLONE)
      .quiet()

    return CLONE
  }

  /**
   * Builds and copies every package
   */
  public async run(): Promise<void> {
    await this.build()
    await rm(OUTPUT, { recursive: true, force: true })

    for (const folder of await this.folders()) await this.copy(folder)

    await Bun.write(
      join(OUTPUT, 'paths.json'),
      `${JSON.stringify(this.sorted(), null, 2)}\n`,
    )
    console.log(`Copied ${Object.keys(this.paths).length} modules`)
  }

  /**
   * Builds Peck's types
   */
  private async build(): Promise<void> {
    const config = (await Bun.file(
      join(this.root, 'tsconfig.json'),
    ).json()) as {
      /**
       * The projects
       */
      readonly references: readonly Reference[]
    }
    const projects = config.references
      .map((reference) => reference.path)
      .filter((path) => SOURCES.some((source) => path.startsWith(source)))

    await Bun.$`bun --bun tsc -b ${projects}`.cwd(this.root).quiet()
  }

  /**
   * Sorts the module paths
   * @returns The paths
   */
  private sorted(): Record<string, string[]> {
    return Object.fromEntries(
      Object.entries(this.paths).sort(([a], [b]) => a.localeCompare(b)),
    )
  }

  /**
   * Finds a package's built types
   * @param folder The package folder
   * @returns The types folder, or null
   */
  private async dist(folder: string): Promise<string | null> {
    for (const path of ['dist', 'dist/src']) {
      if (await Bun.file(join(folder, path, 'index.d.ts')).exists()) {
        return join(folder, path)
      }
    }

    return null
  }

  /**
   * Lists the package folders
   * @returns The folders
   */
  private async folders(): Promise<string[]> {
    const folders: string[] = []

    for (const source of SOURCES) {
      const path = join(this.root, source)
      if (await Bun.file(join(path, 'package.json')).exists()) {
        folders.push(path)
        continue
      }

      for (const name of await readdir(path)) folders.push(join(path, name))
    }

    return folders
  }

  /**
   * Copies one package
   * @param folder The package folder
   */
  private async copy(folder: string): Promise<void> {
    const dist = await this.dist(folder)
    if (!dist) return

    const manifest = (await Bun.file(
      join(folder, 'package.json'),
    ).json()) as Manifest
    const name = manifest.name.replace('@peck/', '')
    const target = join(OUTPUT, name)

    for await (const file of new Bun.Glob('**/*.d.ts').scan(dist)) {
      const source = join(folder, 'src', file.replace(/\.d\.ts$/, '.ts'))
      if (!(await Bun.file(source).exists())) continue

      await mkdir(dirname(join(target, file)), { recursive: true })
      await Bun.write(join(target, file), Bun.file(join(dist, file)))
    }

    const base = relative(DOCS, target)
    this.paths[manifest.name] = [`./${base}/index.d.ts`]
    for (const alias of Object.keys(manifest.imports ?? {})) {
      this.paths[alias] = [`./${base}/*/index.d.ts`]
    }
  }
}

await new TypeSync(await TypeSync.locate()).run()
