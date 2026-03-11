<script setup lang="ts">
import { SECTION_LABELS, type SectionKey } from '../types'

defineProps<{ active: SectionKey }>()
const emit = defineEmits<{ change: [SectionKey] }>()

const sections = Object.keys(SECTION_LABELS) as SectionKey[]
</script>

<template>
  <aside class="sidebar">
    <h2>Категории</h2>
    <button
      v-for="key in sections"
      :key="key"
      class="menu-btn"
      :class="{ active: active === key }"
      @click="emit('change', key)"
    >
      {{ SECTION_LABELS[key] }}
    </button>
  </aside>
</template>
