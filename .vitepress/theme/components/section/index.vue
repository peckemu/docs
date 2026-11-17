<script lang="ts" setup>
import { type DefaultTheme, useData } from 'vitepress'
import { computed } from 'vue'

/**
 * The page and theme data
 */
const data = useData<DefaultTheme.Config>()

/**
 * The sidebar group the page is in, or null
 */
const group = computed<string | null>(() => {
  const path = `/${data.page.value.relativePath.replace(/\.md$/, '')}`
  const sidebar = data.theme.value.sidebar
  const groups = Array.isArray(sidebar) ? sidebar : []

  const found = groups.find((item) =>
    (item.items ?? []).some((child) => child.link === path),
  )
  return found?.text ?? null
})
</script>

<template>
  <p v-if="group" class="section">{{ group }}</p>
</template>

<style scoped>
.section {
  margin: 0 0 14px;
  color: var(--peck-bloom);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
