<template>
  <svg
    class="app-icon"
    :class="[`app-icon-${name}`]"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </template>
    <template v-else-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.3 2.3 4.7-4.8" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="m15 18-6-6 6-6" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9 18 6-6-6-6" />
    </template>
    <template v-else-if="name === 'clipboard'">
      <rect x="7" y="5" width="10" height="14" rx="2" />
      <path d="M9 5.5h6M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5v1h-8v-1A1.5 1.5 0 0 1 9.5 3Z" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>
    <template v-else-if="name === 'download'">
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </template>
    <template v-else-if="name === 'grid'">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </template>
    <template v-else-if="name === 'home'">
      <path d="m4 11 8-7 8 7" />
      <path d="M6 10.8V20h12v-9.2" />
    </template>
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7.5h.01" />
    </template>
    <template v-else-if="name === 'key'">
      <circle cx="8" cy="12" r="3" />
      <path d="M11 12h10" />
      <path d="M18 12v-2M15 12v3" />
    </template>
    <template v-else-if="name === 'location'">
      <path d="M12 20s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>
    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="m12 4 6 3-6 3-6-3 6-3Z" />
      <path d="M6 7v5c0 2 2.7 4 6 4s6-2 6-4V7" />
      <path d="M12 16v4" />
    </template>
    <template v-else-if="name === 'qr'">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
    </template>
    <template v-else-if="name === 'refresh'">
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M6.5 9A7 7 0 0 1 18 6M17.5 15A7 7 0 0 1 6 18" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3 5 6v5c0 4.2 2.4 7.7 7 10 4.6-2.3 7-5.8 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4" />
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="m12 3 1.2 3.1L16.3 7l-3.1 1.1L12 11.2l-1.2-3.1L7.7 7l3.1-.9L12 3Z" />
      <path d="m18 13 .8 2.1 2.2.8-2.2.8L18 19l-.8-2.1-2.2-.8 2.2-.8L18 13Z" />
      <path d="m6 14 .9 2.4 2.4.9-2.4.9L6 20.5l-.9-2.3-2.4-.9 2.4-.9L6 14Z" />
    </template>
    <template v-else-if="name === 'ticket'">
      <path d="M4 9a2 2 0 0 0 0 6v3h16v-3a2 2 0 0 0 0-6V6H4Z" />
      <path d="M9 6v12" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </template>
    <template v-else-if="name === 'warning'">
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </template>
    <template v-else-if="name === 'x'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  size?: number | string
}>()
</script>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
}
</style>
