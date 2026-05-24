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
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
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

async function submitScanToken(rawValue: string) {
  const token = extractToken(rawValue)
  if (!token || !authStore.user?.idUsuario) return

  scanSubmitting.value = true
  loadError.value = ''

  try {
    scanResult.value = await qrApi.scan({
      token,
      idStaff: authStore.user.idUsuario,
    })

    manualScanValue.value = token

    if (scanResult.value.valido) {
      emit('scanned')
    }
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'No fue posible validar el QR escaneado.'
  } finally {
    scanSubmitting.value = false
  }
}

async function submitManualScan() {
  await submitScanToken(manualScanValue.value)
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
      scannerMessage.value = 'Codigo detectado. Validando...'
      await submitScanToken(rawValue)
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
}
</style>
