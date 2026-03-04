import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '/src/stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('/src/views/HomeView.vue'),
    meta: { title: 'Home - Online Voting System' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('/src/views/LoginView.vue'),
    meta: { 
      title: 'Login - Online Voting System',
      guest: true 
    }
  },
  {
    path: '/admin',
    component: () => import('/src/views/AdminView.vue'),
    meta: { 
      requiresAuth: true,
      role: 'admin' 
    },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('/src/components/admin/AdminDashboard.vue')
      },
      {
        path: 'voters',
        name: 'admin-voters',
        component: () => import('/src/components/admin/VoterManagement.vue')
      },
      {
        path: 'candidates',
        name: 'admin-candidates',
        component: () => import('/src/components/admin/CandidateManagement.vue')
      },
      {
        path: 'results',
        name: 'admin-results',
        component: () => import('/src/components/admin/ElectionResults.vue')
      }
    ]
  },
  {
    path: '/voter',
    component: () => import('/src/views/VoterView.vue'),
    meta: { 
      requiresAuth: true,
      role: 'voter' 
    },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'voter-dashboard',
        component: () => import('/src/components/voter/VotingDashboard.vue')
      },
      {
        path: 'vote',
        name: 'voter-vote',
        component: () => import('/src/components/voter/VotingBooth.vue')
      },
      {
        path: 'progress',
        name: 'voter-progress',
        component: () => import('/src/components/voter/VotingProgress.vue')
      }
    ]
  },
  {
    path: '/results',
    name: 'results',
    component: () => import('/src/views/ResultsView.vue'),
    meta: { title: 'Election Results' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('/src/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title || 'Online Voting System'
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // Check if route is for guests only
  else if (to.meta.guest && authStore.isAuthenticated) {
    next(authStore.userRole === 'admin' ? '/admin/dashboard' : '/voter/dashboard')
  }
  // Check if route requires specific role
  else if (to.meta.role && authStore.userRole !== to.meta.role) {
    next(authStore.userRole === 'admin' ? '/admin/dashboard' : '/voter/dashboard')
  }
  else {
    next()
  }
})

export default router