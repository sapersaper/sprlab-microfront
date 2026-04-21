import path from 'path'

export default {
  mode: 'spa',
  server: {
    port: 4006,
  },
  plugins: [
    { src: '~/plugins/microfront.client.js', mode: 'client' },
  ],
  build: {
    transpile: ['@sprlab/microfront', 'penpal'],
    extend(config) {
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias['penpal'] = path.resolve(__dirname, 'node_modules/penpal/dist/penpal.mjs')
    },
  },
}
