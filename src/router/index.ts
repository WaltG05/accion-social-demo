import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/../config/auth.js'

import Dashboard from '../pages/Dashboard.vue'
import Denuncias from '../pages/Denuncias.vue'
import Login from '../pages/Login.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/home', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/incidencias', component: Denuncias, meta: { requiresAuth: true } },
    { path: '/', redirect: () => (useAuth().isAuthenticated.value ? '/home' : '/login') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()
  if (to.meta.requiresAuth && !isAuthenticated.value) return '/login'
  if (to.path === '/login' && isAuthenticated.value) return '/home'
})

export default router
