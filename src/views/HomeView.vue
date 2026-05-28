<template>
  <div class="home-page">
    <AppNavbar />

    <section class="hero">
      <div class="hero-backdrop"></div>
      <div class="container hero-layout" style="justify-content: center;">
        <div class="hero-copy" style="align-items: center; text-align: center;">
          <div class="hero-kicker">
            <AppIcon name="sparkles" size="16" />
            <span>MTTS 2026 · Registro y accesos</span>
          </div>

          <div class="hero-actions" style="justify-content: center;">
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
          </div>
        </div>
      </div>
    </section>


    <!-- CRONOGRAMA SECTION -->
    <section class="cronograma-section" id="cronograma" style="scroll-margin-top: 80px;">
      <div class="container">
        <div class="section-heading text-center">
          <span class="section-kicker">Programación</span>
          <h2 class="section-title">Cronograma del Evento</h2>
          <p class="section-subtitle" style="margin: 0 auto; max-width: 600px;">
            Planifica tu jornada. Conoce los horarios, conferencias magistrales, paneles y talleres prácticos preparados para ti.
          </p>
        </div>

        <!-- Day Switcher -->
        <div class="day-switcher">
          <button 
            v-for="day in uniqueDays" 
            :key="day"
            class="day-btn"
            :class="{ active: activeDay === day }"
            @click="activeDay = day"
          >
            <span class="day-btn-title">{{ day.split(' - ')[0] }}</span>
            <span class="day-btn-subtitle">{{ day.split(' - ')[1] || '' }}</span>
          </button>
        </div>

        <div class="modern-timeline-wrapper">
          <div class="modern-timeline-line"></div>
          
          <div 
            v-for="(item, index) in filteredCronograma" 
            :key="index" 
            class="modern-timeline-item"
            :style="{ animationDelay: `${(index % 10) * 0.06}s` }"
          >
            <!-- Time Column -->
            <div class="modern-time-col">
              <span class="time-start">{{ item.hora.split(' - ')[0].trim() }}</span>
              <span class="time-end">{{ item.hora.split(' - ')[1]?.trim() }}</span>
            </div>
            
            <!-- Dot Column -->
            <div class="modern-dot-col">
              <div class="modern-dot" :class="item.badgeClass">
                <div class="modern-dot-inner"></div>
              </div>
            </div>
            
            <!-- Content Column -->
            <div class="modern-content-col">
              <div class="modern-content-card">
                <div class="modern-content-header">
                  <div class="modern-content-title-wrapper">
                    <AppIcon :name="item.icon" size="16" class="modern-icon" />
                    <h3 class="modern-title">{{ item.titulo }}</h3>
                  </div>
                  <span class="badge" :class="item.badgeClass">{{ item.categoria }}</span>
                </div>
                <p class="modern-desc">{{ item.desc }}</p>
              </div>
            </div>
          </div>
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

    

    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="logo-mark small">
            <img src="@/assets/mtts.svg" alt="MTTS Logo" style="width: 22px; height: 22px;" />
          </div>
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
import { ref, computed } from 'vue'
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

const uniqueDays = computed(() => {
  return [...new Set(cronograma.map(item => item.dia))];
});
const activeDay = ref(uniqueDays.value[0]);

const filteredCronograma = computed(() => {
  return cronograma.filter(item => item.dia === activeDay.value);
});

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* --- Day Switcher --- */
.day-switcher {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
  margin-top: 1.5rem;
}

.day-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  min-width: 120px;
}

.day-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--color-text-primary);
}

.day-btn.active {
  background: rgba(0, 169, 224, 0.1);
  border-color: var(--color-mtts-cyan);
  color: var(--color-mtts-cyan);
}

.day-btn-title {
  display: block;
  font-weight: 700;
  font-size: 1rem;
}

.day-btn-subtitle {
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

/* --- Modern Timeline Layout --- */
.modern-timeline-wrapper {
  position: relative;
  max-width: 750px;
  margin: 0 auto;
}

.modern-timeline-line {
  position: absolute;
  left: 63px;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: var(--color-border);
}

.modern-timeline-item {
  display: flex;
  gap: 1.5rem;
  padding-bottom: 2rem;
  position: relative;
  animation: slideInUp 0.5s ease both;
}

.modern-time-col {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  padding-top: 0.2rem;
  font-family: monospace;
}

.modern-time-col .time-start {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.modern-time-col .time-end {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.25rem;
}

.modern-dot-col {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  padding-top: 0.35rem;
  width: 20px;
  flex-shrink: 0;
  justify-content: center;
}

.modern-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-dot.badge-primary,
.modern-dot.badge-accent,
.modern-dot.badge-info,
.modern-dot.badge-success {
  border-color: var(--color-mtts-cyan);
}

.modern-dot.badge-danger {
  border-color: #ff4757;
}
.modern-dot.badge-warning {
  border-color: #ffa502;
}

.modern-dot-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
}

.modern-dot.badge-primary .modern-dot-inner,
.modern-dot.badge-accent .modern-dot-inner,
.modern-dot.badge-info .modern-dot-inner,
.modern-dot.badge-success .modern-dot-inner {
  background: var(--color-mtts-cyan);
}

.modern-dot.badge-danger .modern-dot-inner { background: #ff4757; }
.modern-dot.badge-warning .modern-dot-inner { background: #ffa502; }

.modern-content-col {
  flex: 1;
}

.modern-content-card {
  padding: 1rem 1.25rem;
  background: rgba(10, 20, 35, 0.3);
  border-radius: 0.75rem;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.modern-content-card:hover {
  background: rgba(10, 20, 35, 0.6);
  border-color: var(--color-border-subtle);
}

.modern-content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.modern-content-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modern-icon {
  color: var(--color-text-secondary);
}

.modern-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.modern-desc {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  padding-left: 2.25rem;
}

@media (max-width: 768px) {
  .modern-timeline-line {
    left: 47px;
  }
  
  .modern-time-col {
    width: 48px;
  }
  
  .modern-timeline-item {
    gap: 1rem;
  }
  
  .modern-desc {
    padding-left: 0;
    margin-top: 0.5rem;
  }
}
</style>
