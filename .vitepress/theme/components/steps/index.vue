<script lang="ts" setup>
/**
 * A step to get running
 */
type Step = {
  /**
   * Its title
   */
  readonly title: string

  /**
   * What it does
   */
  readonly text: string

  /**
   * The command to run
   */
  readonly command: string
}

/**
 * How to get running
 */
const STEPS: readonly Step[] = [
  {
    title: 'Clone it',
    text: 'Clone the repo and install the dependencies.',
    command: 'bun install',
  },
  {
    title: 'Set it up',
    text: 'Copy .env.example to .env.local, then migrate and seed.',
    command: 'bun run db:migrate',
  },
  {
    title: 'Run it',
    text: 'Starts the emulator and the API.',
    command: 'bun run dev',
  },
]
</script>

<template>
  <ol class="steps">
    <li v-for="(step, index) in STEPS" :key="step.title" class="step">
      <span class="number">0{{ index + 1 }}</span>
      <h3 class="title">{{ step.title }}</h3>
      <p class="text">{{ step.text }}</p>
      <code class="command"
        ><span class="prompt">$</span> {{ step.command }}</code
      >
    </li>
  </ol>
</template>

<style scoped>
.steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--peck-line);
  border-left: 1px solid var(--peck-line);
  list-style: none;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px 24px;
  border-right: 1px solid var(--peck-line);
  border-bottom: 1px solid var(--peck-line);
}

.number {
  color: var(--peck-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.title {
  margin: 0;
  color: var(--peck-text);
  font-size: 16px;
  font-weight: 600;
}

.text {
  margin: 0 0 8px;
  color: var(--peck-muted);
  font-size: 14px;
  line-height: 1.6;
}

.command {
  margin-top: auto;
  padding: 10px 12px;
  border: 1px solid var(--peck-line);
  background: rgb(255 255 255 / 0.02);
  color: var(--peck-text);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.prompt {
  color: var(--peck-muted);
}

@media (max-width: 860px) {
  .steps {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
