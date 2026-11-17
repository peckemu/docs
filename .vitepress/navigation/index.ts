import { type DefaultTheme } from 'vitepress'

/**
 * The links along the top
 */
export const NAV: DefaultTheme.NavItem[] = [
  { text: 'Guide', link: '/guide/introduction' },
  { text: 'Console', link: '/guide/console' },
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
      { text: 'Content', link: '/guide/content' },
      { text: 'Configuration', link: '/guide/configuration' },
    ],
  },
  {
    text: 'Running it',
    items: [{ text: 'Console', link: '/guide/console' }],
  },
]
