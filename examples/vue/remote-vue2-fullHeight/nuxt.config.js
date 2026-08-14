export default {
  mode: 'spa',
  server: {
    port: 4007,
  },
  css: ['~/assets/css/main.css'],
  plugins: [
    { src: '~/plugins/microfront.client.js', mode: 'client' },
  ],
  build: {
    transpile: ['@sprlab/microfront'],
  },
}
