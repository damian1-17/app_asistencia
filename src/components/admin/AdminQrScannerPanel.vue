<template>
  <article class="card scanner-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">Escaneo QR</h2>
        <p class="section-copy">Valida accesos con <code>POST /qr/escanear</code> usando camara o token manual.</p>
      </div>
    </div>

    <Transition name="fade">
      <AlertMessage
        v-if="loadError"
        :message="loadError"
        type="error"
        dismissible
        @dismiss="loadError = ''"
        class="mb-lg"
      />
    </Transition>

    <div class="scanner-layout">
      <div class="scanner-viewport">
        <video ref="videoRef" class="scanner-video" autoplay muted playsinline></video>
        <div v-if="!scannerActive" class="scanner-placeholder">
          <AppIcon name="qr" size="28" />
          <p>{{ scannerMessage }}</p>
        </div>
        <div v-else class="scanner-frame"></div>
      </div>

      <div class="scanner-controls">
        <div class="assignment-actions">
          <button class="btn btn-primary" @click="startScanner" :disabled="scannerLoading || scannerActive">
            <span v-if="!scannerLoading">
              <AppIcon name="qr" size="16" />
              <span>Iniciar camara</span>
            </span>
            <span v-else class="flex items-center gap-sm">
              <div class="spinner spinner-sm"></div>
              <span>Abriendo...</span>
            </span>
          </button>
          <button class="btn btn-ghost" @click="stopScanner" :disabled="!scannerActive">
            <AppIcon name="x" size="16" />
            <span>Detener</span>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" for="manual-token">Token o contenido QR</label>
          <textarea
            id="manual-token"
            v-model="manualScanValue"
            class="form-input scanner-textarea"
            placeholder='Pega el token o el JSON del QR, por ejemplo {"token":"..."}'
            rows="4"
          ></textarea>
        </div>

        <button class="btn btn-secondary" @click="submitManualScan" :disabled="scanSubmitting || !manualScanValue.trim()">
          <span v-if="!scanSubmitting">
            <AppIcon name="check-circle" size="16" />
            <span>Validar token</span>
          </span>
          <span v-else class="flex items-center gap-sm">
            <div class="spinner spinner-sm"></div>
            <span>Validando...</span>
          </span>
        </button>

        <Transition name="fade">
          <div v-if="scanResult" class="scan-result" :class="scanResult.valido ? 'scan-result-success' : 'scan-result-error'">
            <div class="scan-result-head">
              <AppIcon :name="scanResult.valido ? 'check-circle' : 'warning'" size="18" />
              <strong>{{ scanResult.valido ? 'QR valido' : 'QR no valido' }}</strong>
            </div>
            <p>{{ scanResult.mensaje }}</p>
            <div v-if="scanResult.tipoQr?.nombre || scanResult.estado" class="inline-badges">
              <span v-if="scanResult.tipoQr?.nombre" class="badge badge-accent">{{ scanResult.tipoQr.nombre }}</span>
              <span v-if="scanResult.estado" class="badge" :class="scanResult.valido ? 'badge-success' : 'badge-warning'">{{ scanResult.estado }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </article>

  <!-- ── Modal de confirmación de escaneo ── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="pendingQr" class="modal-backdrop" @click.self="cancelScan" id="qr-confirm-backdrop">
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">

          <!-- Indicador de escaneo -->
          <div class="modal-scan-badge">
            <AppIcon name="qr" size="20" />
            <span>QR Detectado</span>
          </div>

          <h3 class="modal-title" id="modal-title">Confirmar escaneo</h3>
          <p class="modal-subtitle">Revisa los datos antes de registrar el acceso.</p>

          <div class="modal-fields">
            <!-- Código y nombre -->
            <div class="modal-row modal-row-highlight">
              <div class="modal-field">
                <span class="field-label">Código</span>
                <span class="field-value field-code">{{ pendingQr.codigo || '—' }}</span>
              </div>
              <div class="modal-field">
                <span class="field-label">Nombre</span>
                <span class="field-value">{{ pendingQr.nombre || '—' }}</span>
              </div>
            </div>

            <!-- Descripción -->
            <div v-if="pendingQr.descripcion" class="modal-field modal-field-full">
              <span class="field-label">Descripción</span>
              <span class="field-value field-desc">{{ pendingQr.descripcion }}</span>
            </div>

            <!-- Token -->
            <div class="modal-field modal-field-full">
              <span class="field-label">Token</span>
              <span class="field-value field-token" :title="pendingQr.token">{{ shortPendingToken }}</span>
            </div>

            <!-- Expiración -->
            <div v-if="pendingQr.expiracion" class="modal-field modal-field-full">
              <span class="field-label">Expiración</span>
              <span class="field-value" :class="isExpired ? 'field-expired' : 'field-ok'">
                <AppIcon :name="isExpired ? 'warning' : 'check-circle'" size="14" />
                {{ formatDate(pendingQr.expiracion) }}
                <span v-if="isExpired" class="expiry-tag">Vencido</span>
              </span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="modal-actions">
            <button
              id="btn-cancel-scan"
              class="btn btn-ghost modal-btn-cancel"
              @click="cancelScan"
              :disabled="scanSubmitting"
            >
              <AppIcon name="x" size="16" />
              <span>Cancelar</span>
            </button>
            <button
              id="btn-confirm-scan"
              class="btn btn-primary modal-btn-confirm"
              @click="confirmScan"
              :disabled="scanSubmitting"
            >
              <span v-if="!scanSubmitting">
                <AppIcon name="check-circle" size="16" />
                <span>Confirmar acceso</span>
              </span>
              <span v-else class="flex items-center gap-sm">
                <div class="spinner spinner-sm"></div>
                <span>Registrando...</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import qrApi, { type ScanQrResponse } from '@/api/qr.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'

const emit = defineEmits<{
  scanned: []
}>()

const authStore = useAuthStore()
const videoRef = ref<HTMLVideoElement | null>(null)

const scannerLoading = ref(false)
const scannerActive = ref(false)
const scannerMessage = ref('Activa la camara para escanear un codigo QR.')
const scanSubmitting = ref(false)
const manualScanValue = ref('')
const scanResult = ref<ScanQrResponse | null>(null)
const loadError = ref('')

// ── Estado del modal de confirmación ──────────────────────────────────────
interface PendingQrData {
  token: string
  codigo: string
  nombre: string
  descripcion: string
  expiracion: string | null
  rawValue: string
}

const pendingQr = ref<PendingQrData | null>(null)

const shortPendingToken = computed(() => {
  const t = pendingQr.value?.token ?? ''
  return t ? `${t.slice(0, 10)}···${t.slice(-6)}` : '—'
})

const isExpired = computed(() => {
  if (!pendingQr.value?.expiracion) return false
  return new Date(pendingQr.value.expiracion) < new Date()
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Scanner ───────────────────────────────────────────────────────────────
let scannerStream: MediaStream | null = null
let scannerFrame: number | null = null

function extractToken(rawValue: string) {
  const value = rawValue.trim()
  if (!value) return ''

  try {
    const parsed = JSON.parse(value)
    if (typeof parsed?.token === 'string') {
      return parsed.token
    }
  } catch {
    // noop
  }

  return value
}

/** Parsea el raw value del QR y abre el modal de confirmación */
function openConfirmModal(rawValue: string) {
  const value = rawValue.trim()
  let token = value
  let codigo = ''
  let nombre = ''
  let descripcion = ''
  let expiracion: string | null = null

  try {
    const parsed = JSON.parse(value)
    if (typeof parsed?.token === 'string') token = parsed.token
    codigo = parsed?.codigoTipo ?? parsed?.codigo ?? ''
    nombre = parsed?.nombre ?? ''
    descripcion = parsed?.descripcion ?? ''
    expiracion = parsed?.expiracion ?? null
  } catch {
    // el valor es un token plano
  }

  pendingQr.value = { token, codigo, nombre, descripcion, expiracion, rawValue: value }
}

function cancelScan() {
  pendingQr.value = null
  scannerMessage.value = 'Activa la camara para escanear un codigo QR.'
  manualScanValue.value = ''
}

async function confirmScan() {
  if (!pendingQr.value || !authStore.user?.idUsuario) return

  const token = pendingQr.value.token
  scanSubmitting.value = true
  loadError.value = ''

  try {
    scanResult.value = await qrApi.scan({ token, idStaff: authStore.user.idUsuario })
    manualScanValue.value = token
    pendingQr.value = null

    if (scanResult.value.valido) {
      emit('scanned')
    }
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'No fue posible validar el QR escaneado.'
    pendingQr.value = null
  } finally {
    scanSubmitting.value = false
  }
}

async function submitManualScan() {
  const raw = manualScanValue.value.trim()
  if (!raw) return
  openConfirmModal(raw)
}

function stopScanner() {
  if (scannerFrame !== null) {
    cancelAnimationFrame(scannerFrame)
    scannerFrame = null
  }

  scannerStream?.getTracks().forEach((track) => track.stop())
  scannerStream = null

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  scannerActive.value = false
  scannerLoading.value = false
  scannerMessage.value = 'Activa la camara para escanear un codigo QR.'
}

async function scanLoop() {
  if (!scannerActive.value || !videoRef.value) return

  try {
    const DetectorCtor = (window as Window & {
      BarcodeDetector?: new (options?: { formats?: string[] }) => {
        detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>
      }
    }).BarcodeDetector

    if (!DetectorCtor) {
      scannerMessage.value = 'Tu navegador no soporta lectura QR nativa. Usa el campo manual.'
      stopScanner()
      return
    }

    const detector = new DetectorCtor({ formats: ['qr_code'] })
    const codes = await detector.detect(videoRef.value)
    const rawValue = codes[0]?.rawValue

    if (rawValue) {
      stopScanner()
      manualScanValue.value = rawValue
      scannerMessage.value = 'Codigo detectado. Confirma para registrar.'
      openConfirmModal(rawValue)
      return
    }
  } catch {
    scannerMessage.value = 'No se pudo procesar la imagen de la camara.'
  }

  scannerFrame = requestAnimationFrame(() => {
    void scanLoop()
  })
}

async function startScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    scannerMessage.value = 'La camara no esta disponible en este navegador.'
    return
  }

  stopScanner()
  scannerLoading.value = true
  scanResult.value = null
  loadError.value = ''

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })

    if (!videoRef.value) return

    videoRef.value.srcObject = scannerStream
    await videoRef.value.play()
    scannerActive.value = true
    scannerMessage.value = 'Apunta la camara al QR del asistente.'
    void scanLoop()
  } catch {
    scannerMessage.value = 'No se pudo abrir la camara. Usa el campo manual.'
  } finally {
    scannerLoading.value = false
  }
}

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.scanner-card {
  overflow: hidden;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  letter-spacing: -0.03em;
}

.section-copy,
.scanner-placeholder p {
  color: var(--color-text-secondary);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.scanner-layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
  gap: 1rem;
  align-items: start;
}

.scanner-viewport {
  position: relative;
  min-height: 320px;
  border-radius: 1.25rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.scanner-video {
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
  display: block;
}

.scanner-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  background: linear-gradient(180deg, rgba(6, 17, 31, 0.45), rgba(6, 17, 31, 0.85));
}

.scanner-frame {
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(72%, 250px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(140, 223, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 0 0 999px rgba(6, 17, 31, 0.18);
  pointer-events: none;
}

.scanner-controls,
.assignment-actions {
  display: grid;
  gap: 1rem;
}

.assignment-actions {
  display: flex;
  flex-wrap: wrap;
}

.scanner-textarea {
  resize: vertical;
  min-height: 110px;
}

.scan-result {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid;
}

.scan-result-success {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.28);
}

.scan-result-error {
  background: rgba(226, 0, 26, 0.12);
  border-color: rgba(226, 0, 26, 0.28);
}

.scan-result-head,
.inline-badges,
.btn span {
  display: flex;
  align-items: center;
}

.scan-result-head {
  gap: 0.55rem;
  margin-bottom: 0.45rem;
}

.inline-badges {
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.btn span {
  gap: 0.5rem;
}

code {
  font-family: 'Courier New', monospace;
  color: #8cdfff;
}

/* ── Modal de confirmación ──────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(4, 11, 22, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-panel {
  position: relative;
  width: 100%;
  max-width: 480px;
  border-radius: 1.75rem;
  padding: 2rem 1.75rem 1.75rem;
  background: linear-gradient(160deg, rgba(14, 26, 46, 0.98), rgba(7, 16, 30, 0.99));
  border: 1px solid rgba(140, 223, 255, 0.14);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 0 60px rgba(0, 169, 224, 0.06) inset;
}

.modal-scan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.9rem;
  border-radius: 99px;
  background: rgba(0, 169, 224, 0.12);
  border: 1px solid rgba(0, 169, 224, 0.22);
  color: #8cdfff;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary, #e8f1fb);
  margin-bottom: 0.3rem;
}

.modal-subtitle {
  font-size: 0.86rem;
  color: var(--color-text-secondary, #7a91b0);
  margin-bottom: 1.5rem;
}

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
}

.modal-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.modal-row-highlight {
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: rgba(0, 169, 224, 0.07);
  border: 1px solid rgba(0, 169, 224, 0.12);
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.modal-field-full {
  padding: 0.7rem 1rem;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.field-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted, #4d6380);
  font-weight: 600;
}

.field-value {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #a8bdd4);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.field-code {
  font-family: 'Courier New', monospace;
  color: #8cdfff;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
}

.field-token {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: rgba(140, 223, 255, 0.75);
  word-break: break-all;
}

.field-desc {
  font-size: 0.85rem;
  line-height: 1.5;
}

.field-ok {
  color: #10b981;
}

.field-expired {
  color: #f59e0b;
}

.expiry-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #f59e0b;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-btn-cancel {
  flex: 0 0 auto;
  min-width: 120px;
}

.modal-btn-confirm {
  flex: 1;
}

/* Animaciones del modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
  transform: translateY(28px) scale(0.96);
  opacity: 0;
}

@media (max-width: 900px) {
  .scanner-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-panel {
    padding: 1.5rem 1.25rem 1.25rem;
  }

  .modal-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-btn-cancel {
    min-width: unset;
  }
}
</style>
