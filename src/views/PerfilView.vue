<template>
  <div class="perfil-page">
    <section class="profile-hero card">
      <div class="profile-identity">
        <div class="profile-avatar">{{ userInitial }}</div>
        <div>
          <span class="profile-kicker">Cuenta personal</span>
          <h1>{{ user?.nombre }}</h1>
          <p>{{ user?.email }}</p>
        </div>
      </div>

      <div class="profile-roles">
        <span class="badge badge-accent" v-for="role in displayRoles" :key="role">
          {{ role }}
        </span>
      </div>
    </section>

    <section class="details-grid">
      <article class="card">
        <h2 class="section-title">Informacion de cuenta</h2>
        <div class="detail-list">
          <div class="detail-row">
            <span>Nombre completo</span>
            <strong>{{ user?.nombre }}</strong>
          </div>
          <div class="detail-row">
            <span>Email</span>
            <strong>{{ user?.email }}</strong>
          </div>
          <div class="detail-row">
            <span>ID de usuario</span>
            <strong class="detail-code">#{{ user?.idUsuario }}</strong>
          </div>
          <div class="detail-row">
            <span>Roles</span>
            <div class="detail-badges">
              <span class="badge badge-accent" v-for="role in displayRoles" :key="role">{{ role }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="card">
        <h2 class="section-title">Cambiar contrasena</h2>

        <Transition name="fade">
          <AlertMessage v-if="pwdSuccess" message="Contrasena actualizada correctamente" type="success" class="mb-lg" />
          <AlertMessage v-else-if="pwdError" :message="pwdError" type="error" dismissible @dismiss="pwdError = ''" class="mb-lg" />
        </Transition>

        <form @submit.prevent="changePassword" id="change-password-form">
          <div class="form-group">
            <label class="form-label" for="pwd-actual">Contrasena actual</label>
            <input
              id="pwd-actual"
              v-model="pwdForm.currentPassword"
              type="password"
              class="form-input"
              placeholder="Tu contrasena actual"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="pwd-nueva">Nueva contrasena</label>
            <input
              id="pwd-nueva"
              v-model="pwdForm.newPassword"
              type="password"
              class="form-input"
              placeholder="Minimo 8 caracteres"
              minlength="8"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="pwd-confirm">Confirmar nueva contrasena</label>
            <input
              id="pwd-confirm"
              v-model="pwdForm.confirm"
              type="password"
              class="form-input"
              :class="{ error: confirmError }"
              placeholder="Repite la contrasena"
              required
            />
            <span v-if="confirmError" class="form-error">
              <AppIcon name="warning" size="14" />
              <span>Las contrasenas no coinciden</span>
            </span>
          </div>
          <button
            type="submit"
            class="btn btn-secondary"
            :disabled="pwdLoading || confirmError"
            id="btn-change-password"
          >
            <span v-if="!pwdLoading">
              <AppIcon name="shield" size="16" />
              <span>Actualizar contrasena</span>
            </span>
            <span v-else class="flex items-center gap-sm">
              <div class="spinner spinner-sm"></div>
              <span>Guardando...</span>
            </span>
          </button>
        </form>
      </article>
    </section>

    <div class="logout-section">
      <button
        class="btn btn-danger btn-lg"
        @click="handleLogout"
        :disabled="logoutLoading"
        id="perfil-logout-btn"
      >
        <AppIcon name="logout" size="18" />
        <span>{{ logoutLoading ? 'Cerrando sesion...' : 'Cerrar sesion' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import authApi from '@/api/auth.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter()

const user = computed(() => authStore.user)
const userInitial = computed(() => user.value?.nombre?.charAt(0).toUpperCase() ?? '?')
const displayRoles = computed(() => authStore.displayRoles)

const pwdForm = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref(false)

const confirmError = computed(() => pwdForm.confirm.length > 0 && pwdForm.confirm !== pwdForm.newPassword)

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
    setTimeout(() => {
      pwdSuccess.value = false
    }, 4000)
  } catch (err: any) {
    pwdError.value = err?.response?.data?.message ?? 'Error al cambiar la contrasena'
  } finally {
    pwdLoading.value = false
  }
}

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
  display: grid;
  gap: 1rem;
  animation: fadeIn 0.4s ease;
}

.profile-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.profile-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 1.35rem;
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.34), rgba(0, 98, 155, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
}

.profile-kicker {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #8cdfff;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.76rem;
}

.profile-identity h1,
.section-title {
  letter-spacing: -0.03em;
}

.profile-identity h1 {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  margin-bottom: 0.2rem;
}

.profile-identity p {
  color: var(--color-text-secondary);
}

.profile-roles,
.detail-badges {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.detail-list {
  display: grid;
  gap: 0.9rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-row span {
  color: var(--color-text-muted);
}

.detail-row strong {
  text-align: right;
}

.detail-code {
  color: #8cdfff;
  font-family: 'Courier New', monospace;
}

.btn span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-section {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 900px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-hero,
  .profile-identity,
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row strong {
    text-align: left;
  }
}
</style>
