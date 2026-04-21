import { createApp } from 'vue'
import { sprRemote } from '@sprlab/microfront/vue/remote'
import App from './App.vue'

createApp(App)
  .use(sprRemote, { appName: 'remote1' })
  .mount('#app')
