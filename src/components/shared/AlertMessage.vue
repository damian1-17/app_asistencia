<template>
  <div class="alert" :class="`alert-${type}`" role="alert">
    <span class="alert-icon">{{ icon }}</span>
    <span>{{ message }}</span>
    <button v-if="dismissible" class="alert-close" @click="$emit('dismiss')" aria-label="Cerrar">✕</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    type?: 'success' | 'error' | 'warning' | 'info'
    message: string
    dismissible?: boolean
  }>(),
  { type: 'info', dismissible: false },
)

defineEmits<{ dismiss: [] }>()

const icon = computed(() => {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
  return icons[props.type]
})
</script>

<style scoped>
.alert-icon {
  font-weight: 700;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  font-size: 0.8rem;
  padding: 0 4px;
  transition: opacity 0.15s;
}

.alert-close:hover {
  opacity: 1;
}
</style>
