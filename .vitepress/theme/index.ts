import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Layout from '#theme/components/layout/index.vue'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/pixelify-sans/600.css'
import '@shikijs/vitepress-twoslash/style.css'
import '#theme/styles/index.css'

/**
 * The docs theme
 */
const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  /**
   * Adds the type popups
   * @param context The app context
   */
  enhanceApp(context): void {
    context.app.use(TwoslashFloatingVue)
  },
}

export default theme
