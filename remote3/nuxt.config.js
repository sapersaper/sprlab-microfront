export default {
  server: {
    port: 4003,
  },
  plugins: [
    { src: '~/plugins/microfront.client.js', mode: 'client' },
  ],
  build: {
    transpile: ['@sprlab/microfront'],
  },
}
