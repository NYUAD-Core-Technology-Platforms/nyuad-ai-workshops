<!--
  GuestSlide: shows a slide made in another tool (Google Slides, PowerPoint)
  as a full-canvas image, for guest speakers whose slides we include as-is.

  Props:
    src    image path under public/, e.g. /img/chenyu/01-approved-tools-data.webp
    alt    text alternative describing the slide
    links  optional clickable areas, so links in the original still work:
           [{ href, title, left, top, width, height }], positions in percent
           of the slide, measured from the top-left corner.

  Use with layout: none so the image fills the whole slide.
-->
<script setup lang="ts">
interface GuestLink {
  href: string
  title: string
  left: number
  top: number
  width: number
  height: number
}

withDefaults(defineProps<{
  src: string
  alt: string
  links?: GuestLink[]
}>(), { links: () => [] })
</script>

<template>
  <div class="guest">
    <img class="guest__img" :src="src" :alt="alt" />
    <a v-for="l in links" :key="l.href"
       class="guest__link" :href="l.href" :title="l.title" :aria-label="l.title"
       target="_blank" rel="noopener"
       :style="{ left: l.left + '%', top: l.top + '%', width: l.width + '%', height: l.height + '%' }" />
  </div>
</template>

<style scoped>
.guest {
  position: absolute;
  inset: 0;
  background: var(--white); /* guest slides are designed on white */
}
.guest__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.guest__link {
  position: absolute;
  display: block;
  border-radius: var(--r-2);
}
.guest__link:hover {
  outline: 2px solid var(--nyu-violet);
}
</style>
