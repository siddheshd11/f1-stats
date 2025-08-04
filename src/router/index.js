import { createRouter, createWebHistory } from 'vue-router'

import Test from '../components/Test.vue'
import DashboardView from '../views/DashboardView.vue'
import PreRace from '../components/prerace/PreRace.vue'
import PostRace from '../components/postrace/PostRace.vue'

const routes = [
  {
    path: '/test',
    name: 'Test',
    component: Test,
    meta: {
      title: 'F1 Test'
    }
  },
  {
    path: '/pre-race',
    name: 'PreRace',
    component: PreRace,
    meta: {
      title: 'Pre-Race Analysis'
    }
  },
  {
    path: '/post-race',
    name: 'PostRace',
    component: PostRace,
    meta: {
      title: 'Post-Race Analysis'
    }
  },
  {
    path: '/',
    name: 'DashboardView',
    component: DashboardView,
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/:catchAll(.*)',
    beforeEnter: (to, from, next) => {
      if (to.path.endsWith('.json')) {
        // Let the browser handle the 404 for static files
        window.location.href = to.fullPath
      } else {
        next('/')
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
