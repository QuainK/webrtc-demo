import { createRouter, createWebHashHistory, } from 'vue-router';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/terminal',
      children: [
        {
          path: '/terminal',
          name: 'terminal',
          meta: {
            title: '终端'
          },
          component: () => import('@/views/terminal.vue')
        },
        {
          path: '/admin',
          name: 'admin',
          meta: {
            title: '后台'
          },
          component: () => import('@/views/admin.vue')
        },
      ]
    },
  ]
})
export default router
