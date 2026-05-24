import { defineStore } from 'pinia'
import { ref } from 'vue'
import qrApi, { type UsuarioQr, type TipoQr } from '@/api/qr.api'

export const useQrStore = defineStore('qr', () => {
  const misQrs = ref<UsuarioQr[]>([])
  const tiposActivos = ref<TipoQr[]>([])
  const loading = ref(false)
  const loadingAgenda = ref(false)

  async function fetchMisQrs(idUsuario: number) {
    loading.value = true
    try {
      misQrs.value = await qrApi.getByUsuario(idUsuario)
    } finally {
      loading.value = false
    }
  }

  async function fetchAgenda() {
    loadingAgenda.value = true
    try {
      tiposActivos.value = await qrApi.getTiposActivos()
    } finally {
      loadingAgenda.value = false
    }
  }

  function clearQrs() {
    misQrs.value = []
    tiposActivos.value = []
  }

  return {
    misQrs,
    tiposActivos,
    loading,
    loadingAgenda,
    fetchMisQrs,
    fetchAgenda,
    clearQrs,
  }
})
