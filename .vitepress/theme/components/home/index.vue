<script lang="ts" setup>
import Closing from '#theme/components/closing/index.vue'
import Features from '#theme/components/features/index.vue'
import Heading from '#theme/components/heading/index.vue'
import Hero from '#theme/components/hero/index.vue'
import Plugin from '#theme/components/plugin/index.vue'
import Steps from '#theme/components/steps/index.vue'
</script>

<template>
  <div class="home">
    <Hero />

    <section class="section">
      <Heading
        label="Features"
        title="What works"
        link-text="Guide"
        link="/guide/introduction"
      />
      <Features />
    </section>

    <section class="section">
      <Heading
        label="Plugins"
        title="Make it your own"
        link-text="Plugins"
        link="/plugins/introduction"
      />
      <Plugin />
    </section>

    <section class="section">
      <Heading
        label="Getting started"
        title="Running it"
        link-text="Installation"
        link="/guide/installation"
      />
      <Steps />
    </section>

    <Closing />
  </div>
</template>

<style scoped>
.section {
  max-width: 1248px;
  margin: 0 auto;
  padding: 120px 24px 0;
}
</style>
