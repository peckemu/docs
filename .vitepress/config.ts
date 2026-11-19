import { resolve } from 'node:path'

import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import ts from 'typescript'
import { defineConfig } from 'vitepress'

import { NAV, SIDEBAR } from './navigation/index.ts'
import PATHS from './types/paths.json' with { type: 'json' }

/**
 * The docs folder
 */
const ROOT = resolve(import.meta.dirname, '..')

export default defineConfig({
  /**
   * The site title
   */
  title: 'Peck',
  /**
   * The site description
   */
  description: 'An Animal Jam Classic emulator, written in TypeScript with Bun',
  /**
   * Extra head tags
   */
  head: [['link', { rel: 'icon', type: 'image/png', href: '/woodpecker.png' }]],
  /**
   * The colour scheme
   */
  appearance: 'force-dark',
  /**
   * Whether links drop the .html
   */
  cleanUrls: true,
  /**
   * Whether pages show when they changed
   */
  lastUpdated: true,
  /**
   * The markdown settings
   */
  markdown: {
    /**
     * Adds types to code blocks
     */
    codeTransformers: [
      transformerTwoslash({
        /**
         * The compiler settings
         */
        twoslashOptions: {
          /**
           * The TypeScript options
           */
          compilerOptions: {
            /**
             * The language target
             */
            target: ts.ScriptTarget.ESNext,
            /**
             * The module format
             */
            module: ts.ModuleKind.Preserve,
            /**
             * How modules resolve
             */
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            /**
             * Whether to check strictly
             */
            strict: true,
            /**
             * Whether imports can end in .ts
             */
            allowImportingTsExtensions: true,
            /**
             * Whether to skip output
             */
            noEmit: true,
            /**
             * Whether to skip library checks
             */
            skipLibCheck: true,
            /**
             * The global types
             */
            types: ['bun'],
            /**
             * Where Peck's modules are
             */
            paths: {
              ...Object.fromEntries(
                Object.entries(PATHS).map(([name, paths]) => [
                  name,
                  paths.map((path) => resolve(ROOT, path)),
                ]),
              ),
              '#visits/*': [resolve(ROOT, 'src/*/index.ts')],
            },
          },
        },
      }),
    ],
  },
  /**
   * The theme settings
   */
  themeConfig: {
    /**
     * The title beside the logo
     */
    siteTitle: 'PECK',
    /**
     * The links along the top
     */
    nav: NAV,
    /**
     * The links down the side
     */
    sidebar: SIDEBAR,
    /**
     * The social links
     */
    socialLinks: [{ icon: 'github', link: 'https://github.com/peckemu/peck' }],
    /**
     * The search box
     */
    search: { provider: 'local' },
    /**
     * The footer
     */
    footer: {
      message: 'Not affiliated with WildWorks. Animal Jam is their trademark.',
    },
  },
})
