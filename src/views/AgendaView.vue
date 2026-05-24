<template>
  <div class="agenda-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">📅 Agenda del Evento</h1>
        <p class="page-subtitle">Actividades y sesiones disponibles en MTTS 2026</p>
      </div>
      <div class="event-badge badge badge-accent">MTTS 2026</div>
    </div>

    <!-- Event info card -->
    <div class="event-info-card glass mb-xl">
      <div class="event-details-grid">
        <div class="event-detail">
          <span class="detail-icon">📍</span>
          <div>
            <p class="detail-label">Lugar</p>
            <p class="detail-value">Centro de Convenciones MTTS</p>
          </div>
        </div>
        <div class="event-detail">
          <span class="detail-icon">📆</span>
          <div>
            <p class="detail-label">Fecha</p>
            <p class="detail-value">2026 — Por confirmar</p>
          </div>
        </div>
        <div class="event-detail">
          <span class="detail-icon">🎯</span>
          <div>
            <p class="detail-label">Modalidad</p>
            <p class="detail-value">Presencial con acceso QR</p>
          </div>
        </div>
        <div class="event-detail">
          <span class="detail-icon">✅</span>
          <div>
            <p class="detail-label">Estado</p>
            <p class="detail-value text-success">Inscripción activa</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="qrStore.loadingAgenda" class="empty-state">
      <LoadingSpinner text="Cargando agenda..." />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="empty-state">
      <AlertMessage :message="error" type="error" />
      <button class="btn btn-primary mt-lg" @click="loadAgenda">Reintentar</button>
    </div>

    <!-- Empty -->
    <div v-else-if="tipos.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h2 class="empty-title">Agenda no disponible</h2>
      <p class="empty-desc">La agenda del evento aún no ha sido publicada.</p>
    </div>

    <!-- Agenda items -->
    <div v-else>
      <div class="section-label">
        <span>{{ tipos.length }} actividad{{ tipos.length !== 1 ? 'es' : '' }} confirmada{{ tipos.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="agenda-list">
        <div
          class="agenda-item"
          v-for="(tipo, index) in tipos"
          :key="tipo.idTipoQr"
          :style="{ animationDelay: `${index * 0.1}s` }"
          :id="`agenda-item-${tipo.idTipoQr}`"
        >
          <!-- Timeline dot -->
          <div class="timeline-dot">
            <span>{{ tipoIcon(tipo.codigo) }}</span>
          </div>

          <!-- Card content -->
          <div class="agenda-card glass">
            <div class="agenda-card-header">
              <div class="agenda-title-wrap">
                <h3 class="agenda-nombre">{{ tipo.nombre }}</h3>
                <span class="badge badge-accent text-xs">{{ tipo.codigo }}</span>
              </div>
              <div class="agenda-meta">
                <span
                  class="badge"
                  :class="tipo.requiereUnicoUso ? 'badge-warning' : 'badge-success'"
                  :title="tipo.requiereUnicoUso ? 'Solo se puede usar una vez' : 'Reutilizable'"
                >
                  {{ tipo.requiereUnicoUso ? '🔑 Único uso' : '♻ Reutilizable' }}
                </span>
              </div>
            </div>

            <p v-if="tipo.descripcion" class="agenda-desc">{{ tipo.descripcion }}</p>

            <div class="agenda-footer">
              <span class="agenda-qr-info">
                <span class="text-muted text-xs">Tu QR para esta actividad está en</span>
                <RouterLink to="/dashboard/mis-qrs" class="agenda-qr-link">Mis QRs →</RouterLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQrStore } from '@/stores/qr.store'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import AlertMessage from '@/components/shared/AlertMessage.vue'

const qrStore = useQrStore()
const error = ref('')
const tipos = computed(() => qrStore.tiposActivos)

function tipoIcon(codigo: string) {
  const c = codigo.toUpperCase()
  if (c.includes('ALMUERZO') || c.includes('COMIDA')) return '🍽'
  if (c.includes('ACCESO') || c.includes('ENTRADA')) return '🎫'
  if (c.includes('TALLER') || c.includes('WORKSHOP')) return '🛠'
  if (c.includes('CERT')) return '🏆'
  if (c.includes('COFFE') || c.includes('CAFE')) return '☕'
  if (c.includes('CONF')) return '🎤'
  return '📌'
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

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xs);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.event-badge {
  font-size: var(--font-size-sm);
  padding: 0.4rem 1rem;
}

/* Event info card */
.event-info-card {
  padding: var(--spacing-xl);
}

.event-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-lg);
}

.event-detail {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.detail-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

/* Section label */
.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Agenda list (timeline) */
.agenda-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: relative;
}

.agenda-list::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 24px;
  bottom: 24px;
  width: 2px;
  background: linear-gradient(180deg, var(--color-accent), transparent);
  border-radius: 2px;
}

.agenda-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  animation: slideInUp 0.4s ease both;
}

.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-accent-light);
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 15px var(--color-accent-glow);
}

.agenda-card {
  flex: 1;
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.agenda-card:hover {
  border-color: var(--color-border);
  transform: translateX(4px);
  box-shadow: var(--shadow-accent);
}

.agenda-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.agenda-title-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.agenda-nombre {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.agenda-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.agenda-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.agenda-qr-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.agenda-qr-link {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  animation: float 4s ease-in-out infinite;
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.empty-desc {
  color: var(--color-text-secondary);
  max-width: 400px;
}
</style>
