<template>
  <div class="qr-admin-page">

    <!-- ── Hero ── -->
    <section class="qr-hero card">
      <div class="hero-left">
        <span class="hero-kicker">Administración</span>
        <h1 class="hero-title">Gestión de QRs</h1>
        <p class="hero-copy">Crea y administra tipos de QR y las asignaciones a usuarios del evento.</p>
      </div>
      <div class="hero-stats">
        <div class="stat-pill">
          <span class="stat-num">{{ qrTypes.length }}</span>
          <span class="stat-label">Tipos</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num">{{ activeQrTypes }}</span>
          <span class="stat-label">Activos</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num">{{ assignments.length }}</span>
          <span class="stat-label">Asignaciones</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num">{{ usedAssignments }}</span>
          <span class="stat-label">Usadas</span>
        </div>
      </div>
    </section>

    <!-- ── Alerts ── -->
    <Transition name="fade">
      <AlertMessage v-if="globalError" :message="globalError" type="error" dismissible @dismiss="globalError = ''" />
    </Transition>
    <Transition name="fade">
      <AlertMessage v-if="globalSuccess" :message="globalSuccess" type="success" dismissible @dismiss="globalSuccess = ''" />
    </Transition>

    <!-- ── Tabs ── -->
    <div class="tab-bar">
      <button
        id="tab-tipos-qr"
        class="tab-btn"
        :class="{ active: activeTab === 'tipos' }"
        @click="activeTab = 'tipos'"
      >
        <AppIcon name="qr" size="16" />
        <span>Tipos QR</span>
        <span class="tab-badge">{{ qrTypes.length }}</span>
      </button>
      <button
        id="tab-usuarios-qr"
        class="tab-btn"
        :class="{ active: activeTab === 'asignaciones' }"
        @click="activeTab = 'asignaciones'"
      >
        <AppIcon name="user" size="16" />
        <span>Usuarios QR</span>
        <span class="tab-badge">{{ assignments.length }}</span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════
         TAB 1 — TIPOS QR
    ═══════════════════════════════════════════════ -->
    <section v-if="activeTab === 'tipos'" class="tab-content card">
      <div class="section-head">
        <div>
          <h2 class="section-title">Tipos de QR</h2>
          <p class="section-copy">Define los tipos de acceso, comida, talleres u otros eventos.</p>
        </div>
        <button id="btn-nuevo-tipo-qr" class="btn btn-primary" @click="openCreateTypeModal">
          <AppIcon name="sparkles" size="16" />
          <span>Nuevo tipo QR</span>
        </button>
      </div>

      <!-- Search -->
      <div class="toolbar">
        <div class="search-wrap">
          <AppIcon name="qr" size="16" />
          <input
            v-model="typeSearch"
            type="search"
            class="toolbar-input"
            placeholder="Buscar por código o nombre…"
          />
        </div>
        <div class="filter-group">
          <button
            class="filter-chip"
            :class="{ active: typeFilter === 'all' }"
            @click="typeFilter = 'all'"
          >Todos</button>
          <button
            class="filter-chip"
            :class="{ active: typeFilter === 'activo' }"
            @click="typeFilter = 'activo'"
          >Activos</button>
          <button
            class="filter-chip"
            :class="{ active: typeFilter === 'inactivo' }"
            @click="typeFilter = 'inactivo'"
          >Inactivos</button>
        </div>
      </div>

      <div v-if="typesLoading" class="loading-wrap">
        <LoadingSpinner text="Cargando tipos de QR…" />
      </div>

      <template v-else>
        <div v-if="filteredTypes.length" class="types-grid">
          <article
            v-for="type in filteredTypes"
            :key="type.idTipoQr"
            class="type-card"
            :class="{ 'type-inactive': !type.activo }"
          >
            <div class="type-card-top">
              <div class="type-icon-wrap">
                <AppIcon name="qr" size="20" />
              </div>
              <div class="type-badges">
                <span class="badge badge-accent type-code">{{ type.codigo }}</span>
                <span class="badge" :class="type.activo ? 'badge-success' : 'badge-muted'">
                  {{ type.activo ? 'Activo' : 'Inactivo' }}
                </span>
                <span v-if="type.requiereUnicoUso" class="badge badge-warning">Único uso</span>
              </div>
            </div>

            <h3 class="type-name">{{ type.nombre }}</h3>
            <p class="type-desc">{{ type.descripcion || 'Sin descripción.' }}</p>

            <div class="type-actions">
              <button
                class="btn btn-ghost btn-sm"
                :id="`btn-edit-tipo-${type.idTipoQr}`"
                @click="openEditTypeModal(type)"
              >
                <AppIcon name="sparkles" size="14" />
                <span>Editar</span>
              </button>
              <button
                class="btn btn-sm"
                :class="type.activo ? 'btn-ghost btn-danger-ghost' : 'btn-ghost'"
                :id="`btn-toggle-tipo-${type.idTipoQr}`"
                :disabled="togglingId === type.idTipoQr"
                @click="toggleTypeActive(type)"
              >
                <div v-if="togglingId === type.idTipoQr" class="spinner spinner-sm"></div>
                <template v-else>
                  <AppIcon :name="type.activo ? 'x' : 'check-circle'" size="14" />
                  <span>{{ type.activo ? 'Desactivar' : 'Activar' }}</span>
                </template>
              </button>
              <button
                class="btn btn-sm btn-ghost btn-danger-ghost btn-icon"
                :id="`btn-delete-tipo-${type.idTipoQr}`"
                :disabled="deletingTypeId === type.idTipoQr"
                @click="deleteType(type)"
                title="Eliminar permanentemente"
              >
                <div v-if="deletingTypeId === type.idTipoQr" class="spinner spinner-sm"></div>
                <AppIcon v-else name="trash" size="14" />
              </button>
            </div>
          </article>
        </div>
        <p v-else class="empty-copy">No hay tipos de QR que coincidan con el filtro actual.</p>
      </template>
    </section>

    <!-- ═══════════════════════════════════════════════
         TAB 2 — USUARIOS QR
    ═══════════════════════════════════════════════ -->
    <section v-if="activeTab === 'asignaciones'" class="tab-content card">
      <div class="section-head">
        <div>
          <h2 class="section-title">Usuarios QR</h2>
          <p class="section-copy">Asignaciones activas de QRs a usuarios del evento.</p>
        </div>
        <div class="flex gap-sm">
          <button class="btn btn-primary btn-sm" @click="openAssignModal" title="Asignación Individual">
            <AppIcon name="user-plus" size="16" />
            <span class="hidden-mobile">Individual</span>
          </button>
          <button class="btn btn-primary btn-sm" @click="openAssignRoleModal" title="Asignar a todos los asistentes (Rol User)">
            <AppIcon name="users" size="16" />
            <span class="hidden-mobile">A Todos</span>
          </button>
          <button class="btn btn-primary btn-sm" @click="openAssignBatchModal" title="Asignación por Lote (Varios usuarios y QRs)">
            <AppIcon name="grid" size="16" />
            <span class="hidden-mobile">Lote</span>
          </button>
          
          <button
            id="btn-reload-assignments"
            class="btn btn-ghost btn-sm"
            @click="reloadAssignments"
            :disabled="assignmentsLoading"
          >
            <AppIcon name="refresh" size="16" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="toolbar toolbar-multi">
        <div class="search-wrap">
          <AppIcon name="user" size="16" />
          <input
            v-model="assignSearch"
            type="search"
            class="toolbar-input"
            placeholder="Buscar por nombre o email de usuario…"
          />
        </div>

        <select v-model="assignTypeFilter" class="form-input select-filter" id="filter-tipo-qr">
          <option value="">Todos los tipos</option>
          <option v-for="t in qrTypes" :key="t.idTipoQr" :value="t.idTipoQr">{{ t.nombre }}</option>
        </select>

        <select v-model="assignStatusFilter" class="form-input select-filter" id="filter-estado-qr">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="usado">Usado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div v-if="assignmentsLoading" class="loading-wrap">
        <LoadingSpinner text="Cargando asignaciones…" />
      </div>

      <template v-else>
        <!-- Tabla -->
        <div v-if="filteredAssignments.length" class="assign-table-wrap">
          <div class="assign-table">
            <!-- Head -->
            <div class="assign-row assign-row-head">
              <span>Usuario</span>
              <span>Tipo QR</span>
              <span>Token</span>
              <span>Vence</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            <!-- Rows -->
            <div
              v-for="a in filteredAssignments"
              :key="a.idUsuarioQr"
              class="assign-row"
              :class="{ 'row-used': a.usado, 'row-cancelled': a.estado?.toLowerCase() === 'cancelado' }"
            >
              <!-- Usuario -->
              <div class="assign-cell cell-user">
                <div class="user-avatar-xs">
                  {{ (a.usuario?.nombre ?? 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="cell-user-info">
                  <strong>{{ a.usuario?.nombre ?? `ID ${a.idUsuario}` }}</strong>
                  <span>{{ a.usuario?.email ?? '' }}</span>
                </div>
              </div>

              <!-- Tipo QR -->
              <div class="assign-cell">
                <span class="badge badge-accent">{{ a.tipoQr?.codigo ?? '—' }}</span>
                <span class="cell-sub">{{ a.tipoQr?.nombre ?? '' }}</span>
              </div>

              <!-- Token -->
              <div class="assign-cell">
                <span class="token-mono" style="font-size: 0.72rem; word-break: break-all;">{{ a.token }}</span>
              </div>

              <!-- Vence -->
              <div class="assign-cell">
                <span v-if="a.expiracion" :class="isExpired(a.expiracion) ? 'text-warn' : 'text-ok'">
                  {{ formatDate(a.expiracion) }}
                </span>
                <span v-else class="text-muted">—</span>
              </div>

              <!-- Estado -->
              <div class="assign-cell">
                <span class="badge" :class="estadoBadge(a)">{{ estadoLabel(a) }}</span>
              </div>

              <!-- Acciones -->
              <div class="assign-cell cell-actions">
                <button
                  class="btn btn-ghost btn-icon btn-sm"
                  :title="`Ver detalle de ${a.tipoQr?.nombre ?? 'QR'}`"
                  :id="`btn-detail-assign-${a.idUsuarioQr}`"
                  @click="openDetailModal(a)"
                >
                  <AppIcon name="sparkles" size="14" />
                </button>
                <button
                  v-if="a.activo && !a.usado && a.estado?.toLowerCase() !== 'cancelado'"
                  class="btn btn-ghost btn-icon btn-sm btn-danger-ghost"
                  title="Cancelar asignación"
                  :id="`btn-cancel-assign-${a.idUsuarioQr}`"
                  :disabled="cancellingId === a.idUsuarioQr"
                  @click="cancelAssignment(a)"
                >
                  <div v-if="cancellingId === a.idUsuarioQr" class="spinner spinner-sm"></div>
                  <AppIcon v-else name="x" size="14" />
                </button>
                <button
                  class="btn btn-ghost btn-icon btn-sm"
                  style="color: var(--color-danger);"
                  title="Eliminar QR permanentemente"
                  :id="`btn-delete-assign-${a.idUsuarioQr}`"
                  :disabled="deletingId === a.idUsuarioQr"
                  @click="deleteAssignment(a)"
                >
                  <div v-if="deletingId === a.idUsuarioQr" class="spinner spinner-sm"></div>
                  <AppIcon v-else name="trash" size="14" />
                </button>
              </div>
            </div>
          </div>

          <p class="table-footer-copy">
            {{ filteredAssignments.length }} asignación{{ filteredAssignments.length !== 1 ? 'es' : '' }} mostrada{{ filteredAssignments.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <p v-else class="empty-copy">No hay asignaciones que coincidan con los filtros actuales.</p>
      </template>
    </section>

  </div>

  <!-- ════════════════════════════════════════════════
       MODAL — Crear / Editar Tipo QR
  ════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="typeModalOpen" class="modal-backdrop" @click.self="closeTypeModal" id="modal-tipo-qr-backdrop">
        <div class="modal-panel" role="dialog" aria-modal="true" :aria-labelledby="'modal-tipo-title'">

          <div class="modal-header">
            <div class="modal-scan-badge">
              <AppIcon name="qr" size="16" />
              <span>{{ editingType ? 'Editar tipo' : 'Nuevo tipo' }}</span>
            </div>
            <button class="modal-close" @click="closeTypeModal" id="btn-close-tipo-modal">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <h3 class="modal-title" id="modal-tipo-title">
            {{ editingType ? `Editar — ${editingType.nombre}` : 'Crear nuevo tipo QR' }}
          </h3>
          <p class="modal-subtitle">
            {{ editingType ? 'Modifica los datos del tipo de QR seleccionado.' : 'Define el código único y las propiedades del nuevo tipo.' }}
          </p>

          <form @submit.prevent="submitTypeForm" id="form-tipo-qr" class="modal-form">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="tipo-codigo">Código <span class="required">*</span></label>
                <input
                  id="tipo-codigo"
                  v-model="typeForm.codigo"
                  class="form-input"
                  :class="{ error: typeFormErrors.codigo }"
                  placeholder="Ej: ALMUERZO_DIA1"
                  :disabled="!!editingType"
                  required
                />
                <span v-if="typeFormErrors.codigo" class="form-error">
                  <AppIcon name="warning" size="13" /> {{ typeFormErrors.codigo }}
                </span>
                <span v-if="editingType" class="form-hint">El código no puede modificarse.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="tipo-nombre">Nombre <span class="required">*</span></label>
                <input
                  id="tipo-nombre"
                  v-model="typeForm.nombre"
                  class="form-input"
                  :class="{ error: typeFormErrors.nombre }"
                  placeholder="Ej: Almuerzo Día 1"
                  required
                />
                <span v-if="typeFormErrors.nombre" class="form-error">
                  <AppIcon name="warning" size="13" /> {{ typeFormErrors.nombre }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="tipo-descripcion">Descripción</label>
              <textarea
                id="tipo-descripcion"
                v-model="typeForm.descripcion"
                class="form-input"
                placeholder="Descripción opcional del tipo de QR…"
                rows="3"
              ></textarea>
            </div>

            <label class="toggle-row" for="tipo-unico-uso">
              <div class="toggle-info">
                <strong>Requiere único uso</strong>
                <span>El QR sólo puede escanearse una vez.</span>
              </div>
              <div class="toggle-switch" :class="{ on: typeForm.requiereUnicoUso }">
                <input
                  id="tipo-unico-uso"
                  type="checkbox"
                  v-model="typeForm.requiereUnicoUso"
                  class="toggle-input"
                />
                <div class="toggle-thumb"></div>
              </div>
            </label>

            <div v-if="typeFormError" class="form-error-banner">
              <AppIcon name="warning" size="16" />
              {{ typeFormError }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="closeTypeModal" :disabled="typeFormLoading" id="btn-cancel-tipo">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="typeFormLoading" id="btn-submit-tipo">
                <span v-if="!typeFormLoading">
                  <AppIcon name="check-circle" size="16" />
                  <span>{{ editingType ? 'Guardar cambios' : 'Crear tipo QR' }}</span>
                </span>
                <span v-else class="flex items-center gap-sm">
                  <div class="spinner spinner-sm"></div>
                  <span>{{ editingType ? 'Guardando…' : 'Creando…' }}</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ════════════════════════════════════════════════
       MODAL — Detalle de Asignación
  ════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="detailAssignment" class="modal-backdrop" @click.self="detailAssignment = null" id="modal-detail-backdrop">
        <div class="modal-panel modal-panel-detail" role="dialog" aria-modal="true" aria-labelledby="modal-detail-title">

          <div class="modal-header">
            <div class="modal-scan-badge">
              <AppIcon name="qr" size="16" />
              <span>Detalle de asignación</span>
            </div>
            <button class="modal-close" @click="detailAssignment = null" id="btn-close-detail-modal">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <h3 class="modal-title" id="modal-detail-title">
            {{ detailAssignment.tipoQr?.nombre ?? 'QR Asignado' }}
          </h3>

          <div class="detail-fields">
            <div class="detail-row">
              <span class="detail-label">Usuario</span>
              <span class="detail-value">
                {{ detailAssignment.usuario?.nombre ?? `ID ${detailAssignment.idUsuario}` }}
                <span v-if="detailAssignment.usuario?.email" class="detail-email">&lt;{{ detailAssignment.usuario.email }}&gt;</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo QR</span>
              <span class="detail-value">
                <span class="badge badge-accent">{{ detailAssignment.tipoQr?.codigo ?? '—' }}</span>
                {{ detailAssignment.tipoQr?.nombre ?? '' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Descripción</span>
              <span class="detail-value">{{ detailAssignment.tipoQr?.descripcion || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Token</span>
              <span class="detail-value detail-token">{{ detailAssignment.token }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado</span>
              <span class="detail-value">
                <span class="badge" :class="estadoBadge(detailAssignment)">{{ estadoLabel(detailAssignment) }}</span>
              </span>
            </div>
            <div class="detail-row" v-if="detailAssignment.expiracion">
              <span class="detail-label">Expiración</span>
              <span class="detail-value" :class="isExpired(detailAssignment.expiracion) ? 'text-warn' : 'text-ok'">
                {{ formatDate(detailAssignment.expiracion) }}
                <span v-if="isExpired(detailAssignment.expiracion)" class="expiry-tag">Vencido</span>
              </span>
            </div>
            <div class="detail-row" v-if="detailAssignment.fechaUso">
              <span class="detail-label">Fecha de uso</span>
              <span class="detail-value">{{ formatDate(detailAssignment.fechaUso!) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Creado</span>
              <span class="detail-value">{{ formatDate(detailAssignment.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Único uso</span>
              <span class="detail-value">{{ detailAssignment.tipoQr?.requiereUnicoUso ? 'Sí' : 'No' }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-ghost" @click="detailAssignment = null" id="btn-close-detail">
              Cerrar
            </button>
            <button
              v-if="detailAssignment.activo && !detailAssignment.usado && detailAssignment.estado?.toLowerCase() !== 'cancelado'"
              class="btn btn-ghost btn-danger-ghost"
              id="btn-cancel-from-detail"
              :disabled="cancellingId === detailAssignment.idUsuarioQr"
              @click="cancelAssignment(detailAssignment)"
            >
              <div v-if="cancellingId === detailAssignment.idUsuarioQr" class="spinner spinner-sm"></div>
              <template v-else>
                <AppIcon name="x" size="16" />
                <span>Cancelar asignación</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ════════════════════════════════════════════════
       MODAL — Nueva Asignación
  ════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="assignModalOpen" class="modal-backdrop" @click.self="closeAssignModal" id="modal-assign-backdrop">
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-assign-title">

          <div class="modal-header">
            <div class="modal-scan-badge">
              <AppIcon name="user-plus" size="16" />
              <span>Nueva asignación</span>
            </div>
            <button class="modal-close" @click="closeAssignModal" id="btn-close-assign-modal">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <h3 class="modal-title" id="modal-assign-title">Asignar QR a usuario</h3>
          <p class="modal-subtitle">Selecciona el usuario y el tipo de código QR que deseas asignarle.</p>

          <form @submit.prevent="submitAssignForm" id="form-assign-qr" class="modal-form">
            <!-- Buscar Usuario -->
            <div class="form-group relative">
              <label class="form-label" for="assign-user">Buscar Usuario <span class="required">*</span></label>
              <div class="search-wrap">
                <AppIcon name="search" size="14" />
                <input
                  id="assign-user"
                  v-model="userSearchQuery"
                  @input="searchUsers"
                  class="form-input"
                  placeholder="Escribe el nombre o correo del usuario..."
                  autocomplete="off"
                />
              </div>

              <!-- Lista de resultados (dropdown) -->
              <div v-if="userSearchResults.length > 0 && showUserDropdown" class="user-dropdown card">
                <button
                  v-for="u in userSearchResults"
                  :key="u.idUsuario"
                  type="button"
                  class="user-dropdown-item"
                  @click="selectUser(u)"
                >
                  <div class="user-avatar-xs">{{ u.nombre.charAt(0).toUpperCase() }}</div>
                  <div class="cell-user-info">
                    <strong>{{ u.nombre }}</strong>
                    <span>{{ u.email }}</span>
                  </div>
                </button>
              </div>

              <!-- Usuario seleccionado -->
              <div v-if="selectedUser" class="selected-user-card mt-sm">
                <div class="user-avatar-xs">{{ selectedUser.nombre.charAt(0).toUpperCase() }}</div>
                <div class="cell-user-info">
                  <strong>{{ selectedUser.nombre }}</strong>
                  <span>{{ selectedUser.email }}</span>
                </div>
                <button type="button" class="btn btn-ghost btn-sm btn-icon" @click="selectedUser = null">
                  <AppIcon name="x" size="14" />
                </button>
              </div>
            </div>

            <!-- Tipo de QR -->
            <div class="form-group">
              <label class="form-label" for="assign-type">Tipo de QR <span class="required">*</span></label>
              <select v-model="assignForm.idTipoQr" id="assign-type" class="form-input" required>
                <option value="" disabled>Selecciona un tipo de QR...</option>
                <option v-for="t in activeQrTypesList" :key="t.idTipoQr" :value="t.idTipoQr">
                  {{ t.codigo }} - {{ t.nombre }}
                </option>
              </select>
            </div>

            <!-- Expiración -->
            <div class="form-group">
              <label class="form-label" for="assign-exp">Fecha de expiración (Opcional)</label>
              <input
                id="assign-exp"
                type="datetime-local"
                v-model="assignForm.expiracion"
                class="form-input"
              />
            </div>

            <div v-if="assignFormError" class="form-error-banner mt-sm">
              <AppIcon name="warning" size="16" />
              {{ assignFormError }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="closeAssignModal" :disabled="assignFormLoading">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="assignFormLoading || !selectedUser || !assignForm.idTipoQr">
                <span v-if="!assignFormLoading">
                  <AppIcon name="check-circle" size="16" />
                  <span>Asignar QR</span>
                </span>
                <span v-else class="flex items-center gap-sm">
                  <div class="spinner spinner-sm"></div>
                  <span>Asignando…</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ════════════════════════════════════════════════
       MODAL — Asignación Masiva a Rol
  ════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="assignRoleModalOpen" class="modal-backdrop" @click.self="closeAssignRoleModal">
        <div class="modal-panel" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-scan-badge">
              <AppIcon name="users" size="16" />
              <span>Asignación Masiva</span>
            </div>
            <button class="modal-close" @click="closeAssignRoleModal">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <h3 class="modal-title">Asignar a todos los Asistentes</h3>
          <p class="modal-subtitle">Esta acción asignará el tipo de QR seleccionado a todos los usuarios con rol 'user'.</p>

          <form @submit.prevent="submitAssignRoleForm" class="modal-form">
            <div class="form-group">
              <label class="form-label">Tipo de QR a asignar <span class="required">*</span></label>
              <select v-model="assignRoleForm.idTipoQr" class="form-input" required>
                <option value="" disabled>Selecciona un tipo de QR...</option>
                <option v-for="t in activeQrTypesList" :key="t.idTipoQr" :value="t.idTipoQr">
                  {{ t.codigo }} - {{ t.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de expiración (Opcional)</label>
              <input type="datetime-local" v-model="assignRoleForm.expiracion" class="form-input" />
            </div>
            
            <div v-if="assignRoleFormError" class="form-error-banner mt-sm">
              <AppIcon name="warning" size="16" /> {{ assignRoleFormError }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="closeAssignRoleModal" :disabled="assignRoleFormLoading">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="assignRoleFormLoading || !assignRoleForm.idTipoQr">
                <span v-if="!assignRoleFormLoading">
                  <AppIcon name="check-circle" size="16" /> <span>Confirmar Asignación</span>
                </span>
                <span v-else class="flex items-center gap-sm">
                  <div class="spinner spinner-sm"></div> <span>Procesando…</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ════════════════════════════════════════════════
       MODAL — Asignación por Lote
  ════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="assignBatchModalOpen" class="modal-backdrop" @click.self="closeAssignBatchModal">
        <div class="modal-panel" role="dialog" aria-modal="true" style="max-width: 650px;">
          <div class="modal-header">
            <div class="modal-scan-badge">
              <AppIcon name="grid" size="16" />
              <span>Asignación por Lotes</span>
            </div>
            <button class="modal-close" @click="closeAssignBatchModal">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <h3 class="modal-title">Lote: Varios usuarios y Tipos</h3>
          <p class="modal-subtitle">Agrega usuarios a la lista y marca los tipos de QR que deseas asignarles a todos ellos de una sola vez.</p>

          <form @submit.prevent="submitAssignBatchForm" class="modal-form">
            <!-- Buscar y agregar usuarios -->
            <div class="form-group relative">
              <label class="form-label">Buscar y Agregar Usuarios <span class="required">*</span></label>
              <div class="search-wrap">
                <AppIcon name="search" size="14" />
                <input
                  v-model="batchSearchQuery"
                  @input="searchBatchUsers"
                  class="form-input"
                  placeholder="Buscar para agregar..."
                  autocomplete="off"
                />
              </div>

              <div v-if="batchSearchResults.length > 0 && showBatchDropdown" class="user-dropdown card">
                <button
                  v-for="u in batchSearchResults"
                  :key="u.idUsuario"
                  type="button"
                  class="user-dropdown-item"
                  @click="addBatchUser(u)"
                >
                  <div class="user-avatar-xs">{{ u.nombre.charAt(0).toUpperCase() }}</div>
                  <div class="cell-user-info">
                    <strong>{{ u.nombre }}</strong>
                    <span>{{ u.email }}</span>
                  </div>
                </button>
              </div>

              <!-- Lista de usuarios agregados -->
              <div v-if="batchUsers.length > 0" class="batch-users-list mt-sm">
                <div v-for="u in batchUsers" :key="u.idUsuario" class="selected-user-card" style="padding: 0.5rem; margin-bottom: 0.2rem;">
                  <div class="user-avatar-xs">{{ u.nombre.charAt(0).toUpperCase() }}</div>
                  <div class="cell-user-info" style="flex: 1;">
                    <strong>{{ u.nombre }}</strong>
                    <span>{{ u.email }}</span>
                  </div>
                  <button type="button" class="btn btn-ghost btn-sm btn-icon" @click="removeBatchUser(u.idUsuario)">
                    <AppIcon name="x" size="14" />
                  </button>
                </div>
              </div>
              <p v-else class="form-hint" style="margin-top:0.4rem;">No has agregado usuarios al lote.</p>
            </div>

            <!-- Tipos de QR (Checkbox list) -->
            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">Tipos de QR a asignar <span class="required">*</span></label>
              <div class="batch-qr-grid">
                <label v-for="t in activeQrTypesList" :key="t.idTipoQr" class="batch-qr-item" :class="{ 'selected': assignBatchForm.idTiposQr.includes(t.idTipoQr) }">
                  <input type="checkbox" :value="t.idTipoQr" v-model="assignBatchForm.idTiposQr" style="display:none;" />
                  <AppIcon :name="assignBatchForm.idTiposQr.includes(t.idTipoQr) ? 'check-square' : 'square'" size="16" />
                  <div style="flex:1;">
                    <strong>{{ t.codigo }}</strong>
                    <span style="display:block; font-size:0.75rem; color:var(--color-text-secondary);">{{ t.nombre }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Expiración -->
            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">Fecha de expiración conjunta (Opcional)</label>
              <input type="datetime-local" v-model="assignBatchForm.expiracion" class="form-input" />
            </div>
            
            <div v-if="assignBatchFormError" class="form-error-banner mt-sm">
              <AppIcon name="warning" size="16" /> {{ assignBatchFormError }}
            </div>

            <div class="modal-actions" style="margin-top: 1rem;">
              <button type="button" class="btn btn-ghost" @click="closeAssignBatchModal" :disabled="assignBatchFormLoading">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="assignBatchFormLoading || batchUsers.length === 0 || assignBatchForm.idTiposQr.length === 0">
                <span v-if="!assignBatchFormLoading">
                  <AppIcon name="check-circle" size="16" /> <span>Asignar Lote</span>
                </span>
                <span v-else class="flex items-center gap-sm">
                  <div class="spinner spinner-sm"></div> <span>Procesando…</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import qrApi, { type TipoQr, type UsuarioQr } from '@/api/qr.api'
import usersApi, { type UserRecord } from '@/api/users.api'
import AlertMessage from '@/components/shared/AlertMessage.vue'
import AppIcon from '@/components/shared/AppIcon.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

// ── Global state ────────────────────────────────────────────────────────────
const activeTab = ref<'tipos' | 'asignaciones'>('tipos')
const globalError = ref('')
const globalSuccess = ref('')

function showSuccess(msg: string) {
  globalSuccess.value = msg
  setTimeout(() => { globalSuccess.value = '' }, 4000)
}

// ── Tipos QR ────────────────────────────────────────────────────────────────
const qrTypes = ref<TipoQr[]>([])
const typesLoading = ref(false)
const typeSearch = ref('')
const typeFilter = ref<'all' | 'activo' | 'inactivo'>('all')
const togglingId = ref<number | null>(null)

const activeQrTypes = computed(() => qrTypes.value.filter((t) => t.activo).length)

const filteredTypes = computed(() => {
  let list = qrTypes.value

  if (typeFilter.value === 'activo') list = list.filter((t) => t.activo)
  else if (typeFilter.value === 'inactivo') list = list.filter((t) => !t.activo)

  const q = typeSearch.value.trim().toLowerCase()
  if (q) list = list.filter((t) =>
    t.codigo.toLowerCase().includes(q) || t.nombre.toLowerCase().includes(q),
  )

  return list
})

async function loadTypes() {
  typesLoading.value = true
  try {
    qrTypes.value = await qrApi.listTipos()
  } catch (err: any) {
    globalError.value = err?.response?.data?.message ?? 'No se pudieron cargar los tipos de QR.'
  } finally {
    typesLoading.value = false
  }
}

async function toggleTypeActive(type: TipoQr) {
  togglingId.value = type.idTipoQr
  try {
    const updated = await qrApi.updateTipo(type.idTipoQr, { activo: !type.activo })
    qrTypes.value = qrTypes.value.map((t) => (t.idTipoQr === updated.idTipoQr ? updated : t))
    showSuccess(`Tipo "${updated.nombre}" ${updated.activo ? 'activado' : 'desactivado'} correctamente.`)
  } catch (err: any) {
    globalError.value = err?.response?.data?.message ?? 'No se pudo actualizar el estado del tipo.'
  } finally {
    togglingId.value = null
  }
}

// ── Modal Tipo QR ────────────────────────────────────────────────────────────
const typeModalOpen = ref(false)
const editingType = ref<TipoQr | null>(null)
const typeFormLoading = ref(false)
const typeFormError = ref('')

const typeForm = reactive({
  codigo: '',
  nombre: '',
  descripcion: '',
  requiereUnicoUso: false,
})

const typeFormErrors = reactive({
  codigo: '',
  nombre: '',
})

function resetTypeForm() {
  typeForm.codigo = ''
  typeForm.nombre = ''
  typeForm.descripcion = ''
  typeForm.requiereUnicoUso = false
  typeFormErrors.codigo = ''
  typeFormErrors.nombre = ''
  typeFormError.value = ''
}

function openCreateTypeModal() {
  editingType.value = null
  resetTypeForm()
  typeModalOpen.value = true
}

function openEditTypeModal(type: TipoQr) {
  editingType.value = type
  typeForm.codigo = type.codigo
  typeForm.nombre = type.nombre
  typeForm.descripcion = type.descripcion ?? ''
  typeForm.requiereUnicoUso = type.requiereUnicoUso
  typeFormErrors.codigo = ''
  typeFormErrors.nombre = ''
  typeFormError.value = ''
  typeModalOpen.value = true
}

function closeTypeModal() {
  typeModalOpen.value = false
  editingType.value = null
  resetTypeForm()
}

function validateTypeForm() {
  let valid = true
  typeFormErrors.codigo = ''
  typeFormErrors.nombre = ''

  if (!editingType.value && !typeForm.codigo.trim()) {
    typeFormErrors.codigo = 'El código es obligatorio.'
    valid = false
  } else if (!editingType.value && !/^[A-Z0-9_]+$/.test(typeForm.codigo.toUpperCase())) {
    typeFormErrors.codigo = 'Solo letras, números y guiones bajos.'
    valid = false
  }

  if (!typeForm.nombre.trim()) {
    typeFormErrors.nombre = 'El nombre es obligatorio.'
    valid = false
  }

  return valid
}

async function submitTypeForm() {
  if (!validateTypeForm()) return

  typeFormLoading.value = true
  typeFormError.value = ''

  try {
    if (editingType.value) {
      const updated = await qrApi.updateTipo(editingType.value.idTipoQr, {
        nombre: typeForm.nombre.trim(),
        descripcion: typeForm.descripcion.trim() || undefined,
        requiereUnicoUso: typeForm.requiereUnicoUso,
      })
      qrTypes.value = qrTypes.value.map((t) => (t.idTipoQr === updated.idTipoQr ? updated : t))
      showSuccess(`Tipo "${updated.nombre}" actualizado correctamente.`)
    } else {
      const created = await qrApi.createTipo({
        codigo: typeForm.codigo.trim().toUpperCase(),
        nombre: typeForm.nombre.trim(),
        descripcion: typeForm.descripcion.trim() || undefined,
        requiereUnicoUso: typeForm.requiereUnicoUso,
      })
      qrTypes.value = [created, ...qrTypes.value]
      showSuccess(`Tipo "${created.nombre}" creado exitosamente.`)
    }
    closeTypeModal()
  } catch (err: any) {
    typeFormError.value = err?.response?.data?.message ?? 'No se pudo guardar el tipo de QR.'
  } finally {
    typeFormLoading.value = false
  }
}

const deletingTypeId = ref<number | null>(null)
async function deleteType(t: TipoQr) {
  if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el Tipo QR "${t.nombre}"? Esta acción no se puede deshacer y fallará si el tipo de QR ya ha sido asignado a algún usuario.`)) {
    return
  }

  deletingTypeId.value = t.idTipoQr
  try {
    await qrApi.deleteType(t.idTipoQr)
    qrTypes.value = qrTypes.value.filter(item => item.idTipoQr !== t.idTipoQr)
    showSuccess(`Tipo QR "${t.nombre}" eliminado correctamente.`)
  } catch (err: any) {
    globalError.value = err?.response?.data?.message ?? 'Ocurrió un error al eliminar el tipo de QR. Es posible que tenga asignaciones activas.'
  } finally {
    deletingTypeId.value = null
  }
}

// ── Asignaciones ────────────────────────────────────────────────────────────
const assignments = ref<UsuarioQr[]>([])
const assignmentsLoading = ref(false)
const assignSearch = ref('')
const assignTypeFilter = ref<number | ''>('')
const assignStatusFilter = ref('')
const cancellingId = ref<string | null>(null)
const detailAssignment = ref<UsuarioQr | null>(null)

const usedAssignments = computed(() =>
  assignments.value.filter((a) => a.usado || a.estado?.toLowerCase() === 'usado').length,
)

const filteredAssignments = computed(() => {
  let list = assignments.value

  if (assignTypeFilter.value !== '') {
    list = list.filter((a) => a.idTipoQr === Number(assignTypeFilter.value))
  }

  if (assignStatusFilter.value) {
    const s = assignStatusFilter.value.toLowerCase()
    list = list.filter((a) => {
      const estado = a.estado?.toLowerCase() ?? ''
      if (s === 'activo') return a.activo && !a.usado && estado !== 'cancelado'
      if (s === 'usado') return a.usado || estado === 'usado'
      if (s === 'cancelado') return estado === 'cancelado' || !a.activo
      return true
    })
  }

  const q = assignSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter((a) => {
      const nombre = a.usuario?.nombre?.toLowerCase() ?? ''
      const email = a.usuario?.email?.toLowerCase() ?? ''
      return nombre.includes(q) || email.includes(q)
    })
  }

  return list
})

async function reloadAssignments() {
  assignmentsLoading.value = true
  try {
    assignments.value = await qrApi.listAssignments()
  } catch (err: any) {
    globalError.value = err?.response?.data?.message ?? 'No se pudieron cargar las asignaciones.'
  } finally {
    assignmentsLoading.value = false
  }
}

async function cancelAssignment(a: UsuarioQr) {
  cancellingId.value = a.idUsuarioQr
  try {
    const updated = await qrApi.cancelAssignment({ idUsuarioQr: a.idUsuarioQr })
    assignments.value = assignments.value.map((item) =>
      item.idUsuarioQr === updated.idUsuarioQr ? updated : item,
    )
    if (detailAssignment.value?.idUsuarioQr === updated.idUsuarioQr) {
      detailAssignment.value = updated
    }
    showSuccess('Asignación cancelada correctamente.')
  } catch (err: any) {
    globalError.value = err?.response?.data?.message ?? 'No se pudo cancelar la asignación.'
  } finally {
    cancellingId.value = null
  }
}

const deletingId = ref<string | null>(null)
async function deleteAssignment(a: UsuarioQr) {
  if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el QR asignado a ${a.usuario?.nombre}? Esta acción no se puede deshacer.`)) {
    return
  }
  
  deletingId.value = a.idUsuarioQr
  try {
    await qrApi.deleteAssignment(a.idUsuarioQr)
    assignments.value = assignments.value.filter((item) => item.idUsuarioQr !== a.idUsuarioQr)
    showSuccess(`QR de ${a.usuario?.nombre} eliminado permanentemente.`)
  } catch (err: any) {
    globalError.value = err?.response?.data?.message ?? 'Ocurrió un error al eliminar la asignación.'
  } finally {
    deletingId.value = null
  }
}

function openDetailModal(a: UsuarioQr) {
  detailAssignment.value = a
}

// ── Modal Asignación ────────────────────────────────────────────────────────
const assignModalOpen = ref(false)
const assignFormLoading = ref(false)
const assignFormError = ref('')
const activeQrTypesList = computed(() => qrTypes.value.filter(t => t.activo))

const userSearchQuery = ref('')
const userSearchResults = ref<UserRecord[]>([])
const showUserDropdown = ref(false)
const selectedUser = ref<UserRecord | null>(null)
let userSearchTimeout: any = null

const assignForm = reactive({
  idTipoQr: '' as number | '',
  expiracion: ''
})

function openAssignModal() {
  assignModalOpen.value = true
  selectedUser.value = null
  userSearchQuery.value = ''
  userSearchResults.value = []
  assignForm.idTipoQr = ''
  assignForm.expiracion = ''
  assignFormError.value = ''
}

function closeAssignModal() {
  assignModalOpen.value = false
}

function searchUsers() {
  if (userSearchTimeout) clearTimeout(userSearchTimeout)
  if (!userSearchQuery.value || userSearchQuery.value.length < 2) {
    userSearchResults.value = []
    showUserDropdown.value = false
    return
  }
  
  userSearchTimeout = setTimeout(async () => {
    try {
      const res = await usersApi.list({ search: userSearchQuery.value, limit: 5 })
      userSearchResults.value = res.data
      showUserDropdown.value = true
    } catch (err) {
      console.error('Error searching users', err)
    }
  }, 300)
}

function selectUser(user: UserRecord) {
  selectedUser.value = user
  userSearchQuery.value = ''
  showUserDropdown.value = false
}

async function submitAssignForm() {
  if (!selectedUser.value || !assignForm.idTipoQr) return
  
  assignFormLoading.value = true
  assignFormError.value = ''
  
  try {
    const payload: any = {
      idUsuario: selectedUser.value.idUsuario,
      idTipoQr: Number(assignForm.idTipoQr)
    }
    
    if (assignForm.expiracion) {
      payload.expiracion = new Date(assignForm.expiracion).toISOString()
    }
    
    await qrApi.assignToUser(payload)
    showSuccess(`QR asignado a ${selectedUser.value.nombre} correctamente.`)
    closeAssignModal()
    reloadAssignments()
  } catch (err: any) {
    assignFormError.value = err?.response?.data?.message ?? 'Ocurrió un error al asignar el QR.'
  } finally {
    assignFormLoading.value = false
  }
}

// ── Modal Asignación Masiva (Rol) ───────────────────────────────────────────
const assignRoleModalOpen = ref(false)
const assignRoleFormLoading = ref(false)
const assignRoleFormError = ref('')
const assignRoleForm = reactive({
  idTipoQr: '' as number | '',
  expiracion: ''
})

function openAssignRoleModal() {
  assignRoleModalOpen.value = true
  assignRoleForm.idTipoQr = ''
  assignRoleForm.expiracion = ''
  assignRoleFormError.value = ''
}

function closeAssignRoleModal() {
  assignRoleModalOpen.value = false
}

async function submitAssignRoleForm() {
  if (!assignRoleForm.idTipoQr) return
  
  assignRoleFormLoading.value = true
  assignRoleFormError.value = ''
  
  try {
    const payload: any = {
      idTipoQr: Number(assignRoleForm.idTipoQr)
    }
    
    if (assignRoleForm.expiracion) {
      payload.expiracion = new Date(assignRoleForm.expiracion).toISOString()
    }
    
    const res = await qrApi.assignToRoleUser(payload)
    showSuccess(`Asignación masiva completada: ${res.asignados} asignados, ${res.omitidos} omitidos.`)
    closeAssignRoleModal()
    reloadAssignments()
  } catch (err: any) {
    assignRoleFormError.value = err?.response?.data?.message ?? 'Ocurrió un error en la asignación masiva.'
  } finally {
    assignRoleFormLoading.value = false
  }
}

// ── Modal Asignación por Lotes ──────────────────────────────────────────────
const assignBatchModalOpen = ref(false)
const assignBatchFormLoading = ref(false)
const assignBatchFormError = ref('')
const assignBatchForm = reactive({
  idTiposQr: [] as number[],
  expiracion: ''
})

const batchSearchQuery = ref('')
const batchSearchResults = ref<UserRecord[]>([])
const showBatchDropdown = ref(false)
const batchUsers = ref<UserRecord[]>([])
let batchSearchTimeout: any = null

function openAssignBatchModal() {
  assignBatchModalOpen.value = true
  batchUsers.value = []
  batchSearchQuery.value = ''
  batchSearchResults.value = []
  showBatchDropdown.value = false
  assignBatchForm.idTiposQr = []
  assignBatchForm.expiracion = ''
  assignBatchFormError.value = ''
}

function closeAssignBatchModal() {
  assignBatchModalOpen.value = false
}

function searchBatchUsers() {
  if (batchSearchTimeout) clearTimeout(batchSearchTimeout)
  if (!batchSearchQuery.value || batchSearchQuery.value.length < 2) {
    batchSearchResults.value = []
    showBatchDropdown.value = false
    return
  }
  
  batchSearchTimeout = setTimeout(async () => {
    try {
      const res = await usersApi.list({ search: batchSearchQuery.value, limit: 10 })
      // Filter out users already added to batch
      const addedIds = batchUsers.value.map(u => u.idUsuario)
      batchSearchResults.value = res.data.filter(u => !addedIds.includes(u.idUsuario))
      showBatchDropdown.value = true
    } catch (err) {
      console.error('Error searching users for batch', err)
    }
  }, 300)
}

function addBatchUser(user: UserRecord) {
  batchUsers.value.push(user)
  batchSearchQuery.value = ''
  showBatchDropdown.value = false
  batchSearchResults.value = []
}

function removeBatchUser(idUsuario: number) {
  batchUsers.value = batchUsers.value.filter(u => u.idUsuario !== idUsuario)
}

async function submitAssignBatchForm() {
  if (batchUsers.value.length === 0 || assignBatchForm.idTiposQr.length === 0) return
  
  assignBatchFormLoading.value = true
  assignBatchFormError.value = ''
  
  try {
    const payload: any = {
      idUsuarios: batchUsers.value.map(u => u.idUsuario),
      idTiposQr: assignBatchForm.idTiposQr
    }
    
    if (assignBatchForm.expiracion) {
      payload.expiracion = new Date(assignBatchForm.expiracion).toISOString()
    }
    
    const res = await qrApi.assignBatch(payload)
    showSuccess(`Asignación por lotes completada: ${res.asignados} asignados, ${res.omitidos} omitidos.`)
    closeAssignBatchModal()
    reloadAssignments()
  } catch (err: any) {
    assignBatchFormError.value = err?.response?.data?.message ?? 'Ocurrió un error en la asignación por lotes.'
  } finally {
    assignBatchFormLoading.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function shortToken(token: string) {
  return token ? `${token.slice(0, 8)}···${token.slice(-4)}` : '—'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date()
}

function estadoLabel(a: UsuarioQr) {
  const s = a.estado?.toLowerCase() ?? ''
  if (!a.activo || s === 'cancelado') return 'Cancelado'
  if (a.usado || s === 'usado') return 'Usado'
  return 'Activo'
}

function estadoBadge(a: UsuarioQr) {
  const s = a.estado?.toLowerCase() ?? ''
  if (!a.activo || s === 'cancelado') return 'badge-muted'
  if (a.usado || s === 'usado') return 'badge-warning'
  return 'badge-success'
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([loadTypes(), reloadAssignments()])
})
</script>

<style scoped>
.qr-admin-page {
  display: grid;
  gap: 1rem;
  animation: fadeIn 0.4s ease;
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.qr-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-kicker {
  display: block;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #8cdfff;
  margin-bottom: 0.35rem;
}

.hero-title {
  font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  letter-spacing: -0.04em;
  margin-bottom: 0.3rem;
}

.hero-copy {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.hero-stats {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.stat-pill {
  padding: 0.6rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  text-align: center;
  min-width: 64px;
}

.stat-num {
  display: block;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #8cdfff;
}

.stat-label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.35rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 0.95rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(0, 169, 224, 0.2), rgba(0, 98, 155, 0.18));
  color: #8cdfff;
  border: 1px solid rgba(0, 169, 224, 0.22);
}

.tab-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
}

.tab-btn.active .tab-badge {
  background: rgba(0, 169, 224, 0.18);
  color: #8cdfff;
}

/* ── Tab content ───────────────────────────────────────────────────────────── */
.tab-content {
  animation: fadeIn 0.3s ease;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.15rem;
  letter-spacing: -0.03em;
  margin-bottom: 0.2rem;
}

.section-copy {
  color: var(--color-text-secondary);
  font-size: 0.86rem;
}

/* ── Toolbar ───────────────────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-multi {
  align-items: stretch;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
  padding: 0.7rem 0.9rem;
  border-radius: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-secondary);
}

.toolbar-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  font-size: 0.88rem;
  color: var(--color-text-primary);
}

.toolbar-input::placeholder {
  color: var(--color-text-muted);
}

.filter-group {
  display: flex;
  gap: 0.4rem;
}

.filter-chip {
  padding: 0.5rem 0.9rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-chip:hover {
  border-color: rgba(0, 169, 224, 0.25);
  color: var(--color-text-primary);
}

.filter-chip.active {
  background: rgba(0, 169, 224, 0.14);
  border-color: rgba(0, 169, 224, 0.3);
  color: #8cdfff;
}

.select-filter {
  min-width: 170px;
  padding: 0.65rem 0.85rem;
  font-size: 0.86rem;
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
}

.select-filter option {
  background: #0d1b2c;
}

/* ── Types grid ────────────────────────────────────────────────────────────── */
.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.type-card {
  padding: 1.15rem;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.type-card:hover {
  border-color: rgba(0, 169, 224, 0.2);
  transform: translateY(-2px);
}

.type-inactive {
  opacity: 0.55;
}

.type-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.type-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 0.95rem;
  background: rgba(0, 169, 224, 0.1);
  border: 1px solid rgba(0, 169, 224, 0.15);
  color: #8cdfff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: flex-end;
}

.type-code {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
}

.type-name {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.type-desc {
  font-size: 0.83rem;
  color: var(--color-text-secondary);
  flex: 1;
  line-height: 1.5;
}

.type-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

/* ── Assignments table ─────────────────────────────────────────────────────── */
.assign-table-wrap {
  overflow-x: auto;
}

.assign-table {
  min-width: 700px;
  display: grid;
  gap: 0.5rem;
}

.assign-row {
  display: grid;
  grid-template-columns: 2fr 1.4fr 1.3fr 1.1fr 1fr 0.8fr;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-radius: 0.95rem;
  align-items: center;
  transition: background var(--transition-fast);
}

.assign-row-head {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0;
}

.assign-row:not(.assign-row-head) {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.assign-row:not(.assign-row-head):hover {
  background: rgba(0, 169, 224, 0.06);
  border-color: rgba(0, 169, 224, 0.12);
}

.row-used {
  opacity: 0.7;
}

.row-cancelled {
  opacity: 0.45;
}

.assign-cell {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  flex-wrap: wrap;
}

.cell-user {
  gap: 0.6rem;
  flex-wrap: nowrap;
}

.cell-user-info {
  display: grid;
  gap: 0.05rem;
  min-width: 0;
}

.cell-user-info strong {
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-user-info span {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.cell-actions {
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.user-avatar-xs {
  width: 34px;
  height: 34px;
  border-radius: 0.75rem;
  background: linear-gradient(145deg, rgba(0, 169, 224, 0.3), rgba(0, 98, 155, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.token-mono {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: rgba(140, 223, 255, 0.75);
}

.text-ok { color: #10b981; }
.text-warn { color: #f59e0b; }
.text-muted { color: var(--color-text-muted); }

.table-footer-copy {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: right;
}

/* ── Loading / empty ───────────────────────────────────────────────────────── */
.loading-wrap {
  padding: 2rem 0;
}

.empty-copy {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 2rem 1rem;
}

/* ── Danger ghost btn ──────────────────────────────────────────────────────── */
.btn-danger-ghost:hover:not(:disabled) {
  background: rgba(226, 0, 26, 0.12);
  color: #ff9ca7;
  border-color: rgba(226, 0, 26, 0.3);
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

.modal-panel-detail {
  max-width: 480px;
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

/* ── Modal Form ─────────────────────────────────────────────────────────────── */
.modal-form {
  display: grid;
  gap: 1rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.35rem;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
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

/* ── Toggle ─────────────────────────────────────────────────────────────────── */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.toggle-row:hover {
  border-color: rgba(0, 169, 224, 0.2);
}

.toggle-info {
  display: grid;
  gap: 0.1rem;
}

.toggle-info strong {
  font-size: 0.9rem;
}

.toggle-info span {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.toggle-switch {
  position: relative;
  width: 46px;
  height: 26px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.toggle-switch.on {
  background: rgba(0, 169, 224, 0.35);
  border-color: rgba(0, 169, 224, 0.5);
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transition: transform var(--transition-fast), background var(--transition-fast);
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(20px);
  background: #8cdfff;
}

/* ── Modal actions ─────────────────────────────────────────────────────────── */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.modal-actions .btn:last-child {
  flex: 1;
}

/* ── Detail modal ───────────────────────────────────────────────────────────── */
.detail-fields {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: start;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  padding-top: 0.1rem;
}

.detail-value {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  word-break: break-all;
}

.detail-email {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.detail-token {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: rgba(140, 223, 255, 0.75);
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

/* ── User Search Dropdown ───────────────────────────────────────────────────── */
.relative {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: #112031;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.user-dropdown-item:hover, .user-dropdown-item:focus {
  background: rgba(255, 255, 255, 0.05);
  outline: none;
}

.selected-user-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-radius: 0.8rem;
  background: rgba(0, 169, 224, 0.1);
  border: 1px solid rgba(0, 169, 224, 0.3);
}

.batch-users-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 200px;
  overflow-y: auto;
}

.batch-qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}

.batch-qr-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-qr-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.batch-qr-item.selected {
  background: rgba(0, 169, 224, 0.15);
  border-color: #00a9e0;
}

.batch-qr-item.selected svg {
  color: #00a9e0;
}

/* ── Modal animations ───────────────────────────────────────────────────────── */
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
  transition: transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
  transform: translateY(24px) scale(0.97);
  opacity: 0;
}

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .qr-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .assign-row {
    grid-template-columns: 1.5fr 1fr 1fr 0.9fr 0.8fr 0.7fr;
  }
}

@media (max-width: 640px) {
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .toolbar-multi {
    flex-direction: column;
    align-items: stretch;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
  }

  .modal-panel {
    padding: 1.25rem;
    border-radius: 1.35rem;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
}
</style>
