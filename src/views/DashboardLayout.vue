<template>
  <div class="dashboard-layout">
    <AppNavbar />

    <div class="dashboard-body">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <nav class="sidebar-nav">
          <div class="sidebar-header">
            <div class="user-info">
              <div class="user-avatar">{{ userInitial }}</div>
              <div class="user-details">
                <p class="user-name">{{ userName }}</p>
                <p class="user-email">{{ userEmail }}</p>
              </div>
            </div>
          </div>

          <hr class="divider" />

          <ul class="sidebar-links">
            <li v-for="link in navLinks" :key="link.to">
              <RouterLink
                :to="link.to"
                class="sidebar-link"
                active-class="sidebar-link-active"
                :id="`sidebar-${link.id}`"
                @click="sidebarOpen = false"
              >
                <span class="link-icon">{{ link.icon }}</span>
                <span class="link-label">{{ link.label }}</span>
                <span v-if="link.badge" class="link-badge badge badge-accent">{{ link.badge }}</span>
              </RouterLink>
            </li>
          </ul>

          <hr class="divider" />

          <button
            class="sidebar-link sidebar-logout"
            @click="handleLogout"
            id="sidebar-logout-btn"
            :disabled="logoutLoading"
          >
            <span class="link-icon">🚪</span>
            <span class="link-label">{{ logoutLoading ? 'Cerrando...' : 'Cerrar sesión' }}</span>
          </button>
        </nav>
      </aside>

      <!-- Mobile overlay -->
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

      <!-- Main content -->
      <main class="dashboard-main">
        <!-- Mobile header -->
        <div class="mobile-topbar hide-desktop">
          <button class="hamburger-btn" @click="sidebarOpen = true" id="dashboard-hamburger">
            ☰
          </button>
          <span class="mobile-page-title">{{ currentPageTitle }}</span>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)
const logoutLoading = ref(false)

const userName = computed(() => authStore.user?.nombre ?? '')
const userEmail = computed(() => authStore.user?.email ?? '')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const navLinks = computed(() => [
  { to: '/dashboard/mis-qrs', icon: '📱', label: 'Mis QRs', id: 'mis-qrs', badge: '' },
  { to: '/dashboard/agenda', icon: '📅', label: 'Agenda del Evento', id: 'agenda', badge: '' },
  { to: '/dashboard/perfil', icon: '👤', label: 'Mi Perfil', id: 'perfil', badge: '' },
])

const currentPageTitle = computed(() => {
  const current = navLinks.value.find((l) => route.path.startsWith(l.to))
  return current?.label ?? 'Dashboard'
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
  display: flex;
  flex-direction: column;
}

.dashboard-body {
  display: flex;
  flex: 1;
  position: relative;
}

/* ─── SIDEBAR ───────────────────────────────────────── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-subtle);
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  overflow-y: auto;
}

.sidebar-nav {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sidebar-header {
  padding-bottom: var(--spacing-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gradient-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 0 15px var(--color-accent-glow);
}

.user-details {
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sidebar links */
.sidebar-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.625rem var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  width: 100%;
  text-align: left;
  transition: all var(--transition-fast);
}

.sidebar-link:hover {
  background: var(--color-accent-light);
  color: var(--color-text-primary);
}

.sidebar-link-active {
  background: var(--color-accent-light) !important;
  color: var(--color-accent) !important;
  font-weight: 600;
}

.sidebar-logout {
  margin-top: auto;
  color: var(--color-text-muted);
}

.sidebar-logout:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.link-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.link-label {
  flex: 1;
}

.link-badge {
  font-size: 0.65rem;
}

/* ─── MAIN ──────────────────────────────────────────── */
.dashboard-main {
  flex: 1;
  min-width: 0;
  padding: var(--spacing-xl);
  max-width: 100%;
}

/* Mobile */
.mobile-topbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-subtle);
}

.hamburger-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 1.2rem;
  padding: 4px 10px;
  cursor: pointer;
}

.mobile-page-title {
  font-weight: 700;
  font-size: var(--font-size-lg);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 50;
  backdrop-filter: blur(2px);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 60;
    transition: left var(--transition-normal);
    width: 260px;
  }

  .sidebar.sidebar-open {
    left: 0;
  }

  .dashboard-main {
    padding: var(--spacing-md);
  }
}
</style>
