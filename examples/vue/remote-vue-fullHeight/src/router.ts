import { createRouter, createWebHistory } from 'vue-router'
import SmallContent from '@/views/SmallContent.vue'
import ScrollInternal from '@/views/ScrollInternal.vue'
import TallContent from '@/views/TallContent.vue'

const routes = [
  { path: '/', redirect: '/small' },
  { path: '/small', component: SmallContent },
  { path: '/scroll', component: ScrollInternal },
  { path: '/tall', component: TallContent },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
