<template>
  <div class="home-page">
    <AppNavbar />

    <section class="hero">
      <div class="hero-backdrop"></div>
      <div class="container hero-layout">
        <div class="hero-copy">
          <div class="hero-kicker">
            <AppIcon name="sparkles" size="16" />
            <span>MTTS 2026 · Registro y accesos</span>
          </div>

          <h1 class="hero-title">
            Una experiencia de registro clara,
            <span>profesional y lista para evento.</span>
          </h1>

          <p class="hero-subtitle">
            Centraliza credenciales, agenda y codigos QR en una plataforma sobria,
            rapida y pensada para asistentes, staff y organizadores.
          </p>

          <div class="hero-actions">
            <RouterLink
              v-if="!isAuthenticated"
              to="/login"
              class="btn btn-primary btn-lg"
              id="hero-btn-login"
            >
              <AppIcon name="key" size="18" />
              <span>Acceder a mi cuenta</span>
            </RouterLink>
            <RouterLink
              v-else
              to="/dashboard/mis-qrs"
              class="btn btn-primary btn-lg"
              id="hero-btn-dashboard"
            >
              <AppIcon name="qr" size="18" />
              <span>Ver mis QRs</span>
            </RouterLink>
            <a href="#overview" class="btn btn-ghost btn-lg">
              <AppIcon name="grid" size="18" />
              <span>Explorar plataforma</span>
            </a>
          </div>

          <div class="hero-metrics">
            <div v-for="metric in metrics" :key="metric.label" class="metric-card">
              <span class="metric-value">{{ metric.value }}</span>
              <span class="metric-label">{{ metric.label }}</span>
            </div>
          </div>
        </div>

        <div class="hero-panel glass">
          <div class="panel-topline">
            <span class="panel-tag">Panel principal</span>
            <span class="panel-status">
              <AppIcon name="check-circle" size="14" />
              <span>Operativo</span>
            </span>
          </div>

          <div class="panel-preview">
            <div class="preview-sidebar">
              <span class="preview-dot active"></span>
              <span class="preview-dot"></span>
              <span class="preview-dot"></span>
            </div>

            <div class="preview-content">
              <div class="preview-card featured">
                <div class="preview-card-copy">
                  <p class="preview-label">Acceso del asistente</p>
                  <h3>QR listo para validacion</h3>
                  <p>Disponible para descarga y control en sitio.</p>
                </div>
                <div class="preview-qr">
                  <div class="qr-grid">
                    <span v-for="cell in 25" :key="cell"></span>
                  </div>
                </div>
              </div>

              <div class="preview-strip">
                <div class="preview-stat">
                  <AppIcon name="calendar" size="16" />
                  <div>
                    <span>Agenda</span>
                    <strong>Sesiones activas</strong>
                  </div>
                </div>
                <div class="preview-stat">
                  <AppIcon name="shield" size="16" />
                  <div>
                    <span>Control</span>
                    <strong>Acceso seguro</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="overview-section" id="overview">
      <div class="container">
        <div class="section-heading">
          <span class="section-kicker">Como funciona</span>
          <h2 class="section-title">Un flujo pensado para moverse rapido y verse serio.</h2>
        </div>

        <div class="steps-grid">
          <article v-for="step in steps" :key="step.id" class="step-card card">
            <div class="step-head">
              <span class="step-id">{{ step.id }}</span>
              <div class="step-icon">
                <AppIcon :name="step.icon" size="20" />
              </div>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="container feature-layout">
        <div class="feature-intro">
          <span class="section-kicker">Capacidades</span>
          <h2 class="section-title">Todo lo necesario para una operacion ordenada.</h2>
          <p>
            La interfaz prioriza lectura, estados claros y acciones directas para que
            el acceso al evento no se sienta improvisado.
          </p>
        </div>

        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <AppIcon :name="feature.icon" size="18" />
            </div>
            <div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="partners-section">
      <div class="container">
        <div class="partners-header">
          <span class="section-kicker">Organizacion y aliados</span>
        </div>
        <div class="logos-grid">
          <img :src="epnLogo" alt="EPN" class="sponsor-logo" />
          <img :src="mttsLogo" alt="MTTS" class="sponsor-logo" />
          <img :src="ieeeLogo" alt="IEEE" class="sponsor-logo" />
          <img :src="ecuadorSeccLogo" alt="IEEE Ecuador Section" class="sponsor-logo" />
          <img :src="bpcLogo" alt="BPC" class="sponsor-logo" />
          <img :src="quitoLogo" alt="Quito" class="sponsor-logo" />
          <img :src="quitomeetingsLogo" alt="Quito Meetings" class="sponsor-logo" />
          <img :src="seccionLogo" alt="Seccion" class="sponsor-logo" />
          <img :src="textLogo" alt="Text" class="sponsor-logo" />
          <img :src="textoLogo" alt="Texto" class="sponsor-logo" />
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <div class="cta-card glass">
          <div>
            <span class="section-kicker">Acceso inmediato</span>
            <h2 class="section-title">Ingresa y gestiona tus credenciales sin friccion.</h2>
          </div>
          <RouterLink
            v-if="!isAuthenticated"
            to="/login"
            class="btn btn-primary btn-lg"
            id="cta-btn-login"
          >
            <AppIcon name="key" size="18" />
            <span>Iniciar sesion</span>
          </RouterLink>
          <RouterLink
            v-else
            to="/dashboard/mis-qrs"
            class="btn btn-primary btn-lg"
            id="cta-btn-dashboard"
          >
            <AppIcon name="qr" size="18" />
            <span>Ir a mis QRs</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="logo-mark small">M</div>
          <div>
            <strong>MTTS Eventos</strong>
            <p>Plataforma de registro y validacion digital</p>
          </div>
        </div>
        <p class="footer-copy">© {{ currentYear }} MTTS. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

import epnLogo from '@/assets/EPN.svg'
import mttsLogo from '@/assets/mtts.svg'
import ieeeLogo from '@/assets/ieee.svg'
import ecuadorSeccLogo from '@/assets/EcuadorSecc.svg'
import bpcLogo from '@/assets/bpc.svg'
import quitoLogo from '@/assets/quito.svg'
import quitomeetingsLogo from '@/assets/quitomeetings.svg'
import seccionLogo from '@/assets/seccion.svg'
import textLogo from '@/assets/text.svg'
import textoLogo from '@/assets/texto.svg'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentYear = new Date().getFullYear()

const metrics = [
  { value: '01', label: 'Cuenta unica' },
  { value: 'QR', label: 'Validacion digital' },
  { value: '24/7', label: 'Acceso disponible' },
]

const steps = [
  {
    id: '01',
    icon: 'key',
    title: 'Inicia sesion',
    desc: 'Accede con tus credenciales y entra a un espacio personal con tus accesos y datos.',
  },
  {
    id: '02',
    icon: 'qr',
    title: 'Consulta tus codigos',
    desc: 'Visualiza cada QR asignado con su estado, vigencia y detalle de uso.',
  },
  {
    id: '03',
    icon: 'download',
    title: 'Descarga y presenta',
    desc: 'Lleva tus accesos al evento en el telefono o descargalos para respaldo inmediato.',
  },
]

const features = [
  {
    icon: 'shield',
    title: 'Acceso seguro',
    desc: 'Gestion de sesion y permisos con una interfaz clara y confiable.',
  },
  {
    icon: 'ticket',
    title: 'Credenciales por actividad',
    desc: 'Cada codigo responde a un uso concreto dentro de la operacion del evento.',
  },
  {
    icon: 'calendar',
    title: 'Agenda integrada',
    desc: 'Las actividades disponibles conviven con tus accesos en un mismo flujo.',
  },
  {
    icon: 'refresh',
    title: 'Estados actualizados',
    desc: 'Disponibilidad, uso y validez visibles sin pasos extra.',
  },
]
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero {
  position: relative;
  padding: 4rem 0 3rem;
  overflow: hidden;
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 15%, rgba(0, 169, 224, 0.15), transparent 24%),
    radial-gradient(circle at 80% 22%, rgba(226, 0, 26, 0.12), transparent 18%);
  pointer-events: none;
}

.hero-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 2rem;
  align-items: center;
}

.hero-kicker,
.section-kicker,
.panel-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.hero-title,
.section-title {
  font-size: clamp(2.8rem, 5vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  margin: 1.25rem 0 1rem;
}

.hero-title span {
  display: block;
  color: #8cdfff;
}

.hero-subtitle,
.feature-intro p {
  max-width: 620px;
  color: var(--color-text-secondary);
  font-size: 1.05rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 2rem 0;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  max-width: 640px;
}

.metric-card {
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.metric-label {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-panel {
  padding: 1.2rem;
  border-radius: 1.8rem;
}

.panel-topline,
.panel-status {
  display: flex;
  align-items: center;
}

.panel-topline {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-status {
  gap: 0.35rem;
  color: #8cdfff;
  font-size: 0.82rem;
}

.panel-preview {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 1rem;
}

.preview-sidebar {
  min-height: 100%;
  padding: 1rem;
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.preview-dot.active {
  width: 34px;
  background: linear-gradient(90deg, #00a9e0, #51d9ff);
}

.preview-content {
  display: grid;
  gap: 0.9rem;
}

.preview-card {
  border-radius: 1.35rem;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-card.featured {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 1rem;
  align-items: center;
}

.preview-label {
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  margin-bottom: 0.45rem;
}

.preview-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.35rem;
}

.preview-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.preview-qr {
  aspect-ratio: 1;
  border-radius: 1.1rem;
  background: #f5f7fb;
  padding: 0.85rem;
}

.qr-grid {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
}

.qr-grid span {
  border-radius: 0.22rem;
  background: #0d1b2c;
}

.qr-grid span:nth-child(2n) {
  opacity: 0.2;
}

.preview-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.preview-stat,
.feature-card {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.preview-stat {
  padding: 1rem;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.04);
}

.preview-stat span,
.feature-card p,
.step-card p,
.footer-brand p,
.footer-copy {
  color: var(--color-text-secondary);
}

.preview-stat strong {
  display: block;
  margin-top: 0.1rem;
  font-size: 0.95rem;
}

.overview-section,
.feature-section,
.partners-section,
.cta-section {
  padding: 2.5rem 0 1.5rem;
}

.section-heading,
.partners-header {
  margin-bottom: 1.6rem;
}

.section-title {
  font-size: clamp(2rem, 3vw, 3.2rem);
  margin-top: 0.85rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.step-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-id {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
}

.step-icon,
.feature-icon {
  width: 42px;
  height: 42px;
  border-radius: 1rem;
  background: rgba(0, 169, 224, 0.12);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-layout {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 1.25rem;
  align-items: start;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.15rem;
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.feature-card h3 {
  margin-bottom: 0.3rem;
}

.logos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 1rem;
  align-items: center;
}

.sponsor-logo {
  width: 100%;
  max-height: 58px;
  object-fit: contain;
  filter: grayscale(1) brightness(1.8);
  opacity: 0.85;
}

.cta-card {
  border-radius: 1.8rem;
  padding: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer {
  padding: 2.5rem 0 3rem;
}

.footer-inner,
.footer-brand {
  display: flex;
  align-items: center;
}

.footer-inner {
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-brand {
  gap: 0.9rem;
}

.logo-mark.small {
  width: 38px;
  height: 38px;
}

@media (max-width: 1024px) {
  .hero-layout,
  .feature-layout,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    max-width: 720px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding-top: 2rem;
  }

  .hero-metrics,
  .feature-grid,
  .preview-strip {
    grid-template-columns: 1fr;
  }

  .preview-card.featured {
    grid-template-columns: 1fr;
  }

  .panel-preview {
    grid-template-columns: 1fr;
  }

  .preview-sidebar {
    flex-direction: row;
  }

  .cta-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
