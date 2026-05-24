<template>
  <div class="home-page">
    <AppNavbar />

    <!-- Hero Section -->
    <section class="hero" id="inicio">
      <div class="hero-bg">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-grid"></div>
      </div>

      <div class="container hero-content">
        <div class="hero-badge">
          <span class="badge badge-accent">🎯 MTTS 2026</span>
        </div>
        <h1 class="hero-title">
          Tu acceso al
          <span class="gradient-text">Evento</span>
          en un QR
        </h1>
        <p class="hero-subtitle">
          Gestiona tu registro, descarga tus códigos QR personalizados y
          consulta la agenda completa del evento MTTS de forma rápida y segura.
        </p>
        <div class="hero-actions">
          <RouterLink
            v-if="!isAuthenticated"
            to="/login"
            class="btn btn-primary btn-lg"
            id="hero-btn-login"
          >
            🔑 Acceder a mi cuenta
          </RouterLink>
          <RouterLink
            v-else
            to="/dashboard/mis-qrs"
            class="btn btn-primary btn-lg"
            id="hero-btn-dashboard"
          >
            📱 Ver mis QRs
          </RouterLink>
          <a href="#info" class="btn btn-ghost btn-lg">
            Más información ↓
          </a>
        </div>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">2026</span>
            <span class="stat-label">Edición</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">Digital</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">QR</span>
            <span class="stat-label">Personal</span>
          </div>
        </div>
      </div>

      <!-- Floating QR mockup -->
      <div class="hero-visual">
        <div class="qr-mockup">
          <div class="mockup-card">
            <div class="mockup-header">
              <div class="mockup-dot red"></div>
              <div class="mockup-dot yellow"></div>
              <div class="mockup-dot green"></div>
            </div>
            <div class="mockup-qr">
              <div class="qr-pattern">
                <div class="qr-corner tl"></div>
                <div class="qr-corner tr"></div>
                <div class="qr-corner bl"></div>
                <div class="qr-cells"></div>
              </div>
            </div>
            <p class="mockup-label">Mi QR del Evento</p>
            <div class="mockup-badge">✓ Válido</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Info section -->
    <section class="info-section" id="info">
      <div class="container">
        <div class="section-header">
          <span class="badge badge-accent mb-md">¿Cómo funciona?</span>
          <h2 class="section-title">Tu experiencia en 3 pasos</h2>
          <p class="section-subtitle">Proceso simple y seguro para acceder al evento</p>
        </div>

        <div class="steps-grid">
          <div class="step-card" v-for="step in steps" :key="step.id">
            <div class="step-number">{{ step.id }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <span class="badge badge-accent mb-md">Funcionalidades</span>
          <h2 class="section-title">Todo lo que necesitas</h2>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="feat in features" :key="feat.title">
            <div class="feature-icon">{{ feat.icon }}</div>
            <div>
              <h3 class="feature-title">{{ feat.title }}</h3>
              <p class="feature-desc">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card glass">
          <div class="cta-orb"></div>
          <h2 class="cta-title">¿Listo para el evento?</h2>
          <p class="cta-subtitle">Inicia sesión y descarga tus QRs ahora</p>
          <RouterLink
            v-if="!isAuthenticated"
            to="/login"
            class="btn btn-primary btn-lg"
            id="cta-btn-login"
          >
            Iniciar sesión →
          </RouterLink>
          <RouterLink
            v-else
            to="/dashboard/mis-qrs"
            class="btn btn-primary btn-lg"
            id="cta-btn-dashboard"
          >
            Ver mis QRs →
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-logo">
          <div class="logo-icon">M</div>
          <span>MTTS Eventos</span>
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

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentYear = new Date().getFullYear()

const steps = [
  {
    id: '01',
    icon: '🔑',
    title: 'Inicia sesión',
    desc: 'Accede con tu email y contraseña registrados en el sistema del evento.',
  },
  {
    id: '02',
    icon: '📱',
    title: 'Ve tus QRs',
    desc: 'Encuentra todos tus códigos QR personalizados para cada actividad del evento.',
  },
  {
    id: '03',
    icon: '⬇',
    title: 'Descarga y presenta',
    desc: 'Descarga como imagen PNG y preséntalo al staff para validación en el evento.',
  },
]

const features = [
  {
    icon: '🔒',
    title: 'Acceso seguro',
    desc: 'Autenticación con tokens JWT seguros gestionados automáticamente.',
  },
  {
    icon: '📲',
    title: 'QR Personal',
    desc: 'Cada asistente tiene sus propios códigos únicos e intransferibles.',
  },
  {
    icon: '⬇',
    title: 'Descarga PNG',
    desc: 'Descarga tus QRs como imagen para tenerlos siempre disponibles.',
  },
  {
    icon: '📅',
    title: 'Agenda del evento',
    desc: 'Consulta todas las actividades y sesiones disponibles en el evento.',
  },
  {
    icon: '✅',
    title: 'Estado en tiempo real',
    desc: 'Visualiza si tu QR ha sido usado o sigue disponible.',
  },
  {
    icon: '📧',
    title: 'Recuperación de cuenta',
    desc: 'Recupera tu acceso fácilmente mediante código enviado a tu email.',
  },
]
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ─── HERO ─────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: var(--spacing-3xl) 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
  top: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
  bottom: -50px;
  right: 10%;
  animation: float 10s ease-in-out infinite reverse;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  animation: slideInUp 0.8s ease;
}

.hero-badge {
  margin-bottom: var(--spacing-lg);
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.gradient-text {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--spacing-2xl);
  max-width: 560px;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-3xl);
}

/* Stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-accent);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border-subtle);
}

/* Hero visual */
.hero-visual {
  position: absolute;
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  animation: float 6s ease-in-out infinite;
}

.mockup-card {
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  width: 240px;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(99,102,241,0.2);
}

.mockup-header {
  display: flex;
  gap: 6px;
  margin-bottom: var(--spacing-md);
}

.mockup-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mockup-dot.red    { background: #EF4444; }
.mockup-dot.yellow { background: #F59E0B; }
.mockup-dot.green  { background: #10B981; }

.mockup-qr {
  background: #F8FAFC;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.qr-pattern {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
}

.qr-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #0B0F1A;
  border-radius: 4px;
}

.qr-corner::after {
  content: '';
  position: absolute;
  inset: 6px;
  background: #0B0F1A;
  border-radius: 2px;
}

.qr-corner.tl { top: 0; left: 0; }
.qr-corner.tr { top: 0; right: 0; }
.qr-corner.bl { bottom: 0; left: 0; }

.qr-cells {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 12px,
      rgba(11,15,26,0.15) 12px,
      rgba(11,15,26,0.15) 14px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 12px,
      rgba(11,15,26,0.15) 12px,
      rgba(11,15,26,0.15) 14px
    );
}

.mockup-label {
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.mockup-badge {
  text-align: center;
  background: var(--color-success-light);
  color: var(--color-success);
  font-size: var(--font-size-xs);
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

/* ─── SECTIONS ──────────────────────────────────────── */
.section-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.section-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

/* Steps */
.info-section {
  padding: var(--spacing-3xl) 0;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.step-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.step-card:hover {
  border-color: var(--color-border);
  transform: translateY(-4px);
  box-shadow: var(--shadow-accent);
}

.step-number {
  font-size: var(--font-size-4xl);
  font-weight: 900;
  color: var(--color-accent);
  opacity: 0.2;
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  line-height: 1;
}

.step-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.step-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.step-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Features */
.features-section {
  padding: var(--spacing-3xl) 0;
  background: linear-gradient(180deg, transparent, rgba(99,102,241,0.03) 50%, transparent);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.feature-card:hover {
  border-color: var(--color-border);
  background: var(--color-bg-card);
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: var(--color-accent-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* CTA */
.cta-section {
  padding: var(--spacing-3xl) 0;
}

.cta-card {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.cta-orb {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(60px);
  pointer-events: none;
}

.cta-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  position: relative;
}

.cta-subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-lg);
  position: relative;
}

/* Footer */
.footer {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-subtle);
  padding: var(--spacing-xl) 0;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 700;
  font-size: var(--font-size-base);
}

.footer-copy {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 900px) {
  .hero-visual {
    display: none;
  }

  .hero {
    min-height: auto;
    padding: 5rem 0 3rem;
  }
}
</style>
