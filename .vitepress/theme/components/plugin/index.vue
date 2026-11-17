<script lang="ts" setup>
import { withBase } from 'vitepress'
</script>

<template>
  <div class="plugin">
    <div class="copy">
      <p class="text">
        A plugin is a class with a <code>setup</code> method. It can listen for
        events, handle packets, add console commands and bring its own
        migrations and seeds. Drop it in <code>plugins</code> and Peck loads it
        when it starts.
      </p>
      <ul class="list">
        <li>Events for start, stop, login, logout, join and leave</li>
        <li>Handlers with the same guards as Peck's own</li>
        <li>Its own migrations, seeds and console commands</li>
      </ul>
      <a class="link" :href="withBase('/plugins/first-plugin')">
        Write your first plugin →
      </a>
    </div>

    <figure class="window">
      <figcaption class="bar">
        <span class="dots"><i /><i /><i /></span>
        plugins/welcome/src/index.ts
      </figcaption>
      <pre
        class="code"
      ><code><span class="k">import</span> { <span class="t">Plugin</span>, <span class="k">type</span> <span class="t">PluginContext</span> } <span class="k">from</span> <span class="s">'@peck/plugins'</span>

<span class="k">export default class</span> <span class="t">WelcomePlugin</span> <span class="k">extends</span> <span class="t">Plugin</span> {
  <span class="k">public readonly</span> name = <span class="s">'welcome'</span>

  <span class="k">public readonly</span> version = <span class="s">'1.0.0'</span>

  <span class="k">public override</span> <span class="f">setup</span>(context: <span class="t">PluginContext</span>): <span class="t">void</span> {
    context.events.<span class="f">on</span>(<span class="s">'login'</span>, (session) => {
      context.log.<span class="f">info</span>(
        { player: session.player?.username },
        <span class="s">'logged in'</span>,
      )
    })
  }
}</code></pre>
    </figure>
  </div>
</template>

<style scoped>
.plugin {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  align-items: center;
  gap: 48px;
}

.text {
  margin: 0 0 20px;
  color: #c9d1cc;
  font-size: 16px;
  line-height: 1.65;
}

.text code {
  color: var(--peck-bloom);
  font-family: var(--vp-font-family-mono);
  font-size: 0.88em;
}

.list {
  display: grid;
  gap: 10px;
  margin: 0 0 28px;
  padding: 0;
  list-style: none;
}

.list li {
  position: relative;
  padding-left: 20px;
  color: var(--peck-muted);
  font-size: 14px;
}

.list li::before {
  position: absolute;
  top: 0.5em;
  left: 0;
  width: 6px;
  height: 6px;
  background: var(--peck-bloom);
  content: '';
}

.link {
  color: var(--peck-text);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.15s;
}

.link:hover {
  color: var(--peck-bloom);
}

.window {
  min-width: 0;
  margin: 0;
  border: 1px solid var(--peck-line);
  background: var(--vp-code-block-bg);
  box-shadow: 0 30px 80px -40px rgb(134 85 189 / 0.45);
}

.bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--peck-line);
  color: var(--peck-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.dots {
  display: inline-flex;
  gap: 6px;
}

.dots i {
  width: 8px;
  height: 8px;
  background: var(--peck-line);
}

.code {
  margin: 0;
  overflow-x: auto;
  padding: 20px 22px;
  color: var(--peck-text);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.7;
  scrollbar-color: #3a4642 transparent;
  scrollbar-width: thin;
}

.k {
  color: #b48ee0;
}

.t {
  color: #8aa0e0;
}

.s {
  color: #a3c98a;
}

.f {
  color: #e2c6f5;
}

@media (max-width: 960px) {
  .plugin {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
