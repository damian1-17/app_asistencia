<template>
  <article class="qr-card" :class="{ 'qr-used': qr.usado, 'qr-inactive': !qr.activo }">
    <header class="qr-header">
      <div class="qr-type">
        <div class="qr-type-icon">
          <AppIcon :name="tipoIcon" size="18" />
        </div>
        <div>
          <span class="qr-type-label">{{ qr.tipoQr?.codigo ?? 'QR' }}</span>
          <h3>{{ qr.tipoQr?.nombre ?? 'QR Evento' }}</h3>
        </div>
      </div>
      <span class="badge" :class="estadoBadgeClass">{{ estadoLabel }}</span>
    </header>

    <div class="qr-image-wrap">
      <div v-if="generating" class="qr-loading">
        <div class="spinner spinner-sm"></div>
      </div>
      <canvas
        v-show="!generating"
        ref="canvasRef"
        class="qr-canvas"
        :id="`qr-canvas-${qr.idUsuarioQr}`"
        :aria-label="`Codigo QR: ${qr.tipoQr?.nombre}`"
      />
      <div v-if="qr.usado" class="qr-used-overlay">
        <AppIcon name="check-circle" size="18" />
        <span>Usado</span>
      </div>
    </div>

    <p v-if="qr.tipoQr?.descripcion" class="qr-desc">{{ qr.tipoQr.descripcion }}</p>

    <div class="qr-meta">
      <div class="meta-item">
        <span>Token</span>
        <strong class="token-value" :title="qr.token">{{ shortToken }}</strong>
      </div>
      <div v-if="qr.expiracion" class="meta-item">
        <span>Vence</span>
        <strong>{{ formatDate(qr.expiracion) }}</strong>
      </div>
      <div v-if="qr.fechaUso" class="meta-item">
        <span>Usado el</span>
        <strong>{{ formatDate(qr.fechaUso) }}</strong>
      </div>
    </div>

    <div class="qr-actions">
      <button
        class="btn btn-primary btn-sm qr-download"
        :id="`btn-download-qr-${qr.idUsuarioQr}`"
        @click="downloadQr"
        :disabled="generating || !qr.activo"
        :title="!qr.activo ? 'QR inactivo' : 'Descargar QR'"
      >
        <AppIcon name="download" size="16" />
        <span>Descargar</span>
      </button>
      <button
        class="btn btn-ghost btn-sm btn-icon qr-copy"
        :id="`btn-copy-token-${qr.idUsuarioQr}`"
        @click="copyToken"
        :title="copied ? 'Copiado' : 'Copiar token'"
      >
        <AppIcon :name="copied ? 'check-circle' : 'clipboard'" size="16" />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
import type { UsuarioQr } from '@/api/qr.api'
import AppIcon from '@/components/shared/AppIcon.vue'

const props = defineProps<{ qr: UsuarioQr }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const generating = ref(false)
const copied = ref(false)

const qrContent = computed(() =>
  JSON.stringify({
    token: props.qr.token,
    idUsuario: props.qr.idUsuario,
    idTipoQr: props.qr.idTipoQr,
    codigoTipo: props.qr.tipoQr?.codigo ?? '',
  }),
)

const shortToken = computed(() => {
  const token = props.qr.token
  return token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '-'
})

const estadoLabel = computed(() => {
  if (!props.qr.activo) return 'Inactivo'
  if (props.qr.usado) return 'Usado'
  return props.qr.estado ?? 'Activo'
})

const estadoBadgeClass = computed(() => {
  if (!props.qr.activo) return 'badge-muted'
  if (props.qr.usado) return 'badge-warning'
  return 'badge-success'
})

const tipoIcon = computed(() => {
  const code = props.qr.tipoQr?.codigo?.toUpperCase() ?? ''
  if (code.includes('ALMUERZO') || code.includes('COMIDA')) return 'grid'
  if (code.includes('ACCESO') || code.includes('ENTRADA')) return 'ticket'
  if (code.includes('TALLER') || code.includes('WORKSHOP')) return 'sparkles'
  if (code.includes('CERT')) return 'check-circle'
  return 'qr'
})

async function generateQr() {
  if (!canvasRef.value) return

  generating.value = true

  try {
    await QRCode.toCanvas(canvasRef.value, qrContent.value, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0d1b2c',
        light: '#f5f7fb',
      },
      errorCorrectionLevel: 'H',
    })
  } catch (err) {
    console.error('Error generando QR:', err)
  } finally {
    generating.value = false
  }
}

function downloadQr() {
  if (!canvasRef.value) return

  const link = document.createElement('a')
  link.download = `QR_${props.qr.tipoQr?.codigo ?? 'evento'}_${props.qr.token.slice(0, 8)}.png`
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(props.qr.token)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // noop
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(generateQr)
watch(qrContent, generateQr)
</script>

<style scoped>
.qr-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.1rem;
  border-radius: 1.55rem;
  background: linear-gradient(145deg, rgba(18, 33, 53, 0.95), rgba(9, 18, 32, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 22px 36px rgba(0, 0, 0, 0.18);
  transition: transform var(--transition-normal), border-color var(--transition-normal);
}

.qr-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 169, 224, 0.22);
}

.qr-card.qr-inactive {
  opacity: 0.64;
}

.qr-header,
.qr-type,
.qr-actions,
.meta-item {
  display: flex;
  align-items: center;
}

.qr-header,
.meta-item {
  justify-content: space-between;
}

.qr-type {
  gap: 0.8rem;
}

.qr-type-icon {
  width: 42px;
  height: 42px;
  border-radius: 1rem;
  background: rgba(0, 169, 224, 0.12);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-type-label {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.15rem;
}

.qr-type h3 {
  font-size: 1rem;
}

.qr-image-wrap {
  position: relative;
  min-height: 240px;
  padding: 1rem;
  border-radius: 1.25rem;
  background: #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-canvas {
  display: block;
  border-radius: 0.85rem;
}

.qr-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-used-overlay {
  position: absolute;
  inset: 0;
  border-radius: 1.25rem;
  background: rgba(245, 158, 11, 0.86);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.qr-desc {
  color: var(--color-text-secondary);
  font-size: 0.86rem;
}

.qr-meta {
  padding: 0.95rem 1rem;
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 0.55rem;
}

.meta-item span {
  color: var(--color-text-muted);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.meta-item strong {
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
}

.token-value {
  color: #8cdfff !important;
}

.qr-actions {
  gap: 0.65rem;
}

.qr-download {
  flex: 1;
}

.qr-copy {
  width: 42px;
  height: 42px;
  padding: 0;
  justify-content: center;
}
</style>
