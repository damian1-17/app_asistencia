<template>
  <div class="scan-page">
    <section class="scan-hero card">
      <div>
        <span class="scan-kicker">Operacion en sitio</span>
        <h1 class="scan-title">Escaner de accesos</h1>
        <p class="scan-copy">
          Valida codigos QR del evento con camara o token manual desde una vista dedicada para staff administrativo.
        </p>
      </div>

      <div class="scan-badges">
        <span class="badge badge-accent" v-for="role in displayRoles" :key="role">
          {{ role }}
        </span>
      </div>
    </section>

    <AdminQrScannerPanel @scanned="reloadAssignments" />

    <section class="card">
      <div class="section-head">
        <div>
          <h2 class="section-title">Ultimas asignaciones activas</h2>
          <p class="section-copy">Referencia rapida para contrastar el estado operativo del sistema.</p>
        </div>
        <button class="btn btn-secondary btn-sm" @click="reloadAssignments" :disabled="loading">
          <AppIcon name="refresh" size="16" />
          <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
        </button>
      </div>

      <Transition name="fade">
        <AlertMessage
          v-if="error"
          :message="error"
          type="error"
          dismissible
          @dismiss="error = ''"
          class="mb-lg"
        />
      </Transition>

      <div v-if="loading" class="loading-wrap">
        <LoadingSpinner text="Consultando asignaciones..." />
      </div>

      <div v-else-if="assignments.length" class="table-list">
        <div class="table-row table-row-head">
          <span>Tipo</span>
          <span>Token</span>
          <span>Estado</span>
        </div>
        <div class="table-row" v-for="assignment in assignments" :key="assignment.idUsuarioQr">
          <strong>{{ assignment.tipoQr?.nombre || assignment.tipoQr?.codigo || 'QR asignado' }}</strong>
          <span class="token-cell">{{ shortToken(assignment.token) }}</span>
          <span class="badge" :class="assignment.usado ? 'badge-warning' : 'badge-success'">
            {{ assignment.estado || (assignment.usado ? 'Usado' : 'Activo') }}
          </span>
        </div>
      </div>

      <p v-else class="empty-copy">No hay asignaciones activas para mostrar en este momento.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import qrApi, { type UsuarioQr } from '@/api/qr.api'
import AdminQrScannerPanel from '@/components/admin/AdminQrScannerPanel.vue'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const authStore = useAuthStore()

const displayRoles = computed(() => authStore.displayRoles)
const assignments = ref<UsuarioQr[]>([])
const loading = ref(true)
const error = ref('')

function shortToken(token: string) {
  return token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '-'
}

async function reloadAssignments() {
  loading.value = true
  error.value = ''

  try {
    const response = await qrApi.listAssignments()
    assignments.value = response.slice(0, 10)
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'No fue posible cargar las asignaciones activas.'
  } finally {
    loading.value = false
  }
}

onMounted(reloadAssignments)
</script>

<style scoped>
.scan-page {
  display: grid;
  gap: 1rem;
  animation: fadeIn 0.4s ease;
}

.scan-hero,
.scan-badges,
.section-head,
.btn span {
  display: flex;
}

.scan-hero,
.section-head {
  justify-content: space-between;
  gap: 1rem;
}

.scan-hero {
  align-items: flex-start;
}

.scan-kicker {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: #8cdfff;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.76rem;
}

.scan-title,
.section-title {
  letter-spacing: -0.03em;
}

.scan-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin-bottom: 0.35rem;
}

.scan-copy,
.section-copy,
.empty-copy {
  color: var(--color-text-secondary);
}

.scan-badges {
  gap: 0.45rem;
  flex-wrap: wrap;
}

.section-head {
  align-items: flex-start;
  margin-bottom: 1rem;
}

.loading-wrap {
  padding: 1rem 0;
}

.table-list {
  display: grid;
  gap: 0.65rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 0.8fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.table-row-head {
  background: transparent;
  border: none;
  padding: 0 0.2rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
}

.table-row strong {
  color: var(--color-text-primary);
}

.token-cell {
  color: #8cdfff;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

.btn span {
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .scan-hero,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-row {
    grid-template-columns: 1fr;
  }

  .table-row-head {
    display: none;
  }
}
</style>
