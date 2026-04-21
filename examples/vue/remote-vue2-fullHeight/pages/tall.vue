<template>
  <div>
    <h2>Tall Content</h2>
    <p>This page has content that exceeds 1000px without internal scroll.</p>
    <p>The iframe should expand to fit all the content.</p>
    <div v-for="i in 25" :key="i" style="padding: 16px; margin: 8px 0; background: #f0f0f0; border-radius: 4px;">
      <strong>Block {{ i }}</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
  </div>
</template>
