<script lang="ts" setup>
import Closing from '#theme/components/closing/index.vue'
import Features from '#theme/components/features/index.vue'
import Heading from '#theme/components/heading/index.vue'
import Hero from '#theme/components/hero/index.vue'
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
        label="Getting started"
        title="Running it"
        link-text="Installation"
        link="/guide/installation"
      />
      <Steps />
    </section>

    <section class="section">
      <Closing />
    </section>

    <p class="wordmark" aria-hidden="true">peck</p>
  </div>
</template>

<style scoped>
.section {
  max-width: 1248px;
  margin: 0 auto;
  padding: 96px 24px 0;
}

.wordmark {
  margin: 0;
  overflow: hidden;
  padding-top: 80px;
  background: url('/still.png') center 40% / cover;
  background-clip: text;
  color: transparent;
  font-size: clamp(140px, 30vw, 440px);
  font-weight: 700;
  line-height: 0.78;
  letter-spacing: -0.06em;
  text-align: center;
  image-rendering: pixelated;
  user-select: none;
  -webkit-background-clip: text;
}
</style>
