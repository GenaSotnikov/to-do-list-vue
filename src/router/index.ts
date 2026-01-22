import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'to-do-list',
      component: () => import('../pages/ToDoView.vue'),
    },
    {
      path: '/:id',
      component: () => import('../pages/TaskDetailsPage.vue'),
    },
  ],
})

export default router
