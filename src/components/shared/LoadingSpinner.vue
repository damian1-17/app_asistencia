<template>
  <div class="loading-wrap" :class="{ overlay: overlay }">
    <div class="spinner" :class="{ 'spinner-sm': size === 'sm' }" role="status" aria-label="Cargando..." />
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    text?: string
    overlay?: boolean
  }>(),
  { size: 'md', overlay: false },
)
</script>

<style scoped>
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

.loading-wrap.overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 15, 26, 0.7);
  backdrop-filter: blur(4px);
  border-radius: inherit;
  z-index: 10;
  padding: 0;
}

.loading-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
