<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar-logo" id="nav-logo">
        <div class="logo-icon">M</div>
        <span class="logo-text">MTTS <span class="logo-accent">Eventos</span></span>
      </RouterLink>

      <!-- Desktop nav links -->
      <ul class="navbar-links hide-mobile">
        <li><RouterLink to="/" class="nav-link" exact-active-class="nav-link-active">Inicio</RouterLink></li>
        <li v-if="!isAuthenticated">
          <RouterLink to="/login" class="btn btn-primary btn-sm" id="nav-btn-login">Iniciar sesión</RouterLink>
        </li>
        <template v-if="isAuthenticated">
          <li><RouterLink to="/dashboard/mis-qrs" class="nav-link" active-class="nav-link-active">Mis QRs</RouterLink></li>
          <li><RouterLink to="/dashboard/agenda" class="nav-link" active-class="nav-link-active">Agenda</RouterLink></li>
          <li class="nav-user-menu" ref="menuRef">
            <button class="nav-user-btn" @click="toggleMenu" id="nav-user-menu-btn" :aria-expanded="menuOpen">
              <div class="avatar">{{ userInitial }}</div>
              <span class="hide-mobile">{{ userName }}</span>
              <span class="chevron" :class="{ open: menuOpen }">▾</span>
            </button>
            <Transition name="fade">
              <div v-if="menuOpen" class="dropdown-menu" role="menu">
                <RouterLink to="/dashboard/perfil" class="dropdown-item" role="menuitem" @click="menuOpen = false">
                  👤 Mi perfil
                </RouterLink>
                <hr class="divider" />
                <button class="dropdown-item danger" role="menuitem" @click="handleLogout" id="nav-btn-logout">
                  <span v-if="!logoutLoading">🚪 Cerrar sesión</span>
                  <span v-else>Cerrando...</span>
                </button>
              </div>
            </Transition>
          </li>
        </template>
      </ul>

      <!-- Mobile hamburger -->
      <button class="hamburger hide-desktop" @click="mobileOpen = !mobileOpen" id="nav-hamburger" :aria-expanded="mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu hide-desktop">
        <RouterLink to="/" class="mobile-link" @click="mobileOpen = false">🏠 Inicio</RouterLink>
        <template v-if="isAuthenticated">
          <RouterLink to="/dashboard/mis-qrs" class="mobile-link" @click="mobileOpen = false">📱 Mis QRs</RouterLink>
          <RouterLink to="/dashboard/agenda" class="mobile-link" @click="mobileOpen = false">📅 Agenda</RouterLink>
          <RouterLink to="/dashboard/perfil" class="mobile-link" @click="mobileOpen = false">👤 Perfil</RouterLink>
          <button class="mobile-link danger" @click="handleLogout">🚪 Cerrar sesión</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="mobile-link" @click="mobileOpen = false">🔑 Iniciar sesión</RouterLink>
        </template>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.nombre ?? '')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const menuOpen = ref(false)
const mobileOpen = ref(false)
const logoutLoading = ref(false)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(menuRef, () => { menuOpen.value = false })

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

async function handleLogout() {
  logoutLoading.value = true
  menuOpen.value = false
  mobileOpen.value = false
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
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 15, 26, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border-subtle);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--gradient-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 0 20px var(--color-accent-glow);
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.logo-accent {
  color: var(--color-accent);
}

/* Nav links */
.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  list-style: none;
}

.nav-link {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-decoration: none;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-link-active {
  color: var(--color-text-primary);
  background: var(--color-accent-light);
}

/* User menu */
.nav-user-menu {
  position: relative;
}

.nav-user-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-accent-light);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.nav-user-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.avatar {
  width: 30px;
  height: 30px;
  background: var(--gradient-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-sm);
  color: white;
}

.chevron {
  font-size: 0.7rem;
  transition: transform var(--transition-fast);
}

.chevron.open {
  transform: rotate(180deg);
}

/* Dropdown */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-lg);
  z-index: 200;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 0.625rem var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  color: var(--color-text-secondary);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-accent-light);
  color: var(--color-text-primary);
}

.dropdown-item.danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

/* Hamburger */
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

/* Mobile menu */
.mobile-menu {
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.75rem var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  width: 100%;
  text-align: left;
  transition: all var(--transition-fast);
}

.mobile-link:hover {
  background: var(--color-accent-light);
  color: var(--color-text-primary);
}

.mobile-link.danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

/* Slide animation for mobile */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
