<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import Install from '#theme/components/install/index.vue'
import { RetroBackground } from '#theme/scene'
import { data as stars } from '#theme/stars/index.data'

/**
 * The commands to copy
 */
const COMMANDS = [
  { label: 'Clone', command: 'git clone https://github.com/peckemu/peck' },
  { label: 'Run', command: 'bun install && bun run dev' },
  { label: 'Update', command: 'bun peck update' },
] as const

/**
 * Facts under the install box
 */
const META: readonly string[] = [
  'TypeScript',
  'Bun',
  'PostgreSQL',
  'Redis',
  'AGPL-3.0',
]

/**
 * The star count as shown, or null
 */
const starred: string | null =
  stars === null
    ? null
    : stars >= 1000
      ? `${(stars / 1000).toFixed(1).replace(/\.0$/, '')}k`
      : String(stars)

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

  background = new RetroBackground(scene.value)
  background.mount()
})

onBeforeUnmount(() => {
  background?.destroy()
})
</script>

<template>
  <section class="hero">
    <div ref="scene" class="scene" aria-hidden="true" />

    <div class="inner">
      <div class="copy">
        <a class="badge" href="https://github.com/peckemu/peck">
          <span class="dot" />
          Open source on GitHub
          <span v-if="starred" class="stars">★ {{ starred }}</span>
        </a>
        <h1 class="title">The Animal Jam emulator.</h1>
        <p class="text">
          Open source, written in TypeScript with Bun. Rooms, dens, trading and
          minigames all work. You're still not getting your spikes back.
        </p>
        <Install :commands="COMMANDS" />
        <ul class="meta">
          <li v-for="item in META" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  margin-top: calc(var(--vp-nav-height) * -1);
  overflow: hidden;
}

.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--vp-c-bg);
  transform: scaleX(-1);
}

.scene::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--vp-c-bg) 0%,
    rgb(7 10 10 / 0.35) 22%,
    transparent 45%
  );
  content: '';
}

.inner {
  position: relative;
  display: flex;
  min-height: inherit;
  max-width: 1248px;
  align-items: center;
  margin: 0 auto;
  padding: calc(var(--vp-nav-height) + 48px) 24px 96px;
}

.copy {
  display: grid;
  width: 100%;
  max-width: 600px;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: 20px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid var(--peck-line);
  background: rgb(5 8 8 / 0.6);
  backdrop-filter: blur(6px);
  color: var(--peck-muted);
  font-size: 13px;
  text-decoration: none;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.badge:hover {
  border-color: #3a4642;
  color: var(--peck-text);
}

.stars {
  margin-left: 4px;
  padding-left: 10px;
  border-left: 1px solid var(--peck-line);
  color: var(--peck-text);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--peck-bloom);
}

.title {
  margin: 0;
  color: var(--peck-text);
  font-size: clamp(40px, 5.2vw, 64px);
  font-weight: 600;
  line-height: 1.03;
  letter-spacing: -0.035em;
}

.text {
  max-width: 480px;
  margin: 0 0 8px;
  color: #c9d1cc;
  font-size: 17px;
  line-height: 1.55;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin: 4px 0 0;
  padding: 0;
  color: var(--peck-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  list-style: none;
}

@media (max-width: 760px) {
  .inner {
    align-items: flex-end;
    padding: calc(var(--vp-nav-height) + 36vh) 24px 56px;
  }
}
</style>
