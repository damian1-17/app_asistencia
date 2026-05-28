import api from './axios'

export interface RoleSummary {
  idRol: number
  nombre: string
  descripcion?: string
  createdAt?: string
}

export interface UserRecord {
  idUsuario: number
  nombre: string
  cedula?: string
  email: string
  estado: 'activo' | 'inactivo' | 'suspendido' | string
  roles: Array<string | RoleSummary>
  createdAt?: string
  updatedAt?: string
}

export interface UsersMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UsersResponse {
  data: UserRecord[]
  meta: UsersMeta
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  estado?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CreateUserDto {
  nombre: string
  cedula?: string
  email: string
  password: string
  estado?: string
  roleIds?: number[]
}

export interface UpdateUserDto {
  nombre?: string
  cedula?: string
  email?: string
  password?: string
  estado?: string
  roleIds?: number[]
}

function toQuery(params: UserFilters) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

const usersApi = {
  list: (filters: UserFilters = {}): Promise<UsersResponse> =>
    api.get(`/usuarios${toQuery(filters)}`).then((r) => r.data),

  getById: (idUsuario: number): Promise<UserRecord> =>
    api.get(`/usuarios/${idUsuario}`).then((r) => r.data),

  create: (dto: CreateUserDto): Promise<UserRecord> =>
    api.post('/auth/register', dto).then((r) => r.data),

  update: (idUsuario: number, dto: UpdateUserDto): Promise<UserRecord> =>
    api.patch(`/usuarios/${idUsuario}`, dto).then((r) => r.data),

  remove: (idUsuario: number): Promise<void> =>
    api.delete(`/usuarios/${idUsuario}`).then(() => undefined),

  updateStatus: (idUsuario: number, estado: string): Promise<UserRecord> =>
    api.patch(`/usuarios/${idUsuario}/estado?estado=${encodeURIComponent(estado)}`).then((r) => r.data),

  assignRoles: (idUsuario: number, roleIds: number[]): Promise<UserRecord> =>
    api.post(`/usuarios/${idUsuario}/roles`, { roleIds }).then((r) => r.data),
}

export default usersApi
