<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="auth-aside">
        <RouterLink to="/" class="auth-logo" id="login-logo-link">
          <div class="logo-mark">M</div>
          <div>
            <strong>MTTS Eventos</strong>
            <span>Registro y validacion digital</span>
          </div>
        </RouterLink>

        <div class="auth-copy">
          <span class="auth-kicker">Acceso privado</span>
          <h1>Una entrada limpia para una operacion seria.</h1>
          <p>
            Ingresa para consultar tus codigos QR, revisar la agenda y gestionar tu
            cuenta desde un panel unificado.
          </p>
        </div>

        <div class="auth-points">
          <div class="auth-point" v-for="point in points" :key="point.title">
            <div class="point-icon">
              <AppIcon :name="point.icon" size="18" />
            </div>
            <div>
              <strong>{{ point.title }}</strong>
              <p>{{ point.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="auth-card glass">
        <div class="auth-card-header">
          <span class="auth-kicker">Iniciar sesion</span>
          <h2>Bienvenido de vuelta</h2>
          <p>Usa tus credenciales registradas para entrar al panel.</p>
        </div>

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
            <span v-if="errors.email" class="form-error">
              <AppIcon name="warning" size="14" />
              <span>{{ errors.email }}</span>
            </span>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Contrasena</label>
            <div class="input-wrap">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="Ingresa tu contrasena"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="input-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'"
                id="login-toggle-password"
              >
                <AppIcon :name="showPassword ? 'x' : 'info'" size="16" />
              </button>
            </div>
            <span v-if="errors.password" class="form-error">
              <AppIcon name="warning" size="14" />
              <span>{{ errors.password }}</span>
            </span>
          </div>

          <div class="form-options">
            <RouterLink to="/forgot-password" class="forgot-link" id="login-forgot-link">
              Recuperar acceso
            </RouterLink>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full btn-lg"
            :disabled="loading"
            id="login-submit-btn"
          >
            <span v-if="!loading">
              <AppIcon name="key" size="18" />
              <span>Ingresar</span>
            </span>
            <span v-else class="flex items-center gap-sm">
              <div class="spinner spinner-sm"></div>
              <span>Verificando...</span>
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-sm text-muted">
            Si necesitas ayuda, escribe a
            <a href="mailto:soporte@mtts.ec" class="text-accent">soporte@mtts.ec</a>
          </p>
        </div>

        <RouterLink to="/" class="back-link" id="login-back-home">
          <AppIcon name="chevron-left" size="16" />
          <span>Volver al inicio</span>
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

const points = [
  {
    icon: 'qr',
    title: 'Codigos QR personales',
    desc: 'Todos tus accesos reunidos en una sola vista.',
  },
  {
    icon: 'calendar',
    title: 'Agenda vinculada',
    desc: 'Consulta actividades sin salir del entorno de registro.',
  },
  {
    icon: 'shield',
    title: 'Control y seguridad',
    desc: 'Estados claros para uso, vigencia y validacion.',
  },
]

function validate() {
  errors.email = ''
  errors.password = ''

  let valid = true

  if (!form.email) {
    errors.email = 'El email es requerido'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un email valido'
    valid = false
  }

  if (!form.password) {
    errors.password = 'La contrasena es requerida'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Minimo 6 caracteres'
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
      errorMsg.value = 'Email o contrasena incorrectos'
    } else if (status === 403) {
      errorMsg.value = 'Tu cuenta esta suspendida. Contacta a soporte.'
    } else {
      errorMsg.value = err?.response?.data?.message ?? 'No fue posible iniciar sesion. Intentalo otra vez.'
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
  padding: 1.5rem;
}

.auth-shell {
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 460px);
  gap: 1.25rem;
  align-items: stretch;
}

.auth-aside,
.auth-card {
  border-radius: 2rem;
}

.auth-aside {
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(0, 169, 224, 0.18), transparent 25%),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 680px;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  color: var(--color-text-primary);
}

.logo-mark {
  width: 46px;
  height: 46px;
  border-radius: 1rem;
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.25), rgba(0, 98, 155, 0.94));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.auth-logo strong,
.auth-point strong {
  display: block;
}

.auth-logo span,
.auth-point p,
.auth-copy p,
.auth-card-header p {
  color: var(--color-text-secondary);
}

.auth-kicker {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #8cdfff;
}

.auth-copy h1 {
  font-size: clamp(2.5rem, 5vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
}

.auth-copy p {
  max-width: 560px;
  font-size: 1.02rem;
}

.auth-points {
  display: grid;
  gap: 0.9rem;
  max-width: 560px;
}

.auth-point {
  padding: 1rem 1.1rem;
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}

.point-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.95rem;
  background: rgba(0, 169, 224, 0.12);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-card-header {
  margin-bottom: 1.5rem;
}

.auth-card-header h2 {
  font-size: 2rem;
  margin-bottom: 0.45rem;
  letter-spacing: -0.03em;
}

.input-wrap {
  position: relative;
}

.input-wrap .form-input {
  padding-right: 3rem;
}

.input-toggle {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin: -0.4rem 0 1.2rem;
}

.forgot-link {
  font-size: 0.92rem;
  font-weight: 600;
}

.btn span {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.auth-footer {
  margin-top: 1.2rem;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.2rem;
  color: var(--color-text-muted);
  align-self: center;
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-aside {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .auth-aside,
  .auth-card {
    padding: 1.35rem;
    border-radius: 1.5rem;
  }
}
</style>
