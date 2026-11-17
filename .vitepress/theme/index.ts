import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Layout from '#theme/components/layout/index.vue'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/pixelify-sans/600.css'
import '#theme/styles/index.css'

/**
 * The docs theme
 */
const theme: Theme = {
  extends: DefaultTheme,
  Layout,
}

export default theme
