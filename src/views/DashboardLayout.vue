<template>
  <div class="dashboard-layout">
    <div class="dashboard-body">
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-panel">
          <!-- Logo de la app -->
          <RouterLink to="/" class="sidebar-brand" id="sidebar-logo-link">
            <div class="logo-mark">M</div>
            <div class="logo-copy">
              <span class="logo-text">MTTS Eventos</span>
              <span class="logo-meta">Registro digital</span>
            </div>
          </RouterLink>
          <hr class="sidebar-divider" />

          <div class="sidebar-header">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-copy">
              <strong>{{ userName }}</strong>
              <span>{{ userEmail }}</span>
            </div>
          </div>

          <div class="sidebar-caption">Navegacion principal</div>

          <nav class="sidebar-links">
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="sidebar-link"
              active-class="sidebar-link-active"
              :id="`sidebar-${link.id}`"
              @click="sidebarOpen = false"
            >
              <AppIcon :name="link.icon" size="18" />
              <span class="link-label">{{ link.label }}</span>
            </RouterLink>
          </nav>

          <button
            class="sidebar-link sidebar-logout"
            @click="handleLogout"
            id="sidebar-logout-btn"
            :disabled="logoutLoading"
          >
            <AppIcon name="logout" size="18" />
            <span class="link-label">{{ logoutLoading ? 'Cerrando...' : 'Cerrar sesion' }}</span>
          </button>
        </div>
      </aside>

      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

      <main class="dashboard-main">
        <div class="mobile-topbar hide-desktop">
          <button class="mobile-menu-btn" @click="sidebarOpen = true" id="dashboard-hamburger">
            <AppIcon name="menu" size="18" />
          </button>
          <div>
            <span class="mobile-label">Dashboard</span>
            <strong class="mobile-page-title">{{ currentPageTitle }}</strong>
          </div>
        </div>

        <RouterView v-slot="{ Component, route }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import AppIcon from '@/components/shared/AppIcon.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)
const logoutLoading = ref(false)

const userName = computed(() => authStore.user?.nombre ?? 'Usuario')
const userEmail = computed(() => authStore.user?.email ?? 'Sin email')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const isAdmin = computed(() => authStore.isAdmin)
const isModerator = computed(() => authStore.isModerator)

const navLinks = computed(() => {
  const links = [
    { to: '/dashboard/mis-qrs', icon: 'qr', label: 'Mis QRs', id: 'mis-qrs' },
  ]

  if (!isModerator.value) {
    links.push({ to: '/dashboard/agenda', icon: 'calendar', label: 'Agenda del evento', id: 'agenda' })
  }

  if (isAdmin.value) {
    links.push({ to: '/dashboard/admin', icon: 'shield', label: 'Panel admin', id: 'admin' })
    links.push({ to: '/dashboard/admin/qr', icon: 'qr', label: 'Gestión QR', id: 'admin-qr' })
  }

  if (isAdmin.value || isModerator.value) {
    links.push({ to: '/dashboard/admin/escaner', icon: 'qr', label: 'Escaner QR', id: 'admin-scan' })
  }

  return links
})

const currentPageTitle = computed(() => {
  const current = navLinks.value.find((link) => route.path.startsWith(link.to))
  return current?.label ?? 'Panel'
})

async function handleLogout() {
  logoutLoading.value = true
  try {
    await authStore.logout()
    qrStore.clearQrs()
    router.push('/login')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
}

.dashboard-body {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
}

.sidebar {
  width: 290px;
  position: sticky;
  top: 1.25rem;
  flex-shrink: 0;
}

.sidebar-panel {
  border-radius: 1.8rem;
  padding: 1.25rem 1rem;
  background: rgba(10, 22, 38, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: inherit;
  padding: 0.4rem;
  margin-bottom: 0.5rem;
  text-decoration: none;
}

.logo-mark {
  width: 44px;
  height: 44px;
  border-radius: 1rem;
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.22), rgba(0, 98, 155, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 18px 28px rgba(0, 98, 155, 0.24);
  color: #fff;
  flex-shrink: 0;
}

.logo-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.logo-meta {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.sidebar-divider {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.5rem 0 1rem 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.4rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 1rem;
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.34), rgba(0, 98, 155, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.user-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-copy strong,
.mobile-page-title {
  font-size: 0.96rem;
}

.user-copy span,
.sidebar-caption,
.mobile-label {
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.user-copy span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-caption {
  margin: 0 0.5rem 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.sidebar-link {
  width: 100%;
  border: none;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font: inherit;
  transition: all var(--transition-fast);
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.sidebar-link-active {
  background: linear-gradient(135deg, rgba(0, 169, 224, 0.18), rgba(0, 98, 155, 0.16));
  color: #8cdfff;
  border: 1px solid rgba(0, 169, 224, 0.18);
}

.link-label {
  flex: 1;
}

.sidebar-logout {
  margin-top: 1rem;
}

.sidebar-logout:hover {
  background: rgba(226, 0, 26, 0.12);
  color: #ff9ca7;
}

.dashboard-main {
  flex: 1;
  min-width: 0;
}

.mobile-topbar {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.mobile-menu-btn {
  width: 44px;
  height: 44px;
  border-radius: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mobile-menu-btn:hover {
  border-color: var(--color-border);
  background: rgba(255, 255, 255, 0.08);
}

.mobile-label {
  display: block;
  margin-bottom: 0.1rem;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 15, 0.55);
  backdrop-filter: blur(2px);
  z-index: 50;
}

@media (max-width: 960px) {
  .dashboard-body {
    padding: 1rem;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -320px;
    height: 100vh;
    width: 290px;
    z-index: 60;
    padding: 1rem;
    transition: left var(--transition-normal);
  }

  .sidebar.sidebar-open {
    left: 0;
  }

  .sidebar-panel {
    height: 100%;
    overflow-y: auto;
  }

  .mobile-topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(6, 17, 31, 0.72);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin: -1rem -1rem 1.25rem -1rem;
    padding: 0.75rem 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  }
}
</style>
