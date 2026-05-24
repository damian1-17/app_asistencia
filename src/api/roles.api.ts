import api from './axios'

export interface PermissionRecord {
  idPermiso: number
  nombre: string
  descripcion?: string
}

export interface RoleRecord {
  idRol: number
  nombre: string
  descripcion?: string
  createdAt?: string
  permisos?: PermissionRecord[]
}

const rolesApi = {
  list: (search = ''): Promise<RoleRecord[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return api.get(`/roles${query}`).then((r) => r.data)
  },

  listActivos: (): Promise<RoleRecord[]> =>
    api.get('/roles/activos').then((r) => r.data),

  getById: (idRol: number): Promise<RoleRecord> =>
    api.get(`/roles/${idRol}`).then((r) => r.data),
}

export default rolesApi
