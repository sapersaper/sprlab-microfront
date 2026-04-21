<template>
  <div class="wrapper">
    <div>
      <h2>Scroll Internal</h2>
      <p>This page fills the available height and scrolls internally.</p>
    </div>
    <p v-for="i in 30" :key="i">
      Scrollable item {{ i }} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  height: 100%;
  overflow: auto;
}
</style>
