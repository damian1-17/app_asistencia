<template>
  <div class="not-found-page">
    <div class="not-found-content card">
      <div class="error-code">404</div>
      <h1 class="error-title">Pagina no encontrada</h1>
      <p class="error-desc">La ruta que intentas abrir no existe o fue movida dentro de la plataforma.</p>
      <div class="error-actions">
        <RouterLink to="/" class="btn btn-primary btn-lg" id="nf-btn-home">
          <AppIcon name="home" size="18" />
          <span>Ir al inicio</span>
        </RouterLink>
        <RouterLink to="/dashboard/mis-qrs" class="btn btn-ghost btn-lg" id="nf-btn-dashboard">
          <AppIcon name="qr" size="18" />
          <span>Mis QRs</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/shared/AppIcon.vue'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.not-found-content {
  max-width: 620px;
  text-align: center;
}

.error-code {
  font-size: clamp(5rem, 12vw, 8rem);
  font-weight: 900;
  line-height: 1;
  color: #8cdfff;
  margin-bottom: 1rem;
}

.error-title {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: 0.7rem;
  letter-spacing: -0.04em;
}

.error-desc {
  color: var(--color-text-secondary);
  margin-bottom: 1.6rem;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.error-actions span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
