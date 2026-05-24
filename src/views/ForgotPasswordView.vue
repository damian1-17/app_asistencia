<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="auth-orb orb-1"></div>
      <div class="auth-orb orb-2"></div>
    </div>

    <div class="auth-container">
      <RouterLink to="/" class="auth-logo">
        <div class="logo-icon">M</div>
        <span>MTTS <span class="logo-accent">Eventos</span></span>
      </RouterLink>

      <div class="auth-card glass">
        <!-- Step 1: Solicitar código -->
        <div v-if="step === 1">
          <div class="auth-card-header">
            <div class="step-icon-wrap">📧</div>
            <h1 class="auth-title">Recuperar acceso</h1>
            <p class="auth-subtitle">Ingresa tu email y te enviaremos un código de 6 dígitos</p>
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
              <span v-if="!loading">📨 Enviar código</span>
              <span v-else class="flex items-center gap-sm"><div class="spinner spinner-sm"></div> Enviando...</span>
            </button>
          </form>
        </div>

        <!-- Step 2: Resetear contraseña -->
        <div v-if="step === 2">
          <div class="auth-card-header">
            <div class="step-icon-wrap">🔐</div>
            <h1 class="auth-title">Nueva contraseña</h1>
            <p class="auth-subtitle">Ingresa el código recibido y tu nueva contraseña</p>
          </div>

          <Transition name="fade">
            <AlertMessage v-if="errorMsg" :message="errorMsg" type="error" dismissible @dismiss="errorMsg = ''" class="mb-lg" />
          </Transition>

          <form @submit.prevent="resetPassword" id="reset-form">
            <div class="form-group">
              <label class="form-label" for="reset-code">Código de 6 dígitos</label>
              <input
                id="reset-code"
                v-model="codigo"
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
              <label class="form-label" for="reset-password">Nueva contraseña</label>
              <input
                id="reset-password"
                v-model="nuevaPassword"
                type="password"
                class="form-input"
                placeholder="Mínimo 8 caracteres"
                minlength="8"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="reset-confirm">Confirmar contraseña</label>
              <input
                id="reset-confirm"
                v-model="confirmPassword"
                type="password"
                class="form-input"
                :class="{ error: confirmError }"
                placeholder="Repite la contraseña"
                required
              />
              <span v-if="confirmError" class="form-error">⚠ Las contraseñas no coinciden</span>
            </div>
            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading" id="reset-submit-btn">
              <span v-if="!loading">✅ Cambiar contraseña</span>
              <span v-else class="flex items-center gap-sm"><div class="spinner spinner-sm"></div> Cambiando...</span>
            </button>
          </form>

          <button class="btn btn-ghost btn-full mt-md" @click="step = 1" id="reset-back-btn">← Volver</button>
        </div>

        <!-- Step 3: Éxito -->
        <div v-if="step === 3" class="success-step">
          <div class="success-icon">🎉</div>
          <h2 class="auth-title">¡Contraseña cambiada!</h2>
          <p class="auth-subtitle">Ya puedes iniciar sesión con tu nueva contraseña</p>
          <RouterLink to="/login" class="btn btn-primary btn-full btn-lg mt-xl" id="success-goto-login">
            Ir al inicio de sesión
          </RouterLink>
        </div>

        <div class="auth-footer">
          <RouterLink to="/login" class="back-link" id="forgot-back-login">← Volver al login</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import authApi from '@/api/auth.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'

const step = ref(1)
const email = ref('')
const codigo = ref('')
const nuevaPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const confirmError = computed(
  () => confirmPassword.value.length > 0 && confirmPassword.value !== nuevaPassword.value,
)

async function requestCode() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await authApi.requestPasswordRecovery(email.value)
    successMsg.value = res.message ?? 'Código enviado. Revisa tu bandeja de entrada.'
    setTimeout(() => { step.value = 2 }, 1500)
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'Error al enviar el código'
  } finally {
    loading.value = false
  }
}

async function resetPassword() {
  if (confirmError.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await authApi.resetPassword(email.value, codigo.value, nuevaPassword.value)
    step.value = 3
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'Código inválido o expirado'
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
  position: relative;
  overflow: hidden;
  padding: var(--spacing-xl);
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
  top: -150px;
  left: -100px;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
  bottom: -100px;
  right: -50px;
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  animation: slideInUp 0.5s ease;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 0 20px var(--color-accent-glow);
}

.logo-accent {
  color: var(--color-accent);
}

.auth-card {
  width: 100%;
  padding: var(--spacing-2xl);
}

.step-icon-wrap {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.auth-card-header {
  margin-bottom: var(--spacing-xl);
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin-bottom: var(--spacing-xs);
}

.auth-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.success-step {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  animation: float 3s ease-in-out infinite;
  display: block;
}

.auth-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.back-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-accent);
}
</style>
