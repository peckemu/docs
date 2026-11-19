import { type DefaultTheme } from 'vitepress'

/**
 * The links along the top
 */
export const NAV: DefaultTheme.NavItem[] = [
  { text: 'Guide', link: '/guide/introduction' },
  { text: 'Plugins', link: '/plugins/introduction' },
  { text: 'Development', link: '/development/layout' },
  { text: 'Reference', link: '/reference/api' },
]

/**
 * The links down the side
 */
export const SIDEBAR: DefaultTheme.Sidebar = [
  {
    text: 'Getting started',
    items: [
      { text: 'Introduction', link: '/guide/introduction' },
      { text: 'How it works', link: '/guide/how-it-works' },
      { text: 'Installation', link: '/guide/installation' },
      { text: 'Configuration', link: '/guide/configuration' },
      { text: 'Content', link: '/guide/content' },
    ],
  },
  {
    text: 'Running a server',
    items: [
      { text: 'Production', link: '/guide/production' },
      { text: 'Clustering', link: '/guide/clustering' },
      { text: 'Permissions', link: '/guide/permissions' },
      { text: 'Moderation', link: '/guide/moderation' },
      { text: 'Adventures', link: '/guide/adventures' },
      { text: 'Rewards', link: '/guide/rewards' },
      { text: 'Console', link: '/guide/console' },
    ],
  },
  {
    text: 'Plugins',
    items: [
      { text: 'Introduction', link: '/plugins/introduction' },
      { text: 'Your first plugin', link: '/plugins/first-plugin' },
      { text: 'Events', link: '/plugins/events' },
      { text: 'Packets and handlers', link: '/plugins/handlers' },
      { text: 'Database', link: '/plugins/database' },
      { text: 'Commands', link: '/plugins/commands' },
    ],
  },
  {
    text: 'Development',
    items: [
      { text: 'Project layout', link: '/development/layout' },
      { text: 'Packets', link: '/development/packets' },
      { text: 'Handlers', link: '/development/handlers' },
      { text: 'Database', link: '/development/database' },
      { text: 'Testing', link: '/development/testing' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'API', link: '/reference/api' },
      { text: 'Console', link: '/reference/console' },
      { text: 'Packets', link: '/reference/packets' },
      { text: 'Environment', link: '/reference/environment' },
    ],
  },
]
