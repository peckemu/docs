<script lang="ts" setup>
import {
  Gamepad2,
  House,
  type LucideIcon,
  MessagesSquare,
  Network,
  Puzzle,
  Repeat,
  Shield,
  SquareTerminal,
} from 'lucide-vue-next'

/**
 * A feature in the grid
 */
type Feature = {
  /**
   * Its icon
   */
  readonly icon: LucideIcon

  /**
   * Its title
   */
  readonly title: string

  /**
   * What it covers
   */
  readonly text: string
}

/**
 * What peck has
 */
const FEATURES: readonly Feature[] = [
  {
    icon: MessagesSquare,
    title: 'Rooms and chat',
    text: 'Walk around and talk. Full rooms open another copy.',
  },
  {
    icon: House,
    title: 'Dens',
    text: 'Den items, layouts and den shops.',
  },
  {
    icon: Repeat,
    title: 'Trading and buddies',
    text: 'Buddies, blocking, trading, Jam-a-Grams and the Jammer Wall.',
  },
  {
    icon: Gamepad2,
    title: 'Minigames',
    text: 'Gems for single player games, plus PvP.',
  },
  {
    icon: Shield,
    title: 'Moderation',
    text: 'Reports, bans, mutes and kicks. Staff actions get logged.',
  },
  {
    icon: Network,
    title: 'Clustering',
    text: 'Run more than one server. They share players through Redis.',
  },
  {
    icon: Puzzle,
    title: 'Plugins',
    text: 'Add your own handlers, commands and migrations.',
  },
  {
    icon: SquareTerminal,
    title: 'Console',
    text: 'Migrations, seeds, imports and updates.',
  },
]
</script>

<template>
  <section class="features">
    <div v-for="feature in FEATURES" :key="feature.title" class="feature">
      <component
        :is="feature.icon"
        class="icon"
        :size="18"
        :stroke-width="1.5"
      />
      <h3 class="title">{{ feature.title }}</h3>
      <p class="text">{{ feature.text }}</p>
    </div>
  </section>
</template>

<style scoped>
.features {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--peck-line);
  border-left: 1px solid var(--peck-line);
}

.feature {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 28px 24px 32px;
  border-right: 1px solid var(--peck-line);
  border-bottom: 1px solid var(--peck-line);
}

.icon {
  color: var(--peck-muted);
}

.title {
  margin: 6px 0 0;
  color: var(--peck-text);
  font-size: 15px;
  font-weight: 600;
}

.text {
  margin: 0;
  color: var(--peck-muted);
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 960px) {
  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .features {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
