import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  routes: [
    // ─── Públicas ───────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },

    // ─── Protegidas (usuario autenticado) ───────────
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'mis-qrs',
          name: 'mis-qrs',
          component: () => import('@/views/MisQrsView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'agenda',
          name: 'agenda',
          component: () => import('@/views/AgendaView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'admin',
          name: 'admin-panel',
          component: () => import('@/views/AdminPanelView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/escaner',
          name: 'admin-scan',
          component: () => import('@/views/AdminScanView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/qr',
          name: 'admin-qr',
          component: () => import('@/views/AdminQrView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    },

    // ─── 404 ────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Inicializar sesión solo una vez
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  // Si la ruta requiere auth y no está autenticado → login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/dashboard') {
    return authStore.isAdmin ? { name: 'admin-panel' } : { name: 'mis-qrs' }
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'mis-qrs' }
  }

  // Si ya está autenticado y va a páginas solo para guests → dashboard
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'mis-qrs' }
  }
})

export default router
