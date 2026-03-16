<script setup lang="ts">
import { SECTION_LABELS, type SectionKey } from '../types'

defineProps<{ active: SectionKey }>()
const emit = defineEmits<{ change: [SectionKey] }>()

const sections = Object.keys(SECTION_LABELS) as SectionKey[]
const sidebarTitle = '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438'
</script>

<template>
  <aside class="sidebar">
    <h2>{{ sidebarTitle }}</h2>
    <div class="sidebar-menu-list">
      <button
        v-for="key in sections"
        :key="key"
        class="menu-btn"
        :class="{ active: active === key }"
        @click="emit('change', key)"
      >
        {{ SECTION_LABELS[key] }}
      </button>
    </div>
    <div class="sidebar-footer">
      <slot />
    </div>
  </aside>
</template>
