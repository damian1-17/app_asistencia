<template>
  <div class="mis-qrs-page">
    <section class="page-hero card">
      <div>
        <span class="page-kicker">Credenciales digitales</span>
        <h1 class="page-title">Mis codigos QR</h1>
        <p class="page-subtitle">Consulta, descarga y controla todos tus accesos desde un mismo panel.</p>
      </div>
      <button class="btn btn-secondary" @click="reload" :disabled="qrStore.loading" id="btn-reload-qrs">
        <AppIcon name="refresh" size="16" />
        <span>{{ qrStore.loading ? 'Cargando...' : 'Actualizar' }}</span>
      </button>
    </section>

    <section class="stats-grid" v-if="!qrStore.loading && misQrs.length > 0">
      <article class="stat-card">
        <span>Total</span>
        <strong>{{ misQrs.length }}</strong>
      </article>
      <article class="stat-card">
        <span>Disponibles</span>
        <strong class="success">{{ qrsDisponibles }}</strong>
      </article>
      <article class="stat-card">
        <span>Usados</span>
        <strong class="warning">{{ qrsUsados }}</strong>
      </article>
    </section>

    <div v-if="qrStore.loading" class="empty-state card-flat">
      <LoadingSpinner text="Cargando tus QRs..." />
    </div>

    <div v-else-if="error" class="empty-state card-flat">
      <AlertMessage :message="error" type="error" />
      <button class="btn btn-primary mt-lg" @click="reload">Reintentar</button>
    </div>

    <div v-else-if="misQrs.length === 0" class="empty-state card-flat">
      <div class="empty-icon">
        <AppIcon name="qr" size="36" />
      </div>
      <h2 class="empty-title">Sin QRs asignados</h2>
      <p class="empty-desc">Todavia no tienes codigos disponibles. Contacta al organizador para validar tu registro.</p>
    </div>

    <div v-else class="qr-grid">
      <QrCard v-for="qr in misQrs" :key="qr.idUsuarioQr" :qr="qr" />
    </div>

    <div class="info-card card-flat mt-xl" v-if="!qrStore.loading && misQrs.length > 0">
      <AppIcon name="info" size="18" />
      <p class="text-sm text-secondary">
        Descarga tus codigos y presentalos al staff. Los elementos marcados como
        <strong class="text-warning">usados</strong> ya fueron validados en el evento.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useQrStore } from '@/stores/qr.store'
import QrCard from '@/components/qr/QrCard.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const authStore = useAuthStore()
const qrStore = useQrStore()
const error = ref('')

const misQrs = computed(() => qrStore.misQrs.filter((qr) => qr.tipoQr?.activo !== false))
const qrsDisponibles = computed(() => misQrs.value.filter((qr) => !qr.usado && qr.activo).length)
const qrsUsados = computed(() => misQrs.value.filter((qr) => qr.usado).length)

async function reload() {
  if (!authStore.user?.idUsuario) return

  error.value = ''

  try {
    await qrStore.fetchMisQrs(authStore.user.idUsuario)
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Error al cargar los codigos QR'
  }
}

onMounted(reload)
</script>

<style scoped>
.mis-qrs-page {
  animation: fadeIn 0.4s ease;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.page-kicker {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8cdfff;
}

.page-title {
  font-size: clamp(2rem, 4vw, 2.7rem);
  letter-spacing: -0.04em;
  margin-bottom: 0.35rem;
}

.page-subtitle,
.empty-desc {
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.stat-card span {
  display: block;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.stat-card strong {
  font-size: 1.65rem;
}

.success {
  color: var(--color-success);
}

.warning {
  color: var(--color-warning);
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.25rem;
  text-align: center;
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

.empty-desc {
  max-width: 440px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .page-hero,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-hero {
    flex-direction: column;
  }
}
</style>
