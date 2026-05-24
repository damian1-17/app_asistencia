<template>
  <div class="alert" :class="`alert-${type}`" role="alert">
    <span class="alert-icon">
      <AppIcon :name="icon" size="16" />
    </span>
    <span>{{ message }}</span>
    <button v-if="dismissible" class="alert-close" @click="$emit('dismiss')" aria-label="Cerrar">
      <AppIcon name="x" size="14" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/shared/AppIcon.vue'

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
  const icons = {
    success: 'check-circle',
    error: 'x',
    warning: 'warning',
    info: 'info',
  } as const

  return icons[props.type]
})
</script>

<style scoped>
.alert-icon {
  flex-shrink: 0;
  display: inline-flex;
  margin-top: 1px;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  transition: opacity 0.15s;
}

.alert-close:hover {
  opacity: 1;
}
</style>
