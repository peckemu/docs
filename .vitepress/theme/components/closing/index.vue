<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import Install from '#theme/components/install/index.vue'
import { RetroBackground } from '#theme/scene'

/**
 * The commands to copy
 */
const COMMANDS = [
  { label: 'Clone', command: 'git clone https://github.com/peckemu/peck' },
  { label: 'Run', command: 'bun install && bun run dev' },
] as const

/**
 * The element the background fills
 */
const scene = ref<HTMLDivElement | null>(null)

/**
 * The background, or null
 */
let background: RetroBackground | null = null

onMounted(() => {
  if (!scene.value) return

  background = new RetroBackground(scene.value, {
    /**
     * A different layout to the hero
     */
    seed: 23,
    /**
     * The art pixels tall
     */
    rows: 150,
  })
  background.mount()
})

onBeforeUnmount(() => {
  background?.destroy()
})
</script>

<template>
  <section class="closing">
    <div ref="scene" class="scene" aria-hidden="true" />

    <div class="inner">
      <p class="label">Open source</p>
      <h2 class="title">Have a look around</h2>
      <p class="text">It's all on GitHub. Pull requests are welcome.</p>
      <Install :commands="COMMANDS" />
    </div>
  </section>
</template>

<style scoped>
.closing {
  position: relative;
  min-height: 780px;
  overflow: hidden;
}

.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.scene::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    var(--vp-c-bg) 0%,
    rgb(7 10 10 / 0.75) 30%,
    transparent 60%,
    transparent 85%,
    var(--vp-c-bg) 100%
  );
  content: '';
}

.inner {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 18px;
  max-width: 1248px;
  margin: 0 auto;
  padding: 180px 24px 320px;
  text-align: center;
}

.label {
  margin: 0;
  color: var(--peck-bloom);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  color: var(--peck-text);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 600;
  letter-spacing: -0.035em;
}

.text {
  max-width: 420px;
  margin: 0 0 12px;
  color: #c9d1cc;
  font-size: 16px;
  line-height: 1.55;
}
</style>
