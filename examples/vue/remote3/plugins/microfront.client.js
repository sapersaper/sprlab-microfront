import { sprRemoteLegacy } from '@sprlab/microfront/dist/remote.js'

export default ({ app }) => {
  sprRemoteLegacy.init({
    appName: 'remote3-nuxt2',
    router: app.router,
  })
}
