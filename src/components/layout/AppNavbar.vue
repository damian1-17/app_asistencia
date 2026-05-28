<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <RouterLink to="/" class="navbar-logo" id="nav-logo">
        <div class="logo-mark">
          <img src="@/assets/mtts.svg" alt="MTTS Logo" style="width: 26px; height: 26px;" />
        </div>
        <div class="logo-copy">
          <span class="logo-text">MTTS Eventos</span>
          <span class="logo-meta">Registro digital</span>
        </div>
      </RouterLink>

      <ul class="navbar-links hide-mobile">
        <li><RouterLink to="/" class="nav-link" exact-active-class="nav-link-active">Inicio</RouterLink></li>
        <li><RouterLink to="/#cronograma" class="nav-link">Cronograma</RouterLink></li>
        <template v-if="isAuthenticated">
          <li><RouterLink to="/dashboard/mis-qrs" class="nav-link" active-class="nav-link-active">Mis QRs</RouterLink></li>
          <li v-if="!isModerator"><RouterLink to="/dashboard/agenda" class="nav-link" active-class="nav-link-active">Agenda</RouterLink></li>
          <li v-if="isAdmin"><RouterLink to="/dashboard/admin" class="nav-link" active-class="nav-link-active">Admin</RouterLink></li>
          <li v-if="isAdmin || isModerator"><RouterLink to="/dashboard/admin/escaner" class="nav-link" active-class="nav-link-active">Escaner</RouterLink></li>
        </template>
      </ul>

      <div class="navbar-actions hide-mobile">
        <RouterLink
          v-if="!isAuthenticated"
          to="/login"
          class="btn btn-primary btn-sm nav-login"
          id="nav-btn-login"
        >
          <AppIcon name="key" size="16" />
          <span>Iniciar sesion</span>
        </RouterLink>

        <div v-else class="nav-user-menu" ref="menuRef">
          <button class="nav-user-btn" @click="toggleMenu" id="nav-user-menu-btn" :aria-expanded="menuOpen">
            <div class="avatar">{{ userInitial }}</div>
            <div class="nav-user-copy">
              <span class="nav-user-name">{{ userName }}</span>
              <span class="nav-user-role">Cuenta activa</span>
            </div>
            <AppIcon name="chevron-down" size="16" class="chevron" :class="{ open: menuOpen }" />
          </button>
          <Transition name="fade">
            <div v-if="menuOpen" class="dropdown-menu" role="menu">
              <RouterLink v-if="isAdmin" to="/dashboard/admin" class="dropdown-item" role="menuitem" @click="closeMenus">
                <AppIcon name="shield" size="16" />
                <span>Panel admin</span>
              </RouterLink>
              <RouterLink v-if="isAdmin || isModerator" to="/dashboard/admin/escaner" class="dropdown-item" role="menuitem" @click="closeMenus">
                <AppIcon name="qr" size="16" />
                <span>Escaner QR</span>
              </RouterLink>
              <button class="dropdown-item danger" role="menuitem" @click="handleLogout" id="nav-btn-logout">
                <AppIcon name="logout" size="16" />
                <span>{{ logoutLoading ? 'Cerrando...' : 'Cerrar sesion' }}</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <button class="mobile-toggle hide-desktop" @click="mobileOpen = !mobileOpen" id="nav-hamburger" :aria-expanded="mobileOpen">
        <AppIcon :name="mobileOpen ? 'x' : 'menu'" size="18" />
      </button>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu hide-desktop">
        <RouterLink to="/" class="mobile-link" @click="closeMenus">
          <AppIcon name="home" size="18" />
          <span>Inicio</span>
        </RouterLink>
        <RouterLink to="/#cronograma" class="mobile-link" @click="closeMenus">
          <AppIcon name="calendar" size="18" />
          <span>Cronograma</span>
        </RouterLink>
        <template v-if="isAuthenticated">
          <RouterLink to="/dashboard/mis-qrs" class="mobile-link" @click="closeMenus">
            <AppIcon name="qr" size="18" />
            <span>Mis QRs</span>
          </RouterLink>
          <RouterLink v-if="!isModerator" to="/dashboard/agenda" class="mobile-link" @click="closeMenus">
            <AppIcon name="calendar" size="18" />
            <span>Agenda</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/dashboard/admin" class="mobile-link" @click="closeMenus">
            <AppIcon name="shield" size="18" />
            <span>Panel admin</span>
          </RouterLink>
          <RouterLink v-if="isAdmin || isModerator" to="/dashboard/admin/escaner" class="mobile-link" @click="closeMenus">
            <AppIcon name="qr" size="18" />
            <span>Escaner QR</span>
          </RouterLink>
          <button class="mobile-link danger" @click="handleLogout">
            <AppIcon name="logout" size="18" />
            <span>{{ logoutLoading ? 'Cerrando...' : 'Cerrar sesion' }}</span>
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="mobile-link mobile-login" @click="closeMenus">
            <AppIcon name="key" size="18" />
            <span>Iniciar sesion</span>
          </RouterLink>
        </template>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import AppIcon from '@/components/shared/AppIcon.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const isModerator = computed(() => authStore.isModerator)
const userName = computed(() => authStore.user?.nombre ?? 'Usuario')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const menuOpen = ref(false)
const mobileOpen = ref(false)
const logoutLoading = ref(false)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(menuRef, () => {
  menuOpen.value = false
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenus() {
  menuOpen.value = false
  mobileOpen.value = false
}

async function handleLogout() {
  logoutLoading.value = true
  closeMenus()
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
  background: rgba(6, 17, 31, 0.72);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 78px;
  gap: var(--spacing-lg);
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: inherit;
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

.navbar-links,
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.navbar-links {
  list-style: none;
  margin-left: auto;
}

.nav-link {
  padding: 0.6rem 0.95rem;
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  font-weight: 600;
}

.nav-link:hover,
.nav-link-active {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-primary);
}

.nav-login {
  min-width: 150px;
}

.nav-user-menu {
  position: relative;
}

.nav-user-btn {
  min-width: 240px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  padding: 0.4rem 0.55rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.nav-user-btn:hover {
  border-color: var(--color-border);
  background: rgba(255, 255, 255, 0.08);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 0.9rem;
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.35), rgba(0, 98, 155, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.nav-user-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.nav-user-name {
  font-size: 0.9rem;
  font-weight: 700;
}

.nav-user-role {
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.chevron {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.chevron.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  padding: 0.5rem;
  border-radius: 1.25rem;
  background: rgba(10, 22, 38, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 46px rgba(0, 0, 0, 0.28);
}

.dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 0.95rem;
  padding: 0.8rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-primary);
}

.dropdown-item.danger:hover {
  background: rgba(226, 0, 26, 0.12);
  color: #ff9ca7;
}

.mobile-toggle {
  width: 44px;
  height: 44px;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu {
  margin: 0 var(--spacing-md) var(--spacing-md);
  padding: 0.55rem;
  border-radius: 1.25rem;
  background: rgba(10, 22, 38, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
}

.mobile-link:hover,
.mobile-login {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.mobile-link.danger:hover {
  background: rgba(226, 0, 26, 0.12);
  color: #ff9ca7;
}

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
  max-height: 420px;
}
</style>
