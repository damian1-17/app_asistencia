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

    <!-- CRONOGRAMA SECTION -->
    <section class="cronograma-section" id="cronograma">
      <div class="container">
        <div class="section-heading text-center">
          <span class="section-kicker">Programación</span>
          <h2 class="section-title">Cronograma del Evento</h2>
          <p class="section-subtitle" style="margin: 0 auto; max-width: 600px;">
            Planifica tu jornada. Conoce los horarios, conferencias magistrales, paneles y talleres prácticos preparados para ti.
          </p>
        </div>

        <div class="timeline-container">
          <div class="timeline-line"></div>
          
          <template v-for="(item, index) in cronograma" :key="index">
            <!-- Day Divider if first item or day changed -->
            <div v-if="index === 0 || item.dia !== cronograma[index - 1].dia" class="timeline-day-divider">
              <span class="day-badge">{{ item.dia }}</span>
            </div>

            <div 
              class="timeline-item"
              :style="{ animationDelay: `${(index % 10) * 0.08}s` }"
            >
              <div class="timeline-dot-wrapper">
                <div class="timeline-dot">
                  <AppIcon :name="item.icon" size="16" />
                </div>
              </div>

              <div class="timeline-card card">
                <div class="timeline-card-header">
                  <div class="time-tag">
                    <AppIcon name="clock" size="14" />
                    <span>{{ item.hora }}</span>
                  </div>
                  <span class="badge" :class="item.badgeClass">{{ item.categoria }}</span>
                </div>
                <h3 class="timeline-card-title">{{ item.titulo }}</h3>
                <p class="timeline-card-desc">{{ item.desc }}</p>
              </div>
            </div>
          </template>
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
          <img :src="bpcLogo" alt="BPC" class="sponsor-logo" />
          <img :src="quitoLogo" alt="Quito" class="sponsor-logo" />
          <img :src="seccionLogo" alt="Seccion" class="sponsor-logo" />
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
import bpcLogo from '@/assets/bpc.svg'
import quitoLogo from '@/assets/quito_logo.svg'
import seccionLogo from '@/assets/seccion.svg'
import textoLogo from '@/assets/texto.svg'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentYear = new Date().getFullYear()

const cronograma = [
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '8:30 - 9:00',
    icon: 'ticket',
    titulo: 'Arrival and Registration',
    desc: 'Registro de asistentes y llegada al evento.',
    categoria: 'Registro',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:00 - 9:05',
    icon: 'sparkles',
    titulo: 'Welcome Remarks - Head of EPN',
    desc: 'Palabras de bienvenida por el Dr. Tarquino Sánchez, máxima autoridad de la EPN.',
    categoria: 'Apertura',
    badgeClass: 'badge-accent'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:05 - 9:10',
    icon: 'sparkles',
    titulo: 'Welcome Remarks - Academic Head',
    desc: 'Palabras de bienvenida por la Dra. Valentina Ramos, Directora Académica de la EPN.',
    categoria: 'Apertura',
    badgeClass: 'badge-accent'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:10 - 9:15',
    icon: 'sparkles',
    titulo: 'General Chair Welcome Remarks',
    desc: 'Intervención del Dr. Hernán Barba, General Chair del BPC Workshop.',
    categoria: 'Apertura',
    badgeClass: 'badge-accent'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:15 - 9:20',
    icon: 'user',
    titulo: 'Quito Meetings Representative',
    desc: 'Intervención del representante de la municipalidad de Quito.',
    categoria: 'Apertura',
    badgeClass: 'badge-accent'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:20 - 9:30',
    icon: 'sparkles',
    titulo: 'Welcome Remarks and Overview of IEEE MTT-S',
    desc: 'Presentación inicial del Dr. Anding Zhu, Presidente de MTT-S.',
    categoria: 'Apertura',
    badgeClass: 'badge-accent'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:30 - 9:55',
    icon: 'sparkles',
    titulo: 'Broadening Participation with RF to THz Technologies in the AI Era',
    desc: 'Charla inaugural por la Dra. Debabani Choudhury, Chair de MTT-S BPC.',
    categoria: 'Conferencia',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '9:55 - 10:05',
    icon: 'sparkles',
    titulo: 'Musical Interlude',
    desc: 'Presentación musical a cargo del EPN Music Ensemble.',
    categoria: 'Cultura',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '10:05 - 10:15',
    icon: 'grid',
    titulo: 'Official Photo Session',
    desc: 'Fotografía oficial de los asistentes y delegados del evento.',
    categoria: 'Networking',
    badgeClass: 'badge-warning'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '10:15 - 10:40',
    icon: 'sparkles',
    titulo: 'Keynote 1 - Powering the Future of Wireless',
    desc: 'Eficiencia y desafíos de linealidad en transmisores 6G, por el Dr. Anding Zhu.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '10:40 - 11:05',
    icon: 'sparkles',
    titulo: 'Keynote 2 - MHz to THz Technologies',
    desc: 'Perspectivas tecnológicas y nuestro lugar en el universo, por el Dr. Goutam Chattopadhyay (NASA JPL).',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '11:05 - 11:20',
    icon: 'clock',
    titulo: 'Coffee/Tea Break',
    desc: 'Pausa para café y relacionamiento entre los asistentes.',
    categoria: 'Break',
    badgeClass: 'badge-warning'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '11:20 - 12:05',
    icon: 'check-circle',
    titulo: 'Student Competition - 3MPC',
    desc: 'Competencia de presentaciones de tres minutos. 11 finalistas exponen frente al panel de jueces.',
    categoria: 'Competencia',
    badgeClass: 'badge-danger'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '12:05 - 12:30',
    icon: 'sparkles',
    titulo: 'Keynote 3 - Wireless Biomedical Sensing',
    desc: 'Sensores biomédicos inalámbricos, presentado por el Dr. Victor Manuel Lubecke.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '12:30 - 12:55',
    icon: 'sparkles',
    titulo: 'Keynote 4 - Microwave Engineering for Space Exploration',
    desc: 'Ingeniería de microondas aplicada a la exploración espacial, por el Dr. Imran Mehdi (CalTech).',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '12:55 - 13:20',
    icon: 'sparkles',
    titulo: 'Keynote 5 - Microwave & Electromagnetic Systems',
    desc: 'Aprendizaje desde el pregrado hasta el doctorado, a cargo del Dr. Mohammad Zarifi.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '13:20 - 14:00',
    icon: 'user',
    titulo: 'Panel #1 - Enhancing IEEE MTT-S Engagement in Latin America',
    desc: 'Discusión sobre la creación de impacto en la región a través de actividades BPC.',
    categoria: 'Panel',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '14:00 - 15:00',
    icon: 'clock',
    titulo: 'Lunch',
    desc: 'Almuerzo para los asistentes del evento.',
    categoria: 'Break',
    badgeClass: 'badge-warning'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '15:00 - 15:25',
    icon: 'sparkles',
    titulo: 'Keynote 6 - Space Mapping Design Optimization',
    desc: 'Optimización de diseño y simplicidad en la práctica de ingeniería, por el Dr. Jose Rayas Sánchez.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '15:25 - 15:45',
    icon: 'sparkles',
    titulo: 'Keynote 7 - How to Write Academic Proposals',
    desc: 'Taller sobre escritura de artículos, becas y competencias académicas, por la Dra. Olga Boric Lubecke.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '15:45 - 16:30',
    icon: 'clipboard',
    titulo: 'Workshop - Technical Proposals/Publications Mentoring',
    desc: 'Actividad práctica de mentoría para la redacción de propuestas técnicas y publicaciones.',
    categoria: 'Workshop',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 1 - 28 de mayo',
    hora: '16:30 - 17:00',
    icon: 'user',
    titulo: 'Afternoon Tea and NETWORKING SESSION',
    desc: 'Sesión de té vespertino y espacio dedicado al networking.',
    categoria: 'Networking',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '8:30 - 9:00',
    icon: 'ticket',
    titulo: 'Registration (Day 2)',
    desc: 'Registro y recepción para el segundo día del evento.',
    categoria: 'Registro',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '9:00 - 9:20',
    icon: 'sparkles',
    titulo: 'Keynote 1 - MTT-S: Igniting Passion',
    desc: 'Pavimentando el futuro para la juventud en Latinoamérica, a cargo del Dr. Glauco Fontgalland.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '9:20 - 9:40',
    icon: 'sparkles',
    titulo: 'Keynote 2 - Evolution of Microwave Engineering in Ecuador',
    desc: 'La experiencia de la Escuela Politécnica Nacional, impartida por el Dr. Hernán Barba.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '9:40 - 9:50',
    icon: 'sparkles',
    titulo: 'Keynote 3 - An Overview on MTT-S in Latin America',
    desc: 'Estado, beneficios y oportunidades en la región, presentado por el Dr. Jose Rayas Sánchez.',
    categoria: 'Keynote',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '9:50 - 10:30',
    icon: 'user',
    titulo: 'Panel #2 - MTT-S BPC Scope, Offerings, Opportunities',
    desc: 'Discusión entre estudiantes, academia e industria sobre las oportunidades de refuerzo en América Latina.',
    categoria: 'Panel',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '10:30 - 11:20',
    icon: 'check-circle',
    titulo: 'Student Poster Competition with Coffee Break',
    desc: 'Competencia de pósteres estudiantiles acompañada de un coffee break.',
    categoria: 'Competencia',
    badgeClass: 'badge-danger'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '11:20 - 11:40',
    icon: 'sparkles',
    titulo: 'Invited 1 - Visualización de ondas acústicas',
    desc: 'Presentación en 2D y 3D mediante interferometría de retroalimentación óptica, por el Dr. Fernando Urgiles.',
    categoria: 'Conferencia',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '11:40 - 12:00',
    icon: 'sparkles',
    titulo: 'Invited 2 - Direct to Device',
    desc: 'Análisis sobre la conectividad global directa, por el Dr. Andrés Navarro.',
    categoria: 'Conferencia',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '12:00 - 12:20',
    icon: 'sparkles',
    titulo: 'Invited 3 - Power distribution networks',
    desc: 'Redes de distribución para frecuencias de microondas y dispositivos de ondas milimétricas, por el Dr. Raúl Haro.',
    categoria: 'Conferencia',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '12:20 - 12:40',
    icon: 'sparkles',
    titulo: 'Invited 4 - Theory of characteristic modes',
    desc: 'Aplicación en el diseño de antenas multicampo, expuesto por el Dr. Carlos Peñafiel.',
    categoria: 'Conferencia',
    badgeClass: 'badge-info'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '12:40 - 14:00',
    icon: 'user',
    titulo: 'Group Mentoring Activities for Students and YPs',
    desc: 'Actividades de mentoría grupal para estudiantes y jóvenes profesionales liderada por destacados ingenieros y académicos.',
    categoria: 'Networking',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '14:00 - 15:00',
    icon: 'clock',
    titulo: 'Lunch',
    desc: 'Almuerzo para los asistentes del segundo día.',
    categoria: 'Break',
    badgeClass: 'badge-warning'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '15:00 - 16:00',
    icon: 'location',
    titulo: 'Open House - Tour to University Facilities',
    desc: 'Recorrido abierto por las instalaciones de la Escuela Politécnica Nacional.',
    categoria: 'Actividad',
    badgeClass: 'badge-success'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '16:00 - 16:45',
    icon: 'check-circle',
    titulo: 'Award Ceremony',
    desc: 'Entrega de premios para 3MPC, competencia de pósteres, competencia de escritura y placas LOC.',
    categoria: 'Ceremonia',
    badgeClass: 'badge-danger'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '16:45 - 16:50',
    icon: 'grid',
    titulo: 'Final Group PHOTO with Banner',
    desc: 'Fotografía grupal final de clausura con el banner del evento.',
    categoria: 'Ceremonia',
    badgeClass: 'badge-warning'
  },
  {
    dia: 'Día 2 - 29 de mayo',
    hora: '16:50 - 17:00',
    icon: 'sparkles',
    titulo: 'Closing Session and Vote of Thanks',
    desc: 'Sesión de clausura y agradecimientos a cargo del Dr. Hernán Barba, Dra. Sandra Sánchez y Debabani Choudhury.',
    categoria: 'Cierre',
    badgeClass: 'badge-accent'
  }
];

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

/* --- Cronograma Section --- */
.cronograma-section {
  padding: 5rem 0 3rem;
  position: relative;
}

.timeline-container {
  position: relative;
  max-width: 850px;
  margin: 3rem auto 0;
  padding-left: 2rem;
}

.timeline-line {
  position: absolute;
  left: 31px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--color-mtts-cyan) 0%, rgba(0, 169, 224, 0.1) 100%);
  opacity: 0.8;
}

.timeline-item {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  animation: slideInUp 0.6s ease both;
}

.timeline-dot-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 1.2rem;
}

.timeline-dot {
  width: 44px;
  height: 44px;
  border-radius: 1rem;
  background: rgba(6, 17, 31, 0.95);
  border: 2px solid var(--color-border);
  color: var(--color-mtts-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 169, 224, 0.2);
  z-index: 2;
  transition: all var(--transition-fast);
}

.timeline-item:hover .timeline-dot {
  border-color: #8cdfff;
  color: #8cdfff;
  box-shadow: 0 0 25px rgba(0, 169, 224, 0.45);
  transform: scale(1.1);
}

.timeline-card {
  padding: 1.5rem;
  background: var(--gradient-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 1.5rem;
  transition: all var(--transition-normal);
}

.timeline-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-lg);
  transform: translateX(4px);
}

.timeline-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.time-tag {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #8cdfff;
}

.timeline-card-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.timeline-card-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.cronograma-section .badge-info {
  background: rgba(140, 223, 255, 0.15);
  color: #8cdfff;
}

.timeline-day-divider {
  display: flex;
  justify-content: flex-start;
  margin: 3.5rem 0 2rem 64px;
  position: relative;
  z-index: 2;
}

.day-badge {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 4px 20px rgba(0, 169, 224, 0.2);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .timeline-container {
    padding-left: 0.5rem;
  }
  
  .timeline-line {
    left: 21px;
  }

  .timeline-day-divider {
    margin-left: 44px;
  }
  
  .timeline-item {
    grid-template-columns: 44px 1fr;
    gap: 0.5rem;
  }

  .timeline-dot-wrapper {
    padding-top: 1rem;
  }
  
  .timeline-dot {
    width: 36px;
    height: 36px;
  }
}
</style>
