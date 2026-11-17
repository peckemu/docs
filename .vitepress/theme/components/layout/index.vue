<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme'

import Home from '#theme/components/home/index.vue'

/**
 * The default layout
 */
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-before>
      <Home />
    </template>
  </Layout>
</template>
