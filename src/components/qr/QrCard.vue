<template>
  <div class="qr-card" :class="{ 'qr-used': qr.usado, 'qr-inactive': !qr.activo }">
    <!-- Header del tipo -->
    <div class="qr-header">
      <div class="qr-tipo-badge">
        <span class="qr-tipo-icon">{{ tipoIcon }}</span>
        <span>{{ qr.tipoQr?.nombre ?? 'QR Evento' }}</span>
      </div>
      <span class="badge" :class="estadoBadgeClass">{{ estadoLabel }}</span>
    </div>

    <!-- Código QR generado -->
    <div class="qr-image-wrap">
      <div v-if="generating" class="qr-loading">
        <div class="spinner spinner-sm"></div>
      </div>
      <canvas
        v-show="!generating"
        ref="canvasRef"
        class="qr-canvas"
        :id="`qr-canvas-${qr.idUsuarioQr}`"
        :aria-label="`Código QR: ${qr.tipoQr?.nombre}`"
      />
      <div v-if="qr.usado" class="qr-used-overlay">
        <span>✓ Usado</span>
      </div>
    </div>

    <!-- Descripción -->
    <p v-if="qr.tipoQr?.descripcion" class="qr-desc">{{ qr.tipoQr.descripcion }}</p>

    <!-- Metadata -->
    <div class="qr-meta">
      <div class="meta-item">
        <span class="meta-label">Token</span>
        <span class="meta-value token-value" :title="qr.token">{{ shortToken }}</span>
      </div>
      <div v-if="qr.expiracion" class="meta-item">
        <span class="meta-label">Vence</span>
        <span class="meta-value">{{ formatDate(qr.expiracion) }}</span>
      </div>
      <div v-if="qr.fechaUso" class="meta-item">
        <span class="meta-label">Usado el</span>
        <span class="meta-value">{{ formatDate(qr.fechaUso) }}</span>
      </div>
    </div>

    <!-- Acciones -->
    <div class="qr-actions">
      <button
        class="btn btn-primary btn-sm"
        :id="`btn-download-qr-${qr.idUsuarioQr}`"
        @click="downloadQr"
        :disabled="generating || !qr.activo"
        :title="!qr.activo ? 'QR inactivo' : 'Descargar QR'"
      >
        ⬇ Descargar QR
      </button>
      <button
        class="btn btn-ghost btn-sm btn-icon"
        :id="`btn-copy-token-${qr.idUsuarioQr}`"
        @click="copyToken"
        :title="copied ? '¡Copiado!' : 'Copiar token'"
      >
        {{ copied ? '✓' : '📋' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import type { UsuarioQr } from '@/api/qr.api'

const props = defineProps<{ qr: UsuarioQr }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const generating = ref(false)
const copied = ref(false)

// ─── QR content: stringified JSON del token ───
const qrContent = computed(() => {
  return JSON.stringify({
    token: props.qr.token,
    idUsuario: props.qr.idUsuario,
    idTipoQr: props.qr.idTipoQr,
    codigoTipo: props.qr.tipoQr?.codigo ?? '',
  })
})

const shortToken = computed(() => {
  const t = props.qr.token
  return t ? `${t.slice(0, 8)}...${t.slice(-4)}` : '-'
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
  if (code.includes('ALMUERZO') || code.includes('COMIDA')) return '🍽'
  if (code.includes('ACCESO') || code.includes('ENTRADA')) return '🎫'
  if (code.includes('TALLER') || code.includes('WORKSHOP')) return '🛠'
  if (code.includes('CERT')) return '🏆'
  return '📱'
})

async function generateQr() {
  if (!canvasRef.value) return
  generating.value = true
  try {
    await QRCode.toCanvas(canvasRef.value, qrContent.value, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0B0F1A',
        light: '#F8FAFC',
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
    setTimeout(() => { copied.value = false }, 2000)
  } catch {/* noop */}
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
  background: var(--color-bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.qr-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-accent);
  opacity: 0;
  transition: opacity var(--transition-normal);
  border-radius: inherit;
}

.qr-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-accent);
  transform: translateY(-4px);
}

.qr-card:hover::before {
  opacity: 0.03;
}

.qr-card.qr-inactive {
  opacity: 0.6;
}

.qr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.qr-tipo-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.qr-tipo-icon {
  font-size: 1.2rem;
}

.qr-image-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  min-height: 240px;
}

.qr-canvas {
  border-radius: var(--radius-sm);
  display: block;
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
  background: rgba(245, 158, 11, 0.85);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: white;
  letter-spacing: 0.1em;
  backdrop-filter: blur(2px);
}

.qr-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.qr-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}

.meta-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
}

.token-value {
  color: var(--color-accent);
}

.qr-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.qr-actions .btn:first-child {
  flex: 1;
}
</style>
