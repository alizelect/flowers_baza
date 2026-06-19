<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FlowerItem } from '../types'

const props = defineProps<{
  modelValue: boolean
  item: FlowerItem
  qtyOptions: number[]
  computePackaging: (qty: number) => number
  computePistachio: (qty: number) => number
  showPistachio: boolean
  saving: boolean
  saveError: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [packagingTable: Record<number, number>, pistachioTable: Record<number, number>]
}>()

const packagingOverrides = ref<Record<number, string>>({})
const pistachioOverrides = ref<Record<number, string>>({})

function initOverrides(): void {
  const pkg: Record<number, string> = {}
  const pst: Record<number, string> = {}
  if (props.item.packagingTable) {
    for (const [qty, val] of Object.entries(props.item.packagingTable)) {
      pkg[Number(qty)] = String(val)
    }
  }
  if (props.item.pistachioTable) {
    for (const [qty, val] of Object.entries(props.item.pistachioTable)) {
      pst[Number(qty)] = String(val)
    }
  }
  packagingOverrides.value = pkg
  pistachioOverrides.value = pst
}

watch(
  () => [props.modelValue, props.item.id] as [boolean, string],
  ([open]) => { if (open) initOverrides() },
  { immediate: true },
)

function basePackaging(qty: number): string {
  return String(props.computePackaging(qty))
}

function basePistachio(qty: number): string {
  return String(props.computePistachio(qty))
}

function displayPackaging(qty: number): string {
  return packagingOverrides.value[qty] !== undefined ? packagingOverrides.value[qty] : basePackaging(qty)
}

function displayPistachio(qty: number): string {
  return pistachioOverrides.value[qty] !== undefined ? pistachioOverrides.value[qty] : basePistachio(qty)
}

function isPackagingOverridden(qty: number): boolean {
  return packagingOverrides.value[qty] !== undefined
}

function isPistachioOverridden(qty: number): boolean {
  return pistachioOverrides.value[qty] !== undefined
}

function onPackagingInput(qty: number, value: string): void {
  if (!value.trim()) {
    const copy = { ...packagingOverrides.value }
    delete copy[qty]
    packagingOverrides.value = copy
  } else {
    packagingOverrides.value = { ...packagingOverrides.value, [qty]: value }
  }
}

function onPistachioInput(qty: number, value: string): void {
  if (!value.trim()) {
    const copy = { ...pistachioOverrides.value }
    delete copy[qty]
    pistachioOverrides.value = copy
  } else {
    pistachioOverrides.value = { ...pistachioOverrides.value, [qty]: value }
  }
}

function resetRow(qty: number): void {
  const pkg = { ...packagingOverrides.value }
  const pst = { ...pistachioOverrides.value }
  delete pkg[qty]
  delete pst[qty]
  packagingOverrides.value = pkg
  pistachioOverrides.value = pst
}

function resetAll(): void {
  packagingOverrides.value = {}
  pistachioOverrides.value = {}
}

function close(): void {
  emit('update:modelValue', false)
}

function handleSave(): void {
  const packagingTable: Record<number, number> = {}
  const pistachioTable: Record<number, number> = {}
  for (const [qty, val] of Object.entries(packagingOverrides.value)) {
    const num = Number(val)
    if (Number.isFinite(num)) packagingTable[Number(qty)] = num
  }
  for (const [qty, val] of Object.entries(pistachioOverrides.value)) {
    const num = Number(val)
    if (Number.isFinite(num)) pistachioTable[Number(qty)] = num
  }
  emit('save', packagingTable, pistachioTable)
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay te-overlay" @click.self="close">
    <div class="te-dialog">
      <div class="te-header">
        <h2 class="te-title">{{ item.flowerName }}</h2>
        <button type="button" class="te-close" @click="close">✕</button>
      </div>

      <div class="te-body">
        <div class="te-top-actions">
          <button type="button" class="te-btn-reset-all" @click="resetAll">Сбросить все</button>
          <span class="te-hint">Измените значения и нажмите «Сохранить»</span>
        </div>

        <div class="te-scroll">
          <table class="te-table">
            <thead>
              <tr>
                <th class="te-th-qty">Кол-во</th>
                <th>Упаковка ₽</th>
                <th v-if="showPistachio">Фисташка шт</th>
                <th class="te-th-reset"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="qty in qtyOptions"
                :key="qty"
                :class="{ 'te-row-overridden': isPackagingOverridden(qty) || isPistachioOverridden(qty) }"
              >
                <td class="te-td-qty">{{ qty }}</td>
                <td>
                  <input
                    class="te-input"
                    :class="{ 'te-input-override': isPackagingOverridden(qty) }"
                    type="number"
                    min="0"
                    :value="displayPackaging(qty)"
                    :placeholder="basePackaging(qty)"
                    @input="onPackagingInput(qty, ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td v-if="showPistachio">
                  <input
                    class="te-input"
                    :class="{ 'te-input-override': isPistachioOverridden(qty) }"
                    type="number"
                    min="0"
                    :value="displayPistachio(qty)"
                    :placeholder="basePistachio(qty)"
                    @input="onPistachioInput(qty, ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td class="te-td-reset">
                  <button
                    v-if="isPackagingOverridden(qty) || isPistachioOverridden(qty)"
                    type="button"
                    class="te-row-reset-btn"
                    title="Сбросить строку"
                    @click="resetRow(qty)"
                  >✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="saveError" class="te-save-error">{{ saveError }}</div>

      <div class="te-footer">
        <button type="button" class="te-btn-cancel" @click="close">Отмена</button>
        <button type="button" class="te-btn-save" :disabled="saving" @click="handleSave">
          {{ saving ? 'Сохранение...' : 'Сохранить и запушить' }}
        </button>
      </div>
    </div>
  </div>
</template>
