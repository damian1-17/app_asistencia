import api from './axios'

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  nombre: string
  email: string
  password: string
}

// ⚠ Nombres reales según OpenAPI de producción
export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface UserProfile {
  idUsuario: number
  email: string
  nombre: string
  cedula?: string
  estado?: string
  roles: Array<{ idRol?: number; nombre: string; descripcion?: string } | string>
}

export interface AuthResponse {
  user: UserProfile
}

export interface CheckAuthResponse {
  authenticated: boolean
  user: UserProfile
}

const authApi = {
  login: (dto: LoginDto): Promise<AuthResponse> =>
    api.post('/auth/login', dto).then((r) => r.data),

  logout: (): Promise<void> =>
    api.post('/auth/logout').then(() => undefined),

  profile: (): Promise<UserProfile> =>
    api.get('/auth/profile').then((r) => r.data),

  check: (): Promise<CheckAuthResponse> =>
    api.get('/auth/check').then((r) => r.data),

  refresh: (): Promise<AuthResponse> =>
    api.post('/auth/refresh').then((r) => r.data),

  // ⚠ Campos reales: currentPassword / newPassword
  changePassword: (dto: ChangePasswordDto): Promise<void> =>
    api.post('/auth/change-password', dto).then(() => undefined),

  requestPasswordRecovery: (email: string): Promise<{ message: string }> =>
    api.post('/auth/password-recovery/request', { email }).then((r) => r.data),

  // ⚠ Campos reales: email + code + newPassword
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> =>
    api
      .post('/auth/password-recovery/reset', { email, code, newPassword })
      .then((r) => r.data),

  adminChangePassword: (userId: number, newPassword: string): Promise<{ message: string }> =>
    api.patch('/auth/admin/change-password', { userId, newPassword }).then((r) => r.data),
}

export default authApi
