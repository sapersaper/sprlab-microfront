import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Remote1 from '@/views/Remote1.vue'
import Remote2 from '@/views/Remote2.vue'
import Remote3 from '@/views/Remote3.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/remote1', component: Remote1 },
  { path: '/remote2/:path(.*)*', component: Remote2 },
  { path: '/remote3/:path(.*)*', component: Remote3 },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
