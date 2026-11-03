<!--
  Cmd: one terminal command in its own box, with an always-visible Copy
  button, so attendees can copy each line separately. The text can also be
  selected with the mouse (the deck sets selectable: true in its headmatter).

  Usage in slides.md (keep the tags on their own lines so Markdown leaves the
  command text untouched):

    <Cmd n="1" note="once per computer">
    npm install -g pnpm@9
    </Cmd>

  Props:
    n     optional step number shown in a badge before the box
    note  optional short hint shown inside the box; it is not copied
-->
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  n?: string | number
  note?: string
}>()

const codeEl = ref<HTMLElement | null>(null)
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  const text = (codeEl.value?.innerText ?? '').trim()
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    // Fallback for browsers without the async clipboard API.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="cmdline">
    <span v-if="n !== undefined" class="cmdline__n">{{ n }}</span>
    <div class="cmdline__box">
      <code ref="codeEl" class="cmdline__code"><slot /></code>
      <span v-if="note" class="cmdline__note">{{ note }}</span>
      <button type="button" class="cmdline__copy" :class="{ 'is-copied': copied }"
              :title="copied ? 'Copied' : 'Copy to clipboard'" @click.stop="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cmdline {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: var(--s-1) 0;
}
.cmdline__n {
  flex: none;
  width: 1.6em;
  height: 1.6em;
  line-height: 1.6em;
  text-align: center;
  border-radius: var(--r-pill);
  background: var(--nyu-violet);
  color: var(--white);
  font-weight: 700;
  font-size: var(--t-caption);
  user-select: none;
}
.cmdline__box {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--s-2);
  padding: 5px 6px 5px 12px;
  background: var(--bg2);
  border: 1px solid var(--hairline);
  border-radius: var(--r-2);
}
.cmdline__code {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--fg1);
  background: none;
  border: none;
  padding: 0;
  user-select: text;
  cursor: text;
}
.cmdline__note {
  flex: none;
  font-size: var(--t-caption);
  color: var(--fg3);
  white-space: nowrap;
  user-select: none;
}
.cmdline__copy {
  flex: none;
  font: inherit;
  font-size: var(--t-caption);
  font-weight: 600;
  line-height: 1;
  padding: 4px 9px;
  color: var(--accent-ink);
  background: var(--bg1);
  border: 1px solid var(--accent-ink);
  border-radius: var(--r-2);
  cursor: pointer;
  user-select: none;
}
.cmdline__copy:hover,
.cmdline__copy.is-copied {
  background: var(--nyu-violet);
  border-color: var(--nyu-violet);
  color: var(--white);
}
</style>
