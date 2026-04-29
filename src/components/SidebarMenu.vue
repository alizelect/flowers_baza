<script setup lang="ts">
import { SECTION_LABELS, type SectionKey } from '../types'

type PriceTablesSectionKey = Exclude<SectionKey, 'priceTables'>

defineProps<{ active: SectionKey, activePriceTablesSection: PriceTablesSectionKey }>()
const emit = defineEmits<{
  change: [SectionKey]
  changePriceTablesSection: [PriceTablesSectionKey]
}>()

const sections = Object.keys(SECTION_LABELS) as SectionKey[]
const priceTablesSections: PriceTablesSectionKey[] = ['osnovnye', 'sezonnye']
const sidebarTitle = '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438'
</script>

<template>
  <aside class="sidebar">
    <h2>{{ sidebarTitle }}</h2>
    <div class="sidebar-menu-list">
      <template v-for="key in sections" :key="key">
        <button
          class="menu-btn"
          :class="{ active: active === key }"
          @click="emit('change', key)"
        >
          {{ SECTION_LABELS[key] }}
        </button>
        <div v-if="key === 'priceTables'" class="sidebar-submenu">
          <button
            v-for="subKey in priceTablesSections"
            :key="subKey"
            type="button"
            class="sidebar-submenu-btn"
            :class="{ active: active === 'priceTables' && activePriceTablesSection === subKey }"
            @click="emit('changePriceTablesSection', subKey)"
          >
            {{ SECTION_LABELS[subKey] }}
          </button>
        </div>
      </template>
    </div>
    <div class="sidebar-footer">
      <slot />
    </div>
  </aside>
</template>
