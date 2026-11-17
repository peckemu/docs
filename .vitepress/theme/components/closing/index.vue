<script lang="ts" setup>
import Install from '#theme/components/install/index.vue'

/**
 * The commands to copy
 */
const COMMANDS = [
  { label: 'Clone', command: 'git clone https://github.com/peckemu/peck' },
  { label: 'Run', command: 'bun install && bun run dev' },
] as const
</script>

<template>
  <section class="closing">
    <h2 class="title">Have a look around</h2>
    <p class="text">It's all on GitHub. Pull requests are welcome.</p>
    <Install :commands="COMMANDS" />
  </section>
</template>

<style scoped>
.closing {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: 40px 0 24px;
  text-align: center;
}

.title {
  margin: 0;
  color: var(--peck-text);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 600;
  letter-spacing: -0.03em;
}

.text {
  max-width: 420px;
  margin: 0 0 12px;
  color: var(--peck-muted);
  font-size: 16px;
  line-height: 1.55;
}
</style>
