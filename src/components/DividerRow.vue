<script setup lang="ts">
import type { Divider } from '../types'

defineProps<{
  divider: Divider
  unlocked: boolean
}>()

defineEmits<{
  remove: [id: string]
  'label-input': [id: string, value: string]
}>()
</script>

<template>
  <tr class="section-divider-row">
    <td v-if="unlocked" class="drag-handle-cell">⠿</td>
    <td :colspan="unlocked ? 10 : 9" class="section-divider-cell">
      <div class="section-divider-inner">
        <template v-if="unlocked">
          <input
            class="section-divider-input"
            :value="divider.label || ''"
            placeholder="Разделитель"
            @input="$emit('label-input', divider.id, ($event.target as HTMLInputElement).value)"
          />
          <button type="button" class="section-divider-remove" title="Удалить разделитель" @click="$emit('remove', divider.id)">×</button>
        </template>
        <span v-else class="section-divider-label">{{ divider.label }}</span>
      </div>
    </td>
  </tr>
</template>
