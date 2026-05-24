<template>
  <div class="auth-page">
    <!-- Background -->
    <div class="auth-bg">
      <div class="auth-orb orb-1"></div>
      <div class="auth-orb orb-2"></div>
      <div class="auth-grid"></div>
    </div>

    <div class="auth-container">
      <!-- Logo -->
      <RouterLink to="/" class="auth-logo" id="login-logo-link">
        <div class="logo-icon">M</div>
        <span>MTTS <span class="logo-accent">Eventos</span></span>
      </RouterLink>

      <!-- Card -->
      <div class="auth-card glass">
        <div class="auth-card-header">
          <h1 class="auth-title">Bienvenido</h1>
          <p class="auth-subtitle">Ingresa tus credenciales para acceder</p>
        </div>

        <!-- Alert -->
        <Transition name="fade">
          <AlertMessage
            v-if="errorMsg"
            :message="errorMsg"
            type="error"
            dismissible
            @dismiss="errorMsg = ''"
            class="mb-lg"
          />
        </Transition>

        <!-- Form -->
        <form @submit.prevent="handleLogin" id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">Email</label>
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="tu@email.com"
              autocomplete="email"
              required
            />
            <span v-if="errors.email" class="form-error">⚠ {{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Contraseña</label>
            <div class="input-wrap">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="input-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                id="login-toggle-password"
              >
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <span v-if="errors.password" class="form-error">⚠ {{ errors.password }}</span>
          </div>

          <div class="form-options">
            <RouterLink to="/forgot-password" class="forgot-link" id="login-forgot-link">
              ¿Olvidaste tu contraseña?
            </RouterLink>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full btn-lg"
            :disabled="loading"
            id="login-submit-btn"
          >
            <span v-if="!loading">🔑 Iniciar sesión</span>
            <span v-else class="flex items-center gap-sm">
              <div class="spinner spinner-sm"></div> Verificando...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-sm text-muted">
            ¿Problemas para acceder?
            <a href="mailto:soporte@mtts.ec" class="text-accent">Contactar soporte</a>
          </p>
        </div>
      </div>

      <RouterLink to="/" class="back-link" id="login-back-home">← Volver al inicio</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AlertMessage from '@/components/shared/AlertMessage.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.email) {
    errors.email = 'El email es requerido'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un email válido'
    valid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validate()) return
  errorMsg.value = ''
  loading.value = true

  try {
    await authStore.login(form.email, form.password)
    const redirect = (route.query.redirect as string) || '/dashboard/mis-qrs'
    router.push(redirect)
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      errorMsg.value = 'Email o contraseña incorrectos'
    } else if (status === 403) {
      errorMsg.value = 'Tu cuenta está suspendida. Contacta al soporte.'
    } else {
      errorMsg.value = err?.response?.data?.message ?? 'Error al iniciar sesión. Inténtalo de nuevo.'
    }
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
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
  bottom: -100px;
  left: -100px;
}

.auth-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
  background-size: 50px 50px;
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

/* Logo */
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

/* Card */
.auth-card {
  width: 100%;
  padding: var(--spacing-2xl);
}

.auth-card-header {
  margin-bottom: var(--spacing-xl);
}

.auth-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xs);
}

.auth-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Input wrap with toggle */
.input-wrap {
  position: relative;
}

.input-wrap .form-input {
  padding-right: 3rem;
}

.input-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  transition: opacity var(--transition-fast);
}

.input-toggle:hover {
  opacity: 0.7;
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
  margin-top: calc(-1 * var(--spacing-sm));
}

.forgot-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.auth-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.back-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-accent);
}
</style>
