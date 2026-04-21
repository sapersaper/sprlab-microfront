<template>
  <div class="app-layout">
    <header>
      <h1>Nuxt 2 FullHeight Example</h1>
      <nav>
        <nuxt-link to="/small">Small</nuxt-link> |
        <nuxt-link to="/scroll">Scroll Internal</nuxt-link> |
        <nuxt-link to="/tall">Tall Content</nuxt-link>
      </nav>
    </header>
    <nuxt />
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}
</style>
