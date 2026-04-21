import { sprRemoteLegacy } from '@sprlab/microfront/dist/remote.js'

export default ({ app }) => {
  sprRemoteLegacy.init({
    appName: 'remote-vue2-fullHeight',
    router: app.router,
  })
}
