<template>
  <div class="auth-page">
    <div class="auth-container">
      <RouterLink to="/" class="auth-logo">
        <div class="logo-icon">M</div>
        <span>MTTS <span class="logo-accent">Eventos</span></span>
      </RouterLink>

      <div class="auth-card glass">
        <div v-if="step === 1">
          <div class="auth-card-header">
            <div class="step-icon-wrap">
              <AppIcon name="mail" size="24" />
            </div>
            <h1 class="auth-title">Recuperar acceso</h1>
            <p class="auth-subtitle">Ingresa tu email y enviaremos un codigo de 6 digitos.</p>
          </div>

          <Transition name="fade">
            <AlertMessage v-if="successMsg" :message="successMsg" type="success" class="mb-lg" />
            <AlertMessage v-else-if="errorMsg" :message="errorMsg" type="error" dismissible @dismiss="errorMsg = ''" class="mb-lg" />
          </Transition>

          <form @submit.prevent="requestCode" id="forgot-form">
            <div class="form-group">
              <label class="form-label" for="forgot-email">Email registrado</label>
              <input
                id="forgot-email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="tu@email.com"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading" id="forgot-submit-btn">
              <span v-if="!loading">
                <AppIcon name="mail" size="18" />
                <span>Enviar codigo</span>
              </span>
              <span v-else class="flex items-center gap-sm"><div class="spinner spinner-sm"></div> Enviando...</span>
            </button>
          </form>
        </div>

        <div v-if="step === 2">
          <div class="auth-card-header">
            <div class="step-icon-wrap">
              <AppIcon name="shield" size="24" />
            </div>
            <h1 class="auth-title">Nueva contrasena</h1>
            <p class="auth-subtitle">Ingresa el codigo recibido y define tu nueva contrasena.</p>
          </div>

          <Transition name="fade">
            <AlertMessage v-if="errorMsg" :message="errorMsg" type="error" dismissible @dismiss="errorMsg = ''" class="mb-lg" />
          </Transition>

          <form @submit.prevent="resetPassword" id="reset-form">
            <div class="form-group">
              <label class="form-label" for="reset-code">Codigo de 6 digitos</label>
              <input
                id="reset-code"
                v-model="code"
                type="text"
                class="form-input"
                placeholder="123456"
                maxlength="6"
                inputmode="numeric"
                pattern="[0-9]{6}"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="reset-password">Nueva contrasena</label>
              <input
                id="reset-password"
                v-model="newPassword"
                type="password"
                class="form-input"
                placeholder="Minimo 8 caracteres"
                minlength="8"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="reset-confirm">Confirmar contrasena</label>
              <input
                id="reset-confirm"
                v-model="confirmPassword"
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
            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading" id="reset-submit-btn">
              <span v-if="!loading">
                <AppIcon name="check-circle" size="18" />
                <span>Cambiar contrasena</span>
              </span>
              <span v-else class="flex items-center gap-sm"><div class="spinner spinner-sm"></div> Cambiando...</span>
            </button>
          </form>

          <button class="btn btn-ghost btn-full mt-md" @click="step = 1" id="reset-back-btn">
            <AppIcon name="chevron-left" size="16" />
            <span>Volver</span>
          </button>
        </div>

        <div v-if="step === 3" class="success-step">
          <div class="success-icon">
            <AppIcon name="check-circle" size="40" />
          </div>
          <h2 class="auth-title">Contrasena actualizada</h2>
          <p class="auth-subtitle">Ya puedes iniciar sesion con tu nueva credencial.</p>
          <RouterLink to="/login" class="btn btn-primary btn-full btn-lg mt-xl" id="success-goto-login">
            Ir al inicio de sesion
          </RouterLink>
        </div>

        <div class="auth-footer">
          <RouterLink to="/login" class="back-link" id="forgot-back-login">
            <AppIcon name="chevron-left" size="16" />
            <span>Volver al login</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import authApi from '@/api/auth.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const confirmError = computed(() => confirmPassword.value.length > 0 && confirmPassword.value !== newPassword.value)

async function requestCode() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const res = await authApi.requestPasswordRecovery(email.value)
    successMsg.value = res.message ?? 'Codigo enviado. Revisa tu bandeja de entrada.'
    setTimeout(() => {
      step.value = 2
    }, 1500)
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'Error al enviar el codigo'
  } finally {
    loading.value = false
  }
}

async function resetPassword() {
  if (confirmError.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    await authApi.resetPassword(email.value, code.value, newPassword.value)
    step.value = 3
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'Codigo invalido o expirado'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.auth-container {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--gradient-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.logo-accent {
  color: var(--color-accent);
}

.auth-card {
  width: 100%;
  padding: var(--spacing-2xl);
}

.auth-card-header {
  margin-bottom: var(--spacing-xl);
}

.step-icon-wrap,
.success-icon {
  width: 54px;
  height: 54px;
  border-radius: 1rem;
  background: rgba(0, 169, 224, 0.12);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin-bottom: var(--spacing-xs);
}

.auth-subtitle {
  color: var(--color-text-secondary);
}

.btn span,
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.success-step {
  text-align: center;
}

.success-icon {
  margin: 0 auto var(--spacing-lg);
}

.auth-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.back-link {
  color: var(--color-text-muted);
}
</style>
