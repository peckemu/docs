<script lang="ts" setup>
import { computed, ref } from 'vue'

/**
 * A command to copy
 */
type InstallCommand = {
  /**
   * The tab's name
   */
  readonly label: string

  /**
   * The command
   */
  readonly command: string
}

/**
 * The install box's options
 */
type InstallProps = {
  /**
   * The commands
   */
  readonly commands: readonly InstallCommand[]
}

/**
 * The install box's options
 */
const props = defineProps<InstallProps>()

/**
 * The open tab
 */
const active = ref<number>(0)

/**
 * Whether the command was just copied
 */
const copied = ref<boolean>(false)

/**
 * The shown command
 */
const command = computed(() => props.commands[active.value]?.command ?? '')

/**
 * Copies the shown command
 */
const copy = async (): Promise<void> => {
  await navigator.clipboard.writeText(command.value)

  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<template>
  <div class="install">
    <div class="tabs" role="tablist">
      <button
        v-for="(item, index) in props.commands"
        :key="item.label"
        type="button"
        role="tab"
        class="tab"
        :class="{ active: index === active }"
        :aria-selected="index === active"
        @click="active = index"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="line">
      <code class="command"><span class="prompt">$</span> {{ command }}</code>
      <button type="button" class="copy" @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.install {
  width: min(100%, 520px);
  min-width: 0;
  max-width: 100%;
}

.tabs {
  display: inline-flex;
  border: 1px solid var(--peck-line);
  border-bottom: 0;
}

.tab {
  padding: 4px 10px;
  border-right: 1px solid var(--peck-line);
  color: var(--peck-muted);
  font-size: 12px;
  transition: color 0.15s;
}

.tab:last-child {
  border-right: 0;
}

.tab:hover,
.tab.active {
  color: var(--peck-text);
}

.tab.active {
  background: rgb(255 255 255 / 0.04);
}

.line {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--peck-line);
  background: rgb(5 8 8 / 0.72);
  backdrop-filter: blur(6px);
}

.command {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  padding: 14px 16px;
  background: none;
  color: var(--peck-text);
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt {
  color: var(--peck-muted);
}

.copy {
  flex-shrink: 0;
  padding: 0 20px;
  border-left: 1px solid var(--peck-line);
  color: var(--peck-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.15s;
}

.copy:hover {
  color: var(--peck-text);
}
</style>
