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
  usuario?: {
    idUsuario: number
    nombre: string
    email: string
  }
}

export interface CreateQrTypeDto {
  codigo: string
  nombre: string
  descripcion?: string
  requiereUnicoUso: boolean
}

export interface UpdateQrTypeDto {
  nombre?: string
  descripcion?: string
  requiereUnicoUso?: boolean
  activo?: boolean
}

export interface AssignQrDto {
  idUsuario: number
  idTipoQr: number
  expiracion?: string
}

export interface AssignAllQrDto {
  idUsuario: number
  expiracion?: string
}

export interface AssignRoleUserQrDto {
  idTipoQr: number
  expiracion?: string
}

export interface AssignBatchQrDto {
  idUsuarios: number[]
  idTiposQr: number[]
  expiracion?: string
}

export interface CancelQrDto {
  idUsuarioQr: string
}

export interface ScanQrDto {
  token: string
  idStaff: number
}

export interface ScanQrResponse {
  valido: boolean
  mensaje: string
  idUsuarioQr?: string
  idUsuario?: number
  estado?: string
  fechaUso?: string | null
  tipoQr?: Partial<TipoQr>
}

export interface BulkAssignmentResult {
  asignados: number
  omitidos: number
  detalle: unknown[]
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

  listTipos: (search = ''): Promise<TipoQr[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return api.get(`/qr/tipos${query}`).then((r) => r.data)
  },

  createTipo: (dto: CreateQrTypeDto): Promise<TipoQr> =>
    api.post('/qr/tipos', dto).then((r) => r.data),

  updateTipo: (idTipoQr: number, dto: UpdateQrTypeDto): Promise<TipoQr> =>
    api.patch(`/qr/tipos/${idTipoQr}`, dto).then((r) => r.data),

  listAssignments: (params?: { idUsuario?: number; idTipoQr?: number; estado?: string }): Promise<UsuarioQr[]> => {
    const query = new URLSearchParams()
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value))
      }
    })
    const serialized = query.toString()
    return api.get(`/qr${serialized ? `?${serialized}` : ''}`).then((r) => r.data)
  },

  assignToUser: (dto: AssignQrDto): Promise<UsuarioQr> =>
    api.post('/qr/asignar', dto).then((r) => r.data),

  assignAllToUser: (dto: AssignAllQrDto): Promise<UsuarioQr[]> =>
    api.post('/qr/asignar/todos', dto).then((r) => r.data),

  assignToRoleUser: (dto: AssignRoleUserQrDto): Promise<BulkAssignmentResult> =>
    api.post('/qr/asignar-rol-user', dto).then((r) => r.data),

  assignBatch: (dto: AssignBatchQrDto): Promise<BulkAssignmentResult> =>
    api.post('/qr/asignar/lote', dto).then((r) => r.data),

  cancelAssignment: (dto: CancelQrDto): Promise<UsuarioQr> =>
    api.patch('/qr/cancelar', dto).then((r) => r.data),

  deleteAssignment: (idUsuarioQr: string): Promise<{ deleted: boolean; message: string }> =>
    api.delete(`/qr/${idUsuarioQr}`).then((r) => r.data),

  scan: (dto: ScanQrDto): Promise<ScanQrResponse> =>
    api.post('/qr/escanear', dto).then((r) => r.data),
}

export default qrApi
