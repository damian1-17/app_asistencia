import api from './axios'

export interface TipoQr {
  idTipoQr: number
  codigo: string
  nombre: string
  descripcion: string
  requiereUnicoUso: boolean
  activo: boolean
  createdAt: string
}

export interface UsuarioQr {
  idUsuarioQr: string
  idUsuario: number
  idTipoQr: number
  token: string
  estado: string
  usado: boolean
  fechaUso: string | null
  expiracion: string | null
  activo: boolean
  createdAt: string
  tipoQr: TipoQr
}

const qrApi = {
  // Obtener todos los QRs de un usuario
  getByUsuario: (idUsuario: number): Promise<UsuarioQr[]> =>
    api.get(`/qr/usuario/${idUsuario}`).then((r) => r.data),

  // Obtener detalle de un QR por token
  getByToken: (token: string): Promise<UsuarioQr> =>
    api.get(`/qr/token/${token}`).then((r) => r.data),

  // Listar tipos de QR activos (agenda del evento)
  getTiposActivos: (): Promise<TipoQr[]> =>
    api.get('/qr/tipos/activos').then((r) => r.data),
}

export default qrApi
