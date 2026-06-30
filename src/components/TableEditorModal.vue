<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { FlowerItem } from '../types'

const props = defineProps<{
  modelValue: boolean
  item: FlowerItem
  siblingItems: FlowerItem[]
  qtyOptions: number[]
  computePackaging: (qty: number) => number
  computePistachio: (qty: number) => number
  computeSiblingPackaging: (item: FlowerItem, qty: number) => number
  showPistachio: boolean
  saveError: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [packagingTable: Record<number, number>, pistachioTable: Record<number, number>, flowerPrice: number, pistachioPrice: number, secondaryFlowerPrice: number | undefined]
  'switch-item': [item: FlowerItem]
}>()

const packagingOverrides = ref<Record<number, string>>({})
const pistachioQtyOverrides = ref<Record<number, string>>({})
const savedPackagingOverrides = ref<Record<number, string>>({})
const savedPistachioQtyOverrides = ref<Record<number, string>>({})
const flowerPriceInput = ref('')
const secondaryFlowerPriceInput = ref('')
const pistachioPriceInput = ref('')
const compareItemId = ref('')

const hasMixPrice = computed(() => props.item.secondaryUnitPrice !== undefined)

const siblingOptions = computed(() => props.siblingItems.filter(s => s.id !== props.item.id))

const compareItem = computed(() => siblingOptions.value.find(s => s.id === compareItemId.value) ?? null)

function getComparePackaging(sibling: FlowerItem, qty: number): number {
  return sibling.packagingTable?.[qty] ?? props.computeSiblingPackaging(sibling, qty)
}

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
  pistachioQtyOverrides.value = pst
  savedPackagingOverrides.value = { ...pkg }
  savedPistachioQtyOverrides.value = { ...pst }
  flowerPriceInput.value = String(props.item.unitPrice || 0)
  secondaryFlowerPriceInput.value = String(props.item.secondaryUnitPrice ?? '')
  pistachioPriceInput.value = String(props.item.pistachioUnitPrice || 80)
  compareItemId.value = ''
}

watch(
  () => [props.modelValue, props.item.id] as [boolean, string],
  ([open]) => { if (open) initOverrides() },
  { immediate: true },
)

function getPistachioQty(qty: number): number {
  const ov = pistachioQtyOverrides.value[qty]
  return ov !== undefined ? (Number(ov) || 0) : props.computePistachio(qty)
}

function getPackaging(qty: number): number {
  const ov = packagingOverrides.value[qty]
  return ov !== undefined ? (Number(ov) || 0) : props.computePackaging(qty)
}

function getPistachioPrice(qty: number): number {
  return getPistachioQty(qty) * (Number(pistachioPriceInput.value) || 0)
}

function calcCost(qty: number): number {
  const price1 = Number(flowerPriceInput.value) || 0
  const price2 = Number(secondaryFlowerPriceInput.value) || 0
  const flowerCost = hasMixPrice.value && price2 > 0
    ? Math.ceil(qty / 2) * price1 + Math.floor(qty / 2) * price2
    : qty * price1
  return flowerCost + getPistachioPrice(qty) + getPackaging(qty)
}

function displayPackaging(qty: number): string {
  return packagingOverrides.value[qty] !== undefined ? packagingOverrides.value[qty] : String(props.computePackaging(qty))
}

function displayPistachioQty(qty: number): string {
  return pistachioQtyOverrides.value[qty] !== undefined ? pistachioQtyOverrides.value[qty] : String(props.computePistachio(qty))
}

function isRowOverridden(qty: number): boolean {
  return packagingOverrides.value[qty] !== undefined || pistachioQtyOverrides.value[qty] !== undefined
}

function isRowDirty(qty: number): boolean {
  return packagingOverrides.value[qty] !== savedPackagingOverrides.value[qty]
    || pistachioQtyOverrides.value[qty] !== savedPistachioQtyOverrides.value[qty]
}

function onPackagingInput(qty: number, value: string): void {
  packagingOverrides.value = { ...packagingOverrides.value, [qty]: value }
}

function onPistachioQtyInput(qty: number, value: string): void {
  pistachioQtyOverrides.value = { ...pistachioQtyOverrides.value, [qty]: value }
}

const inputRefs = new Map<string, HTMLInputElement>()

function setRef(key: string, el: unknown): void {
  if (el instanceof HTMLInputElement) {
    inputRefs.set(key, el)
  } else {
    inputRefs.delete(key)
  }
}

function focusNext(qty: number, col: string): void {
  const idx = props.qtyOptions.indexOf(qty)
  const nextQty = props.qtyOptions[idx + 1]
  if (nextQty === undefined) return
  nextTick(() => {
    const el = inputRefs.get(`${col}-${nextQty}`)
    if (el) { el.focus(); el.select() }
  })
}

async function copyColumn(col: 'packaging' | 'pistachio'): Promise<void> {
  const values = props.qtyOptions.map(qty =>
    col === 'packaging' ? displayPackaging(qty) : displayPistachioQty(qty)
  )
  await navigator.clipboard.writeText(values.join('\n'))
}

function onPasteColumn(qty: number, col: string, event: ClipboardEvent): void {
  event.preventDefault()
  const text = event.clipboardData?.getData('text') ?? ''
  const values = text.split(/\r?\n/).map(v => v.trim()).filter(v => v !== '')
  const startIdx = props.qtyOptions.indexOf(qty)
  values.forEach((val, i) => {
    const targetQty = props.qtyOptions[startIdx + i]
    if (targetQty === undefined) return
    if (col === 'packaging') onPackagingInput(targetQty, val)
    else onPistachioQtyInput(targetQty, val)
  })
}

function resetRow(qty: number): void {
  const pkg = { ...packagingOverrides.value }
  const pst = { ...pistachioQtyOverrides.value }
  delete pkg[qty]
  delete pst[qty]
  packagingOverrides.value = pkg
  pistachioQtyOverrides.value = pst
}

function resetAll(): void {
  packagingOverrides.value = {}
  pistachioQtyOverrides.value = {}
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
  for (const [qty, val] of Object.entries(pistachioQtyOverrides.value)) {
    const num = Number(val)
    if (Number.isFinite(num)) pistachioTable[Number(qty)] = num
  }
  const secondaryPrice = hasMixPrice.value ? (Number(secondaryFlowerPriceInput.value) || 0) : undefined
  emit('save', packagingTable, pistachioTable, Number(flowerPriceInput.value) || 0, Number(pistachioPriceInput.value) || 0, secondaryPrice)
  savedPackagingOverrides.value = { ...packagingOverrides.value }
  savedPistachioQtyOverrides.value = { ...pistachioQtyOverrides.value }
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay te-overlay" @click.self="close">
    <div class="te-dialog">
      <div class="te-header">
        <h2 class="te-title">{{ item.flowerName }}</h2>
        <button type="button" class="te-close" @click="close">✕</button>
      </div>

      <div v-if="siblingItems.length > 1" class="te-siblings">
        <button
          v-for="sibling in siblingItems"
          :key="sibling.id"
          type="button"
          class="te-sibling-chip"
          :class="{ 'te-sibling-chip-active': sibling.id === item.id }"
          @click="sibling.id !== item.id && emit('switch-item', sibling)"
        >{{ sibling.flowerName }}</button>
      </div>

      <div class="te-body">
        <div class="te-price-fields">
          <label class="te-price-label">
            Цена цветка
            <input
              class="te-price-input"
              inputmode="numeric"
              :value="flowerPriceInput"
              @input="flowerPriceInput = ($event.target as HTMLInputElement).value"
            />
          </label>
          <label v-if="hasMixPrice" class="te-price-label">
            Цена цветка 2
            <input
              class="te-price-input"
              inputmode="numeric"
              :value="secondaryFlowerPriceInput"
              @input="secondaryFlowerPriceInput = ($event.target as HTMLInputElement).value"
            />
          </label>
          <label v-if="showPistachio" class="te-price-label">
            Цена фисташки
            <input
              class="te-price-input"
              inputmode="numeric"
              :value="pistachioPriceInput"
              @input="pistachioPriceInput = ($event.target as HTMLInputElement).value"
            />
          </label>
        </div>

        <div class="te-scroll">
          <table class="te-table">
            <thead>
              <tr>
                <th class="te-th-qty" rowspan="2">Кол-во</th>
                <th rowspan="2">Стоимость</th>
                <th v-if="showPistachio" colspan="2" class="te-th-group">Фисташка</th>
                <th rowspan="2">
                  Упаковка
                  <button type="button" class="te-copy-btn" title="Копировать столбец" @click="copyColumn('packaging')">⎘</button>
                </th>
                <th v-if="siblingItems.length > 1" class="te-th-compare" :rowspan="showPistachio ? 2 : 1">
                  <select v-model="compareItemId" class="te-compare-select">
                    <option value="">Сравнить</option>
                    <option v-for="s in siblingOptions" :key="s.id" :value="s.id">{{ s.flowerName }}</option>
                  </select>
                </th>
                <th class="te-th-reset" rowspan="2"></th>
              </tr>
              <tr v-if="showPistachio">
                <th class="te-th-sub">
                  кол-во
                  <button type="button" class="te-copy-btn" title="Копировать столбец" @click="copyColumn('pistachio')">⎘</button>
                </th>
                <th class="te-th-sub">цена</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="qty in qtyOptions"
                :key="qty"
                :class="{ 'te-row-dirty': isRowDirty(qty) }"
              >
                <td class="te-td-qty">{{ qty }}</td>
                <td class="te-td-cost">{{ calcCost(qty) }} ₽</td>
                <td v-if="showPistachio">
                  <input
                    :ref="(el) => setRef(`pistachio-${qty}`, el)"
                    class="te-input"
                    inputmode="numeric"
                    :value="displayPistachioQty(qty)"
                    @input="onPistachioQtyInput(qty, ($event.target as HTMLInputElement).value)"
                    @keydown.enter.prevent="focusNext(qty, 'pistachio')"
                    @paste="onPasteColumn(qty, 'pistachio', $event)"
                  />
                </td>
                <td v-if="showPistachio" class="te-td-cost">{{ getPistachioPrice(qty) }} ₽</td>
                <td>
                  <input
                    :ref="(el) => setRef(`packaging-${qty}`, el)"
                    class="te-input"
                    inputmode="numeric"
                    :value="displayPackaging(qty)"
                    @input="onPackagingInput(qty, ($event.target as HTMLInputElement).value)"
                    @keydown.enter.prevent="focusNext(qty, 'packaging')"
                    @paste="onPasteColumn(qty, 'packaging', $event)"
                  />
                </td>
                <td v-if="siblingItems.length > 1" class="te-compare-cell">
                  {{ compareItem ? getComparePackaging(compareItem, qty) : '' }}
                </td>
                <td class="te-td-reset">
                  <button
                    v-if="isRowOverridden(qty)"
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
        <button type="button" class="te-btn-reset-all" @click="resetAll">Сбросить все</button>
        <div class="te-footer-actions">
          <button type="button" class="te-btn-cancel" @click="close">Отмена</button>
          <button type="button" class="te-btn-save" @click="handleSave">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>
