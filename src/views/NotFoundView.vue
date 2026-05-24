<template>
  <div class="not-found-page">
    <div class="not-found-bg">
      <div class="nf-orb"></div>
    </div>
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">Página no encontrada</h1>
      <p class="error-desc">La página que buscas no existe o fue movida.</p>
      <div class="error-actions">
        <RouterLink to="/" class="btn btn-primary btn-lg" id="nf-btn-home">🏠 Ir al inicio</RouterLink>
        <RouterLink to="/dashboard/mis-qrs" class="btn btn-ghost btn-lg" id="nf-btn-dashboard">📱 Mis QRs</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.not-found-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.nf-orb {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(60px);
}

.not-found-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--spacing-xl);
  animation: slideInUp 0.5s ease;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
}

.error-desc {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-2xl);
}

.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}
</style>
