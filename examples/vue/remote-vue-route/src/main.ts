import { createApp } from 'vue'
import { sprRemote } from '@sprlab/microfront/vue/remote'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(sprRemote, { appName: 'remote2', router })
  .use(router)
  .mount('#app')
