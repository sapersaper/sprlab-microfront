<template>
  <div class="app-layout">
    <NavBar />
    <main class="container app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

/* .app-main {
  display: flex;
  flex-direction: column;
}

.app-main :deep(iframe) {
  flex: 1;
} */
</style>
