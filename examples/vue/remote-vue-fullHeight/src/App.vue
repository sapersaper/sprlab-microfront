<template>
  <div class="app-layout">
    <header>
      <h1>Vue 3 FullHeight Example</h1>
      <nav>
        <router-link to="/small">Small</router-link> |
        <router-link to="/scroll">Scroll Internal</router-link> |
        <router-link to="/tall">Tall Content</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<style scoped>
.app-layout {
  /* padding: 8px; */
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}
</style>