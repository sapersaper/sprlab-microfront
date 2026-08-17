export default {
  // Universal (SSR) on purpose, unlike the remote examples which are 'spa'.
  //
  // A real Nuxt 2 host server-renders, and SSR is where this integration is most
  // fragile: penpal reads the `crypto` global while its module initialises, and Nuxt
  // evaluates the server bundle in a vm sandbox that has no `crypto`. Any page that
  // imports the shell entry at module scope — as pages/connection.vue does for
  // createRemoteMessenger — used to crash with `ReferenceError: crypto is not defined`.
  //
  // Keeping this example universal makes that a regression the repo can catch.
  mode: 'universal',
  server: {
    port: 4008,
  },
  env: {
    remoteConnectionUrl: process.env.REMOTE_CONNECTION_URL || 'http://localhost:4001',
    remoteRouteUrl: process.env.REMOTE_ROUTE_URL || 'http://localhost:4002',
    remoteFullHeightUrl: process.env.REMOTE_FULLHEIGHT_URL || 'http://localhost:4004',
  },
  plugins: [
    { src: '~/plugins/microfront.client.js', mode: 'client' },
  ],
  build: {
    // RemoteApp ships as an uncompiled Vue 2 SFC so this app's vue-loader
    // compiles it with Vue 2. No penpal entry and no resolver alias needed:
    // penpal is bundled inside the library.
    transpile: ['@sprlab/microfront'],
  },
}
