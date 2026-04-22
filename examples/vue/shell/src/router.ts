import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Connection from '@/views/Connection.vue'
import Route from '@/views/Route.vue'
import FullHeight from '@/views/FullHeight.vue'
import Vue2Connection from '@/views/Vue2Connection.vue'
import Vue2Route from '@/views/Vue2Route.vue'
import Vue2FullHeight from '@/views/Vue2FullHeight.vue'
import ReactConnection from '@/views/ReactConnection.vue'
import ReactRoute from '@/views/ReactRoute.vue'
import ReactFullHeight from '@/views/ReactFullHeight.vue'
import AngularConnection from '@/views/AngularConnection.vue'
import AngularRoute from '@/views/AngularRoute.vue'
import AngularFullHeight from '@/views/AngularFullHeight.vue'
import MpagConnection from '@/views/MpagConnection.vue'
import MpagRoute from '@/views/MpagRoute.vue'
import MpagFullHeight from '@/views/MpagFullHeight.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/connection', component: Connection },
  { path: '/route/:path(.*)*', component: Route },
  { path: '/fullheight/:path(.*)*', component: FullHeight },
  { path: '/vue2-connection', component: Vue2Connection },
  { path: '/vue2-route/:path(.*)*', component: Vue2Route },
  { path: '/vue2-fullheight/:path(.*)*', component: Vue2FullHeight },
  { path: '/react-connection', component: ReactConnection },
  { path: '/react-route/:path(.*)*', component: ReactRoute },
  { path: '/react-fullheight/:path(.*)*', component: ReactFullHeight },
  { path: '/angular-connection', component: AngularConnection },
  { path: '/angular-route/:path(.*)*', component: AngularRoute },
  { path: '/angular-fullheight/:path(.*)*', component: AngularFullHeight },
  { path: '/mpag-connection', component: MpagConnection },
  { path: '/mpag-route/:path(.*)*', component: MpagRoute },
  { path: '/mpag-fullheight/:path(.*)*', component: MpagFullHeight },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
