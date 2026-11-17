<script lang="ts" setup>
import { withBase } from 'vitepress'

/**
 * The heading's options
 */
type HeadingProps = {
  /**
   * The small label above
   */
  readonly label: string

  /**
   * The title
   */
  readonly title: string

  /**
   * The link's text, or nothing
   */
  readonly linkText?: string

  /**
   * Where the link goes
   */
  readonly link?: string
}

/**
 * The heading's options
 */
const props = defineProps<HeadingProps>()
</script>

<template>
  <header class="heading">
    <div>
      <p class="label">{{ props.label }}</p>
      <h2 class="title">{{ props.title }}</h2>
    </div>
    <a
      v-if="props.link && props.linkText"
      class="link"
      :href="withBase(props.link)"
    >
      {{ props.linkText }} →
    </a>
  </header>
</template>

<style scoped>
.heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.label {
  margin: 0 0 10px;
  color: var(--peck-bloom);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  color: var(--peck-text);
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.link {
  color: var(--peck-muted);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.15s;
}

.link:hover {
  color: var(--peck-text);
}
</style>
