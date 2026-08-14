export default {
  mode: 'spa',
  server: {
    port: 4006,
  },
  plugins: [
    { src: '~/plugins/microfront.client.js', mode: 'client' },
  ],
  build: {
    transpile: ['@sprlab/microfront'],
  },
}
