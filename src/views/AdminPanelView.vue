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
            <span class="results-copy">{{ filteredUsers.length }} resultado{{ filteredUsers.length === 1 ? '' : 's' }}</span>
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
            <div class="table-row table-row-head">
              <span>Tipo</span>
              <span>Token</span>
              <span>Estado</span>
            </div>
            <div class="table-row" v-for="assignment in assignments.slice(0, 8)" :key="assignment.idUsuarioQr">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
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
  limit: 8,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
})

const activeUsers = computed(() => users.value.filter((item) => item.estado?.toLowerCase() === 'activo').length)
const rolesWithPermissions = computed(() => roles.value.filter((item) => (item.permisos?.length ?? 0) > 0).length)
const activeQrTypes = computed(() => qrTypes.value.filter((item) => item.activo).length)
const usedAssignments = computed(() => assignments.value.filter((item) => item.usado || item.estado?.toLowerCase() === 'usado').length)

const filteredUsers = computed(() => {
  const query = userSearch.value.trim().toLowerCase()
  if (!query) return users.value

  return users.value.filter((item) =>
    item.nombre.toLowerCase().includes(query) || item.email.toLowerCase().includes(query),
  )
})

const selectedUser = computed(() =>
  users.value.find((item) => item.idUsuario === selectedUserId.value) ?? null,
)

const pwdForm = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref(false)

const confirmError = computed(() => pwdForm.confirm.length > 0 && pwdForm.confirm !== pwdForm.newPassword)

function shortToken(token: string) {
  return token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '-'
}

function normalizeRoles(userRoles: Array<string | RoleSummary>) {
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

async function reloadAdminData() {
  refreshing.value = true
  loadError.value = ''

  try {
    const [usersRes, rolesRes, qrTypesRes, assignmentsRes] = await Promise.all([
      usersApi.list({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'DESC' }),
      rolesApi.list(),
      qrApi.listTipos(),
      qrApi.listAssignments(),
    ])

    users.value = usersRes.data
    usersMeta.value = usersRes.meta
    roles.value = rolesRes
    qrTypes.value = qrTypesRes
    assignments.value = assignmentsRes

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
</style>
