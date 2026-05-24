<template>
  <div class="perfil-page">
    <div class="page-header">
      <h1 class="page-title">👤 Mi Perfil</h1>
      <p class="page-subtitle">Información de tu cuenta</p>
    </div>

    <!-- Profile card -->
    <div class="profile-card glass">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar">{{ userInitial }}</div>
        <div class="avatar-glow"></div>
      </div>

      <div class="profile-info">
        <h2 class="profile-name">{{ user?.nombre }}</h2>
        <p class="profile-email">{{ user?.email }}</p>
        <div class="profile-roles">
          <span class="badge badge-accent" v-for="role in displayRoles" :key="role">
            {{ role }}
          </span>
        </div>
      </div>
    </div>

    <!-- Details -->
    <div class="details-card glass mt-xl">
      <h3 class="details-title">Información de cuenta</h3>
      <div class="details-list">
        <div class="detail-row">
          <span class="detail-label">Nombre completo</span>
          <span class="detail-value">{{ user?.nombre }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ user?.email }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID de usuario</span>
          <span class="detail-value font-mono">#{{ user?.idUsuario }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Roles</span>
          <div class="detail-value">
            <span class="badge badge-accent mr-xs" v-for="role in displayRoles" :key="role">{{ role }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Change password -->
    <div class="change-password-card glass mt-xl">
      <h3 class="details-title">Cambiar contraseña</h3>

      <Transition name="fade">
        <AlertMessage v-if="pwdSuccess" message="Contraseña cambiada exitosamente" type="success" class="mb-lg" />
        <AlertMessage v-else-if="pwdError" :message="pwdError" type="error" dismissible @dismiss="pwdError = ''" class="mb-lg" />
      </Transition>

      <form @submit.prevent="changePassword" id="change-password-form">
        <div class="form-group">
          <label class="form-label" for="pwd-actual">Contraseña actual</label>
          <input
            id="pwd-actual"
            v-model="pwdForm.currentPassword"
            type="password"
            class="form-input"
            placeholder="Tu contraseña actual"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="pwd-nueva">Nueva contraseña</label>
          <input
            id="pwd-nueva"
            v-model="pwdForm.newPassword"
            type="password"
            class="form-input"
            placeholder="Mínimo 8 caracteres"
            minlength="8"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="pwd-confirm">Confirmar nueva contraseña</label>
          <input
            id="pwd-confirm"
            v-model="pwdForm.confirm"
            type="password"
            class="form-input"
            :class="{ error: confirmError }"
            placeholder="Repite la contraseña"
            required
          />
          <span v-if="confirmError" class="form-error">⚠ Las contraseñas no coinciden</span>
        </div>
        <button
          type="submit"
          class="btn btn-secondary"
          :disabled="pwdLoading || confirmError"
          id="btn-change-password"
        >
          <span v-if="!pwdLoading">🔒 Cambiar contraseña</span>
          <span v-else class="flex items-center gap-sm"><div class="spinner spinner-sm"></div>Cambiando...</span>
        </button>
      </form>
    </div>

    <!-- Logout button -->
    <div class="logout-section mt-xl">
      <button
        class="btn btn-danger btn-lg"
        @click="handleLogout"
        :disabled="logoutLoading"
        id="perfil-logout-btn"
      >
        {{ logoutLoading ? 'Cerrando sesión...' : '🚪 Cerrar sesión' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import authApi from '@/api/auth.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter()

const user = computed(() => authStore.user)
const userInitial = computed(() => user.value?.nombre?.charAt(0).toUpperCase() ?? '?')
const displayRoles = computed(() => authStore.displayRoles)

// Change password
const pwdForm = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref(false)

const confirmError = computed(
  () => pwdForm.confirm.length > 0 && pwdForm.confirm !== pwdForm.newPassword,
)

async function changePassword() {
  if (confirmError.value) return
  pwdLoading.value = true
  pwdError.value = ''
  pwdSuccess.value = false
  try {
    await authApi.changePassword({
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword,
    })
    pwdSuccess.value = true
    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirm = ''
    setTimeout(() => { pwdSuccess.value = false }, 4000)
  } catch (err: any) {
    pwdError.value = err?.response?.data?.message ?? 'Error al cambiar la contraseña'
  } finally {
    pwdLoading.value = false
  }
}

// Logout
const logoutLoading = ref(false)
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
.perfil-page {
  max-width: 700px;
  animation: fadeIn 0.4s ease;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin-bottom: var(--spacing-xs);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Profile card */
.profile-card {
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.profile-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: white;
  position: relative;
  z-index: 1;
}

.avatar-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--gradient-accent);
  opacity: 0.3;
  filter: blur(8px);
  animation: glow 3s ease-in-out infinite;
}

.profile-name {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin-bottom: var(--spacing-xs);
}

.profile-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.profile-roles {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

/* Details */
.details-card,
.change-password-card {
  padding: var(--spacing-xl);
}

.details-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-subtle);
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-align: right;
}

.font-mono {
  font-family: 'Courier New', monospace;
  color: var(--color-accent);
}

.mr-xs {
  margin-right: var(--spacing-xs);
}

/* Logout */
.logout-section {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 600px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
  }

  .profile-roles {
    justify-content: center;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .detail-value {
    text-align: left;
  }
}
</style>
