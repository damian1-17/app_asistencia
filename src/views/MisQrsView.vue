<template>
  <div class="mis-qrs-page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">📱 Mis Códigos QR</h1>
        <p class="page-subtitle">Todos tus accesos al evento en un solo lugar</p>
      </div>
      <button class="btn btn-secondary" @click="reload" :disabled="qrStore.loading" id="btn-reload-qrs">
        <span v-if="!qrStore.loading">↺ Actualizar</span>
        <span v-else>Cargando...</span>
      </button>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar" v-if="!qrStore.loading && misQrs.length > 0">
      <div class="stat-chip">
        <span class="chip-label">Total QRs</span>
        <span class="chip-value accent">{{ misQrs.length }}</span>
      </div>
      <div class="stat-chip">
        <span class="chip-label">Disponibles</span>
        <span class="chip-value success">{{ qrsDisponibles }}</span>
      </div>
      <div class="stat-chip">
        <span class="chip-label">Usados</span>
        <span class="chip-value warning">{{ qrsUsados }}</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="qrStore.loading" class="empty-state">
      <LoadingSpinner text="Cargando tus QRs..." />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="empty-state">
      <AlertMessage :message="error" type="error" />
      <button class="btn btn-primary mt-lg" @click="reload">Reintentar</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="misQrs.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h2 class="empty-title">Sin QRs asignados</h2>
      <p class="empty-desc">
        Aún no tienes códigos QR asignados. Contacta al organizador del evento.
      </p>
    </div>

    <!-- QR Grid -->
    <div v-else class="qr-grid">
      <QrCard
        v-for="qr in misQrs"
        :key="qr.idUsuarioQr"
        :qr="qr"
      />
    </div>

    <!-- Info card -->
    <div class="info-card glass mt-xl" v-if="!qrStore.loading && misQrs.length > 0">
      <span class="info-icon">ℹ</span>
      <p class="text-sm text-secondary">
        Descarga tus QRs y preséntarlos al staff en el evento. Los QRs marcados como
        <strong class="text-warning">Usados</strong> ya han sido validados.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import QrCard from '@/components/qr/QrCard.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import AlertMessage from '@/components/shared/AlertMessage.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()

const error = ref('')

const misQrs = computed(() => qrStore.misQrs)
const qrsDisponibles = computed(() => misQrs.value.filter((q) => !q.usado && q.activo).length)
const qrsUsados = computed(() => misQrs.value.filter((q) => q.usado).length)

async function reload() {
  if (!authStore.user?.idUsuario) return
  error.value = ''
  try {
    await qrStore.fetchMisQrs(authStore.user.idUsuario)
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Error al cargar los QRs'
  }
}

onMounted(reload)
</script>

<style scoped>
.mis-qrs-page {
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

/* Stats bar */
.stats-bar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.stat-chip {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  padding: 0.375rem 1rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chip-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chip-value {
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.chip-value.accent  { color: var(--color-accent); }
.chip-value.success { color: var(--color-success); }
.chip-value.warning { color: var(--color-warning); }

/* QR Grid */
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
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
  line-height: 1.6;
}

/* Info card */
.info-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.info-icon {
  font-size: 1.2rem;
  color: var(--color-accent);
  flex-shrink: 0;
}
</style>
