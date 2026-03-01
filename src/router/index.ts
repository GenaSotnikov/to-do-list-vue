import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../shared/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/',
      name: 'to-do-list',
      component: () => import('../pages/ToDoView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:id',
      component: () => import('../pages/TaskDetailsPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !session) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.name === 'login' && session) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/'
    return redirect === '/login' ? '/' : redirect
  }

  return true
})

export default router
