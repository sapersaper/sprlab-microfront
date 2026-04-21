import path from 'path'

export default {
  mode: 'spa',
  server: {
    port: 4005,
  },
  plugins: [
    { src: '~/plugins/microfront.client.js', mode: 'client' },
  ],
  build: {
    transpile: ['@sprlab/microfront', 'penpal'],
    extend(config) {
      // Webpack 4 doesn't support package.json "exports" field.
      // Penpal only has "exports", no "main"/"module", so we alias it manually.
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias['penpal'] = path.resolve(__dirname, 'node_modules/penpal/dist/penpal.mjs')
    },
  },
}
