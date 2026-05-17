<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'ja' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=DM+Sans:wght@400;500;600&display=swap' },
  ],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
  background: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
}
</style>
