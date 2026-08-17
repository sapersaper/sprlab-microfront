<template>
  <div class="app">
    <nav class="nav">
      <strong>Micro Frontend — Nuxt 2 shell</strong>
      <nuxt-link to="/" exact>Home</nuxt-link>
      <nuxt-link to="/connection">Connection</nuxt-link>
      <nuxt-link to="/route" exact>Route</nuxt-link>
      <nuxt-link to="/route/page1">Route · page1</nuxt-link>
      <nuxt-link to="/route/page2">Route · page2</nuxt-link>
      <nuxt-link to="/fullheight">FullHeight</nuxt-link>
    </nav>
    <nuxt />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #222;
}

.nav {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 20px;
  background: #f4f4f5;
  border-bottom: 1px solid #ddd;
}

.nav a {
  color: #0b5cad;
  text-decoration: none;
  font-size: 14px;
}

.nav a.nuxt-link-active {
  font-weight: 700;
  text-decoration: underline;
}

.page {
  padding: 20px;
}
</style>
