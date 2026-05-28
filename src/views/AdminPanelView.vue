<template>
  <div class="admin-page">
    <section class="admin-hero card">
      <div class="admin-identity">
        <div class="admin-avatar">{{ userInitial }}</div>
        <div>
          <span class="admin-kicker">Acceso restringido</span>
          <h1>Panel de administracion</h1>
          <p>{{ user?.nombre }} · {{ user?.email }}</p>
        </div>
      </div>

      <div class="hero-actions">
        <div class="admin-roles">
          <span class="badge badge-accent" v-for="role in displayRoles" :key="role">
            {{ role }}
          </span>
        </div>
        <button class="btn btn-secondary" @click="reloadAdminData" :disabled="refreshing || bootLoading">
          <AppIcon name="refresh" size="16" />
          <span>{{ refreshing ? 'Actualizando...' : 'Actualizar panel' }}</span>
        </button>
      </div>
    </section>

    <Transition name="fade">
      <AlertMessage
        v-if="loadError"
        :message="loadError"
        type="error"
        dismissible
        @dismiss="loadError = ''"
      />
    </Transition>

    <Transition name="fade">
      <AlertMessage
        v-if="roleSuccess"
        :message="roleSuccess"
        type="success"
        dismissible
        @dismiss="roleSuccess = ''"
      />
    </Transition>

    <section v-if="bootLoading" class="card">
      <LoadingSpinner text="Cargando informacion administrativa..." />
    </section>

    <template v-else>
      <section class="summary-grid">
        <article class="summary-card">
          <span>Usuarios</span>
          <strong>{{ usersMeta.total }}</strong>
          <p>{{ activeUsers }} activos</p>
        </article>
        <article class="summary-card">
          <span>Roles</span>
          <strong>{{ roles.length }}</strong>
          <p>{{ rolesWithPermissions }} con permisos visibles</p>
        </article>
        <article class="summary-card">
          <span>Tipos QR</span>
          <strong>{{ qrTypes.length }}</strong>
          <p>{{ activeQrTypes }} activos</p>
        </article>
        <article class="summary-card">
          <span>Asignaciones</span>
          <strong>{{ assignments.length }}</strong>
          <p>{{ usedAssignments }} usadas</p>
        </article>
      </section>

      <section class="workspace-grid">
        <article class="card user-panel">
          <div class="section-head">
            <div>
              <h2 class="section-title">Usuarios</h2>
              <p class="section-copy">Selecciona un usuario para inspeccionar y modificar sus roles.</p>
            </div>
            <button class="btn btn-primary" type="button" @click="openCreateUserModal" id="btn-nuevo-usuario">
              <AppIcon name="user-plus" size="16" />
              <span>Nuevo usuario</span>
            </button>
          </div>

          <div class="toolbar">
            <div class="search-wrap">
              <AppIcon name="user" size="16" />
              <input
                v-model="userSearch"
                type="search"
                class="toolbar-input"
                placeholder="Buscar por nombre o email"
              />
            </div>
            <span class="results-copy">{{ usersMeta.total }} resultado{{ usersMeta.total === 1 ? '' : 's' }}</span>
          </div>

          <div class="user-list" v-if="filteredUsers.length">
            <button
              v-for="item in filteredUsers"
              :key="item.idUsuario"
              type="button"
              class="user-row"
              :class="{ active: selectedUserId === item.idUsuario }"
              @click="selectUser(item.idUsuario)"
            >
              <div class="user-row-main">
                <strong>{{ item.nombre }}</strong>
                <span>{{ item.email }}</span>
              </div>
              <div class="user-row-side">
                <span class="badge" :class="statusBadge(item.estado)">{{ item.estado }}</span>
                <span class="user-role-count">{{ normalizeRoles(item.roles).length }} roles</span>
              </div>
            </button>
          </div>
          <p v-else class="empty-copy">No hay usuarios que coincidan con la busqueda actual.</p>

          <!-- Paginated Controls -->
          <div class="pagination-controls" v-if="usersMeta.totalPages > 1">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="!usersMeta.hasPreviousPage"
              @click="changePage(usersMeta.page - 1)"
            >
              <AppIcon name="chevron-left" size="14" />
              <span>Anterior</span>
            </button>
            <span class="page-indicator">
              Página {{ usersMeta.page }} de {{ usersMeta.totalPages }}
            </span>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="!usersMeta.hasNextPage"
              @click="changePage(usersMeta.page + 1)"
            >
              <span>Siguiente</span>
              <AppIcon name="chevron-right" size="14" />
            </button>
          </div>
        </article>

        <article class="card assignment-panel">
          <div class="section-head">
            <div>
              <h2 class="section-title">Asignacion de roles</h2>
              <p class="section-copy">Conecta con <code>/api/v1/usuarios/{id}/roles</code> para actualizar roles.</p>
            </div>
          </div>

          <div v-if="selectedUser" class="assignment-body">
            <div class="selected-user">
              <div class="selected-avatar">{{ selectedUser.nombre.charAt(0).toUpperCase() }}</div>
              <div>
                <strong>{{ selectedUser.nombre }}</strong>
                <p>{{ selectedUser.email }}</p>
                <div class="inline-badges">
                  <span class="badge" :class="statusBadge(selectedUser.estado)">{{ selectedUser.estado }}</span>
                  <span
                    v-for="role in normalizeRoles(selectedUser.roles)"
                    :key="`${selectedUser.idUsuario}-${role.idRol}-${role.nombre}`"
                    class="badge badge-accent"
                  >
                    {{ role.nombre }}
                  </span>
                </div>
              </div>
            </div>

            <div class="role-selector" v-if="roles.length">
              <label class="selector-label">Roles disponibles</label>
              <div class="role-grid">
                <label v-for="role in roles" :key="role.idRol" class="role-option" :class="{ checked: selectedRoleIds.includes(role.idRol) }">
                  <input
                    :checked="selectedRoleIds.includes(role.idRol)"
                    type="checkbox"
                    @change="toggleRole(role.idRol)"
                  />
                  <div>
                    <strong>{{ role.nombre }}</strong>
                    <p>{{ role.descripcion || 'Sin descripcion disponible.' }}</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="assignment-actions">
              <button
                class="btn btn-primary"
                :disabled="assigningRoles || !selectedUser"
                @click="assignSelectedRoles"
              >
                <span v-if="!assigningRoles">
                  <AppIcon name="shield" size="16" />
                  <span>Guardar roles</span>
                </span>
                <span v-else class="flex items-center gap-sm">
                  <div class="spinner spinner-sm"></div>
                  <span>Guardando...</span>
                </span>
              </button>
              <button class="btn btn-ghost" :disabled="!selectedUser" @click="resetSelectedRoles">
                <AppIcon name="refresh" size="16" />
                <span>Restablecer seleccion</span>
              </button>
            </div>

            <!-- 🔑 Restablecer Contraseña (Admin) -->
            <div class="admin-password-reset-section" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08);">
              <label class="selector-label">Restablecer Contraseña (Solo Admin)</label>
              <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; align-items: flex-start;">
                <div class="password-input-wrapper" style="position: relative; display: flex; align-items: center; flex: 1;">
                  <input
                    v-model="adminResetPasswordVal"
                    :type="showAdminResetPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Nueva contraseña"
                    style="height: 38px; font-size: 0.85rem; padding-right: 2.5rem; width: 100%;"
                    minlength="8"
                    required
                  />
                  <button
                    type="button"
                    class="btn-toggle-password"
                    @click="showAdminResetPassword = !showAdminResetPassword"
                    style="position: absolute; right: 0.75rem; background: none; border: none; color: var(--color-text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"
                  >
                    <svg v-if="!showAdminResetPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  :disabled="adminResetPasswordLoading || adminResetPasswordVal.length < 8"
                  @click="submitAdminResetPassword"
                  style="height: 38px;"
                >
                  <span v-if="!adminResetPasswordLoading">Restablecer</span>
                  <span v-else class="flex items-center gap-sm">
                    <div class="spinner spinner-sm"></div>
                  </span>
                </button>
              </div>
              <p class="form-hint mt-xs" style="font-size: 0.72rem; color: var(--color-text-muted);">
                Min. 8 caracteres. Se cerrarán las sesiones activas del usuario.
              </p>
            </div>
          </div>

          <p v-else class="empty-copy">Selecciona un usuario para asignar o reemplazar sus roles.</p>
        </article>
      </section>

      <section class="admin-grid">
        <article class="card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Roles del sistema</h2>
              <p class="section-copy">Consulta administrativa desde <code>GET /roles</code>.</p>
            </div>
          </div>

          <div class="list-stack" v-if="roles.length">
            <div class="list-card" v-for="role in roles" :key="role.idRol">
              <div class="list-topline">
                <strong>{{ role.nombre }}</strong>
                <span class="badge badge-accent">{{ role.permisos?.length ?? 0 }} permisos</span>
              </div>
              <p>{{ role.descripcion || 'Sin descripcion disponible.' }}</p>
            </div>
          </div>
          <p v-else class="empty-copy">No hay roles visibles con la sesion actual.</p>
        </article>

        <article class="card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Tipos QR</h2>
              <p class="section-copy">Catalogo inicial desde <code>GET /qr/tipos</code>.</p>
            </div>
          </div>

          <div class="list-stack" v-if="qrTypes.length">
            <div class="list-card" v-for="type in qrTypes.slice(0, 6)" :key="type.idTipoQr">
              <div class="list-topline">
                <strong>{{ type.nombre }}</strong>
                <div class="inline-badges">
                  <span class="badge badge-accent">{{ type.codigo }}</span>
                  <span class="badge" :class="type.activo ? 'badge-success' : 'badge-muted'">
                    {{ type.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
              <p>{{ type.descripcion || 'Sin descripcion disponible.' }}</p>
            </div>
          </div>
          <p v-else class="empty-copy">No hay tipos QR cargados actualmente.</p>
        </article>
      </section>

      <section class="admin-grid">
        <article class="card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Asignaciones activas</h2>
              <p class="section-copy">Vista inicial desde <code>GET /qr</code>.</p>
            </div>
          </div>

          <div class="table-list" v-if="assignments.length">
            <div class="table-row table-row-head" style="grid-template-columns: 1.5fr 1fr 1fr 0.8fr;">
              <span>Usuario</span>
              <span>Tipo</span>
              <span>Token</span>
              <span>Estado</span>
            </div>
            <div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 0.8fr;" v-for="assignment in assignments.slice(0, 8)" :key="assignment.idUsuarioQr">
              <div style="display:flex; flex-direction:column; gap:0.1rem;">
                <strong>{{ assignment.usuario?.nombre || `ID ${assignment.idUsuario}` }}</strong>
                <span style="font-size:0.75rem; color:var(--color-text-secondary);">{{ assignment.usuario?.email || '' }}</span>
              </div>
              <strong>{{ assignment.tipoQr?.nombre || assignment.tipoQr?.codigo || 'QR asignado' }}</strong>
              <span class="token-cell">{{ shortToken(assignment.token) }}</span>
              <span class="badge" :class="assignment.usado ? 'badge-warning' : 'badge-success'">
                {{ assignment.estado || (assignment.usado ? 'Usado' : 'Activo') }}
              </span>
            </div>
          </div>
          <p v-else class="empty-copy">No hay asignaciones activas para mostrar.</p>
        </article>

        <article class="card">
          <h2 class="section-title">Cambiar contrasena</h2>

          <Transition name="fade">
            <AlertMessage v-if="pwdSuccess" message="Contrasena actualizada correctamente" type="success" class="mb-lg" />
            <AlertMessage v-else-if="pwdError" :message="pwdError" type="error" dismissible @dismiss="pwdError = ''" class="mb-lg" />
          </Transition>

          <form @submit.prevent="changePassword" id="change-password-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="pwd-actual">Contrasena actual</label>
                <input
                  id="pwd-actual"
                  v-model="pwdForm.currentPassword"
                  type="password"
                  class="form-input"
                  placeholder="Tu contrasena actual"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="pwd-nueva">Nueva contrasena</label>
                <input
                  id="pwd-nueva"
                  v-model="pwdForm.newPassword"
                  type="password"
                  class="form-input"
                  placeholder="Minimo 8 caracteres"
                  minlength="8"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="pwd-confirm">Confirmar nueva contrasena</label>
              <input
                id="pwd-confirm"
                v-model="pwdForm.confirm"
                type="password"
                class="form-input"
                :class="{ error: confirmError }"
                placeholder="Repite la contrasena"
                required
              />
              <span v-if="confirmError" class="form-error">
                <AppIcon name="warning" size="14" />
                <span>Las contrasenas no coinciden</span>
              </span>
            </div>

            <button
              type="submit"
              class="btn btn-secondary"
              :disabled="pwdLoading || confirmError"
              id="btn-change-password"
            >
              <span v-if="!pwdLoading">
                <AppIcon name="shield" size="16" />
                <span>Actualizar contrasena</span>
              </span>
              <span v-else class="flex items-center gap-sm">
                <div class="spinner spinner-sm"></div>
                <span>Guardando...</span>
              </span>
            </button>
          </form>
        </article>
      </section>
    </template>

    <!-- ════════════════════════════════════════════════
         MODAL — Crear Usuario
    ════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="createUserModalOpen" class="modal-backdrop" @click.self="closeCreateUserModal" id="modal-create-user-backdrop">
          <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-user-title">

            <div class="modal-header">
              <div class="modal-scan-badge">
                <AppIcon name="user" size="16" />
                <span>Nuevo usuario</span>
              </div>
              <button class="modal-close" @click="closeCreateUserModal" id="btn-close-user-modal">
                <AppIcon name="x" size="18" />
              </button>
            </div>

            <h3 class="modal-title" id="modal-user-title">Crear nuevo usuario</h3>
            <p class="modal-subtitle">Ingresa los datos del nuevo usuario para registrarlo en el sistema.</p>

            <form @submit.prevent="submitCreateUserForm" id="form-create-user" class="modal-form">
              <div class="form-group">
                <label class="form-label" for="user-nombre">Nombre <span class="required">*</span></label>
                <input
                  id="user-nombre"
                  v-model="createUserForm.nombre"
                  class="form-input"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="user-email">Correo electrónico <span class="required">*</span></label>
                <input
                  id="user-email"
                  type="email"
                  v-model="createUserForm.email"
                  class="form-input"
                  placeholder="Ej: juan.perez@epn.edu.ec"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="user-password">Contraseña <span class="required">*</span></label>
                <div class="password-input-wrapper" style="position: relative; display: flex; align-items: center;">
                  <input
                    id="user-password"
                    :type="showCreatePassword ? 'text' : 'password'"
                    v-model="createUserForm.password"
                    class="form-input"
                    placeholder="Min. 8 caracteres"
                    minlength="8"
                    required
                    style="padding-right: 2.5rem; width: 100%;"
                  />
                  <button
                    type="button"
                    class="btn-toggle-password"
                    @click="showCreatePassword = !showCreatePassword"
                    style="position: absolute; right: 0.75rem; background: none; border: none; color: var(--color-text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"
                  >
                    <svg v-if="!showCreatePassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  </button>
                </div>
              </div>

              <div v-if="createUserError" class="form-error-banner mt-sm">
                <AppIcon name="warning" size="16" />
                {{ createUserError }}
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeCreateUserModal" :disabled="createUserLoading">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="createUserLoading">
                  <span v-if="!createUserLoading">
                    <AppIcon name="check-circle" size="16" />
                    <span>Crear usuario</span>
                  </span>
                  <span v-else class="flex items-center gap-sm">
                    <div class="spinner spinner-sm"></div>
                    <span>Creando…</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth.store'
import authApi from '@/api/auth.api'
import usersApi, { type RoleSummary, type UserRecord, type UsersMeta } from '@/api/users.api'
import rolesApi, { type RoleRecord } from '@/api/roles.api'
import qrApi, { type TipoQr, type UsuarioQr } from '@/api/qr.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userInitial = computed(() => user.value?.nombre?.charAt(0).toUpperCase() ?? '?')
const displayRoles = computed(() => authStore.displayRoles)

const users = ref<UserRecord[]>([])
const roles = ref<RoleRecord[]>([])
const qrTypes = ref<TipoQr[]>([])
const assignments = ref<UsuarioQr[]>([])
const loadError = ref('')
const roleSuccess = ref('')
const bootLoading = ref(true)
const refreshing = ref(false)
const assigningRoles = ref(false)
const userSearch = ref('')
const selectedUserId = ref<number | null>(null)
const selectedRoleIds = ref<number[]>([])

const usersMeta = ref<UsersMeta>({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
})

const totalActiveUsers = ref(0)

const activeUsers = computed(() => totalActiveUsers.value)
const rolesWithPermissions = computed(() => roles.value.filter((item) => (item.permisos?.length ?? 0) > 0).length)
const activeQrTypes = computed(() => qrTypes.value.filter((item) => item.activo).length)
const usedAssignments = computed(() => assignments.value.filter((item) => item.usado || item.estado?.toLowerCase() === 'usado').length)

const filteredUsers = computed(() => users.value)

const selectedUser = computed(() =>
  users.value.find((item) => item.idUsuario === selectedUserId.value) ?? null,
)

const pwdForm = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref(false)

const createUserModalOpen = ref(false)
const createUserLoading = ref(false)
const createUserError = ref('')
const createUserForm = reactive({
  nombre: '',
  email: '',
  password: 'Password123!',
})
const showCreatePassword = ref(false)

function openCreateUserModal() {
  createUserForm.nombre = ''
  createUserForm.email = ''
  createUserForm.password = 'Password123!'
  createUserError.value = ''
  showCreatePassword.value = false
  createUserModalOpen.value = true
}

function closeCreateUserModal() {
  createUserModalOpen.value = false
}

async function submitCreateUserForm() {
  createUserLoading.value = true
  createUserError.value = ''

  try {
    const newUser = await usersApi.create({
      nombre: createUserForm.nombre,
      email: createUserForm.email,
      password: createUserForm.password,
    })

    // Añadir el usuario a la lista local
    if (!newUser.roles) {
      newUser.roles = []
    }
    users.value = [newUser, ...users.value]
    usersMeta.value.total += 1
    if (newUser.estado === 'activo') {
      totalActiveUsers.value += 1
    }
    selectedUserId.value = newUser.idUsuario

    closeCreateUserModal()
    roleSuccess.value = `Usuario ${newUser.nombre} creado exitosamente.`
  } catch (err: any) {
    createUserError.value = err?.response?.data?.message ?? 'No fue posible crear el usuario.'
  } finally {
    createUserLoading.value = false
  }
}

const adminResetPasswordVal = ref('Password123!')
const adminResetPasswordLoading = ref(false)
const showAdminResetPassword = ref(false)

async function submitAdminResetPassword() {
  if (!selectedUser.value || adminResetPasswordVal.value.length < 8) return
  adminResetPasswordLoading.value = true
  roleSuccess.value = ''
  loadError.value = ''

  try {
    const res = await authApi.adminChangePassword(
      selectedUser.value.idUsuario,
      adminResetPasswordVal.value
    )
    roleSuccess.value = res.message || `Contraseña de ${selectedUser.value.nombre} restablecida exitosamente.`
    adminResetPasswordVal.value = 'Password123!'
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'No fue posible restablecer la contraseña.'
  } finally {
    adminResetPasswordLoading.value = false
  }
}

const confirmError = computed(() => pwdForm.confirm.length > 0 && pwdForm.confirm !== pwdForm.newPassword)

function shortToken(token: string) {
  return token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '-'
}

function normalizeRoles(userRoles?: Array<string | RoleSummary>) {
  if (!userRoles) return []
  return userRoles.map((role, index) =>
    typeof role === 'string'
      ? { idRol: -(index + 1), nombre: role, descripcion: '' }
      : role,
  )
}

function syncSelectedRoles() {
  if (!selectedUser.value) {
    selectedRoleIds.value = []
    return
  }

  selectedRoleIds.value = normalizeRoles(selectedUser.value.roles)
    .map((role) => role.idRol)
    .filter((idRol) => idRol > 0)
}

function selectUser(idUsuario: number) {
  selectedUserId.value = idUsuario
  roleSuccess.value = ''
}

function toggleRole(idRol: number) {
  selectedRoleIds.value = selectedRoleIds.value.includes(idRol)
    ? selectedRoleIds.value.filter((value) => value !== idRol)
    : [...selectedRoleIds.value, idRol]
}

function resetSelectedRoles() {
  syncSelectedRoles()
}

function statusBadge(status: string) {
  const normalized = status?.toLowerCase()
  if (normalized === 'activo') return 'badge-success'
  if (normalized === 'suspendido') return 'badge-warning'
  if (normalized === 'inactivo') return 'badge-muted'
  return 'badge-accent'
}

async function fetchUsersPage(pageNumber = 1) {
  try {
    const res = await usersApi.list({
      page: pageNumber,
      limit: 10,
      search: userSearch.value.trim(),
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
    users.value = res.data
    usersMeta.value = res.meta

    if (!selectedUserId.value || !users.value.some((item) => item.idUsuario === selectedUserId.value)) {
      selectedUserId.value = users.value[0]?.idUsuario ?? null
    }
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'No fue posible cargar la lista de usuarios.'
  }
}

async function changePage(newPage: number) {
  if (newPage < 1 || newPage > usersMeta.value.totalPages) return
  usersMeta.value.page = newPage
  await fetchUsersPage(newPage)
}

watchDebounced(
  userSearch,
  async () => {
    usersMeta.value.page = 1
    await fetchUsersPage(1)
  },
  { debounce: 300 }
)

async function reloadAdminData() {
  refreshing.value = true
  loadError.value = ''

  try {
    const [usersRes, rolesRes, qrTypesRes, assignmentsRes, activeUsersRes] = await Promise.all([
      usersApi.list({
        page: usersMeta.value.page,
        limit: 10,
        search: userSearch.value.trim(),
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }),
      rolesApi.list(),
      qrApi.listTipos(),
      qrApi.listAssignments(),
      usersApi.list({ limit: 1, estado: 'activo' }),
    ])

    users.value = usersRes.data
    usersMeta.value = usersRes.meta
    roles.value = rolesRes
    qrTypes.value = qrTypesRes
    assignments.value = assignmentsRes
    totalActiveUsers.value = activeUsersRes.meta.total

    if (!selectedUserId.value || !users.value.some((item) => item.idUsuario === selectedUserId.value)) {
      selectedUserId.value = users.value[0]?.idUsuario ?? null
    }

    syncSelectedRoles()
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'No fue posible cargar la informacion administrativa.'
  } finally {
    bootLoading.value = false
    refreshing.value = false
  }
}

async function assignSelectedRoles() {
  if (!selectedUser.value) return

  assigningRoles.value = true
  loadError.value = ''
  roleSuccess.value = ''

  try {
    const updatedUser = await usersApi.assignRoles(selectedUser.value.idUsuario, selectedRoleIds.value)
    users.value = users.value.map((item) =>
      item.idUsuario === updatedUser.idUsuario ? updatedUser : item,
    )
    syncSelectedRoles()
    roleSuccess.value = `Roles actualizados para ${updatedUser.nombre}.`
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'No fue posible asignar los roles al usuario.'
  } finally {
    assigningRoles.value = false
  }
}

async function changePassword() {
  if (confirmError.value) return

  pwdLoading.value = true
  pwdError.value = ''
  pwdSuccess.value = false

  try {
    await authApi.changePassword({
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword,
    })

    pwdSuccess.value = true
    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirm = ''
    setTimeout(() => {
      pwdSuccess.value = false
    }, 4000)
  } catch (err: any) {
    pwdError.value = err?.response?.data?.message ?? 'Error al cambiar la contrasena'
  } finally {
    pwdLoading.value = false
  }
}

watch(selectedUserId, () => {
  syncSelectedRoles()
  adminResetPasswordVal.value = 'Password123!'
  showAdminResetPassword.value = false
})

onMounted(reloadAdminData)
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1rem;
  animation: fadeIn 0.4s ease;
}

.admin-hero,
.admin-identity,
.hero-actions,
.admin-roles,
.section-head,
.list-topline,
.inline-badges,
.assignment-actions,
.selected-user,
.user-row,
.user-row-side,
.search-wrap {
  display: flex;
}

.admin-hero,
.section-head {
  justify-content: space-between;
}

.admin-hero,
.hero-actions,
.user-row,
.user-row-side,
.search-wrap,
.selected-user {
  align-items: center;
}

.admin-hero,
.section-head,
.selected-user {
  gap: 1rem;
}

.admin-identity {
  align-items: center;
  gap: 1rem;
}

.hero-actions {
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.admin-avatar,
.selected-avatar {
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.34), rgba(0, 98, 155, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.admin-avatar {
  width: 72px;
  height: 72px;
  border-radius: 1.35rem;
  font-size: 1.75rem;
}

.selected-avatar {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.admin-kicker {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #8cdfff;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.76rem;
}

.admin-identity h1,
.section-title {
  letter-spacing: -0.03em;
}

.admin-identity h1 {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  margin-bottom: 0.2rem;
}

.admin-identity p,
.section-copy,
.empty-copy,
.list-card p,
.selected-user p,
.role-option p,
.user-row-main span,
.results-copy,
.user-role-count {
  color: var(--color-text-secondary);
}

.admin-roles,
.inline-badges,
.assignment-actions {
  gap: 0.45rem;
  flex-wrap: wrap;
}

.summary-grid,
.admin-grid,
.form-grid,
.workspace-grid {
  display: grid;
  gap: 1rem;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.workspace-grid {
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
}

.admin-grid,
.form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-card {
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.summary-card span {
  display: block;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.summary-card strong {
  display: block;
  font-size: 1.65rem;
  margin-bottom: 0.2rem;
}

.summary-card p {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.section-head {
  align-items: flex-start;
  margin-bottom: 1rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-wrap {
  gap: 0.55rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.75rem 0.9rem;
  min-width: min(100%, 360px);
}

.toolbar-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  outline: none;
  font: inherit;
}

.toolbar-input::placeholder {
  color: var(--color-text-muted);
}

.user-list,
.table-list,
.list-stack,
.role-grid {
  display: grid;
  gap: 0.65rem;
}

.user-row {
  width: 100%;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-row:hover,
.user-row.active {
  border-color: rgba(0, 169, 224, 0.22);
  background: rgba(0, 169, 224, 0.08);
}

.user-row-main,
.assignment-body {
  display: grid;
  gap: 0.2rem;
}

.user-row-side {
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.assignment-body {
  gap: 1rem;
}

.selected-user {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.selector-label {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
}

.role-grid {
  grid-template-columns: 1fr;
}

.role-option {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 0.8rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.role-option.checked {
  border-color: rgba(0, 169, 224, 0.22);
  background: rgba(0, 169, 224, 0.08);
}

.role-option input {
  margin-top: 0.18rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 0.8fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.table-row-head {
  background: transparent;
  border: none;
  padding: 0 0.2rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
}

.table-row strong,
.list-card strong,
.selected-user strong,
.role-option strong {
  color: var(--color-text-primary);
}

.list-card {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.list-topline {
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.token-cell {
  color: #8cdfff;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

.btn span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

code {
  font-family: 'Courier New', monospace;
  color: #8cdfff;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.page-indicator {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .admin-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-hero,
  .admin-identity,
  .section-head,
  .selected-user,
  .user-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    width: 100%;
    align-items: stretch;
  }

  .summary-grid,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-row-head {
    display: none;
  }

  .user-row-side {
    justify-content: flex-start;
  }
}

/* ── Modal ─────────────────────────────────────────────────────────────────── */
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
  max-width: 520px;
  border-radius: 1.75rem;
  padding: 1.75rem;
  background: linear-gradient(160deg, rgba(14, 26, 46, 0.98), rgba(7, 16, 30, 0.99));
  border: 1px solid rgba(140, 223, 255, 0.14);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.modal-scan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  border-radius: 99px;
  background: rgba(0, 169, 224, 0.1);
  border: 1px solid rgba(0, 169, 224, 0.2);
  color: #8cdfff;
  font-size: 0.74rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 0.25rem;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.modal-form {
  display: grid;
  gap: 1rem;
}

.required {
  color: #f59e0b;
}

.form-error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  background: rgba(226, 0, 26, 0.1);
  border: 1px solid rgba(226, 0, 26, 0.25);
  color: #ff9ca7;
  font-size: 0.86rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
  transform: scale(0.9) translateY(10px);
}
</style>
