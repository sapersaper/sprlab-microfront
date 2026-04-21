import { createApp } from 'vue'
import { sprRemote } from '@sprlab/microfront/vue/remote'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App)
  .use(sprRemote, { appName: 'remote-vue-fullHeight', router })
  .use(router)
  .mount('#app')
