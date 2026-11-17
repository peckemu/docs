import { defineConfig } from 'vitepress'

import { NAV, SIDEBAR } from './navigation/index.ts'

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
