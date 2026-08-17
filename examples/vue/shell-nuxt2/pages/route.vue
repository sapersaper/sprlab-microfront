<template>
  <div class="page">
    <h1>Route</h1>
    <p>
      Shell path: <code data-test-id="shell-path">{{ $route.path }}</code>
    </p>

    <client-only>
      <RemoteApp
        :src="remoteUrl"
        title="Route Example"
        base-path="/route"
      />
    </client-only>
  </div>
</template>

<script>
/**
 * Route sync host.
 *
 * `pages/route/_.vue` must exist next to this file. It makes /route/* a child of
 * /route, so both resolve through one route record and Nuxt's <NuxtChild> key stays
 * '/route'. Without it, /route/page1 would 404, and any path change would re-mount
 * this page and destroy the iframe along with the penpal connection.
 *
 * This component deliberately does not render <nuxt-child>: the remote content lives
 * in the iframe.
 */
export default {
  name: 'RoutePage',

  computed: {
    remoteUrl() {
      return process.env.remoteRouteUrl
    },
  },
}
</script>
