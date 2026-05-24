<template>
  <div class="agenda-page">
    <section class="page-hero card">
      <div>
        <span class="page-kicker">Programacion</span>
        <h1 class="page-title">Agenda del evento</h1>
        <p class="page-subtitle">Actividades disponibles dentro del ecosistema MTTS 2026.</p>
      </div>
      <div class="hero-badge">MTTS 2026</div>
    </section>

    <section class="event-grid card">
      <article v-for="item in eventMeta" :key="item.label" class="event-meta">
        <div class="meta-icon">
          <AppIcon :name="item.icon" size="18" />
        </div>
        <div>
          <span>{{ item.label }}</span>
          <strong :class="item.className">{{ item.value }}</strong>
        </div>
      </article>
    </section>

    <div v-if="qrStore.loadingAgenda" class="empty-state card-flat">
      <LoadingSpinner text="Cargando agenda..." />
    </div>

    <div v-else-if="error" class="empty-state card-flat">
      <AlertMessage :message="error" type="error" />
      <button class="btn btn-primary mt-lg" @click="loadAgenda">Reintentar</button>
    </div>

    <div v-else-if="tipos.length === 0" class="empty-state card-flat">
      <div class="empty-icon">
        <AppIcon name="calendar" size="36" />
      </div>
      <h2 class="empty-title">Agenda no disponible</h2>
      <p class="empty-desc">La programacion del evento todavia no ha sido publicada.</p>
    </div>

    <div v-else class="timeline">
      <div class="section-label">
        {{ tipos.length }} actividad{{ tipos.length !== 1 ? 'es' : '' }} confirmada{{ tipos.length !== 1 ? 's' : '' }}
      </div>

      <article
        v-for="(tipo, index) in tipos"
        :key="tipo.idTipoQr"
        class="timeline-item"
        :style="{ animationDelay: `${index * 0.08}s` }"
        :id="`agenda-item-${tipo.idTipoQr}`"
      >
        <div class="timeline-dot">
          <AppIcon :name="tipoIcon(tipo.codigo)" size="18" />
        </div>

        <div class="timeline-card card">
          <div class="timeline-head">
            <div>
              <h3>{{ tipo.nombre }}</h3>
              <p v-if="tipo.descripcion">{{ tipo.descripcion }}</p>
            </div>

            <div class="timeline-badges">
              <span class="badge badge-accent">{{ tipo.codigo }}</span>
              <span class="badge" :class="tipo.requiereUnicoUso ? 'badge-warning' : 'badge-success'">
                {{ tipo.requiereUnicoUso ? 'Unico uso' : 'Reutilizable' }}
              </span>
            </div>
          </div>

          <div class="timeline-footer">
            <span class="footer-note">Tu codigo para esta actividad esta disponible en el modulo personal.</span>
            <RouterLink to="/dashboard/mis-qrs" class="footer-link">Ir a Mis QRs</RouterLink>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQrStore } from '@/stores/qr.store'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const qrStore = useQrStore()
const error = ref('')
const tipos = computed(() => qrStore.tiposActivos)

const eventMeta = [
  { icon: 'location', label: 'Lugar', value: 'Centro de Convenciones MTTS', className: '' },
  { icon: 'calendar', label: 'Fecha', value: '2026 · Por confirmar', className: '' },
  { icon: 'ticket', label: 'Modalidad', value: 'Presencial con acceso QR', className: '' },
  { icon: 'check-circle', label: 'Estado', value: 'Inscripcion activa', className: 'is-success' },
]

function tipoIcon(codigo: string) {
  const value = codigo.toUpperCase()

  if (value.includes('ALMUERZO') || value.includes('COMIDA')) return 'grid'
  if (value.includes('ACCESO') || value.includes('ENTRADA')) return 'ticket'
  if (value.includes('TALLER') || value.includes('WORKSHOP')) return 'sparkles'
  if (value.includes('CERT')) return 'check-circle'
  if (value.includes('COFFE') || value.includes('CAFE')) return 'clock'
  if (value.includes('CONF')) return 'mail'
  return 'pin'
}

async function loadAgenda() {
  error.value = ''

  try {
    await qrStore.fetchAgenda()
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Error al cargar la agenda'
  }
}

onMounted(loadAgenda)
</script>

<style scoped>
.agenda-page {
  animation: fadeIn 0.4s ease;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.page-kicker,
.section-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
}

.page-kicker {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: #8cdfff;
}

.page-title {
  font-size: clamp(2rem, 4vw, 2.7rem);
  letter-spacing: -0.04em;
  margin-bottom: 0.35rem;
}

.page-subtitle,
.empty-desc,
.timeline-head p,
.footer-note,
.event-meta span {
  color: var(--color-text-secondary);
}

.hero-badge {
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 700;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1.1rem;
}

.event-meta {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.4rem;
}

.meta-icon {
  width: 40px;
  height: 40px;
  border-radius: 1rem;
  background: rgba(0, 169, 224, 0.12);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-meta span {
  display: block;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.18rem;
}

.event-meta strong {
  font-size: 0.95rem;
}

.is-success {
  color: var(--color-success);
}

.section-label {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 21px;
  top: 1.2rem;
  bottom: 1.2rem;
  width: 1px;
  background: linear-gradient(180deg, rgba(0, 169, 224, 0.5), transparent);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  animation: slideInUp 0.35s ease both;
}

.timeline-dot {
  width: 44px;
  height: 44px;
  border-radius: 1rem;
  background: rgba(0, 169, 224, 0.12);
  border: 1px solid rgba(0, 169, 224, 0.2);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.timeline-card {
  padding: 1.25rem;
}

.timeline-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.timeline-head h3 {
  margin-bottom: 0.35rem;
}

.timeline-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.timeline-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  align-items: center;
}

.footer-link {
  font-weight: 700;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.25rem;
}

.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 1.4rem;
  background: rgba(0, 169, 224, 0.1);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-title {
  margin-bottom: 0.45rem;
}

@media (max-width: 960px) {
  .event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-hero,
  .timeline-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .event-grid {
    grid-template-columns: 1fr;
  }
}
</style>
