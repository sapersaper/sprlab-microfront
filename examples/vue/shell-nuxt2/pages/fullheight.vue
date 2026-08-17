<template>
  <div class="fullheight-host">
    <client-only>
      <RemoteApp
        :src="remoteUrl"
        title="FullHeight Example"
        base-path="/fullheight"
        full-height
      />
    </client-only>
  </div>
</template>

<script>
/**
 * fullHeight host. See pages/route.vue for why pages/fullheight/_.vue exists.
 *
 * The wrapper needs a definite height: `fullHeight` makes the iframe at least
 * 100% of its container, and grows it when the remote content is taller.
 */
export default {
  name: 'FullHeightPage',

  computed: {
    remoteUrl() {
      return process.env.remoteFullHeightUrl
    },
  },
}
</script>

<style scoped>
.fullheight-host {
  height: calc(100vh - 49px);
  position: relative;
}
</style>
