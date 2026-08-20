<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FlowerItem, SectionKey } from '../types'
import { DEFAULT_SIZES } from '../types'

const props = defineProps<{
  modelValue: boolean
  initial?: FlowerItem
  section: SectionKey
  categories?: { value: string; label: string }[]
  // Категория активной вкладки: новая позиция должна попадать туда, где её
  // добавляют, иначе она уходит только во «Все цветы» и выглядит потерянной.
  defaultGroup?: string
}>()

const emit = defineEmits<{ close: []; save: [FlowerItem] }>()

const FLOWER_GROUP_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Авто (по названию)' },
  { value: 'rose', label: 'Розы' },
  { value: 'chryza', label: 'Хризантема' },
  { value: 'carnation', label: 'Гвоздики' },
  { value: 'alstroemerii', label: 'Альстромерия' },
  { value: 'hydrangea', label: 'Гортензия' },
  { value: 'gypsophila', label: 'Гипсофила' },
  { value: 'tanacetum', label: 'Танацетум' },
  { value: 'peony', label: 'Пионы' },
  { value: 'tulip', label: 'Тюльпаны' },
]

const groupOptions = computed(() => [...FLOWER_GROUP_OPTIONS, ...(props.categories ?? [])])

const form = reactive<FlowerItem & { flowerGroup: string }>({
  id: '',
  section: props.section,
  flowerName: '',
  photoUrl: '',
  unitPrice: 0,
  secondaryUnitPrice: 0,
  packagingPrice: 0,
  hasPistachio: true,
  pistachioQty: 0,
  pistachioUnitPrice: 80,
  hasEucalyptus: false,
  eucalyptusUnitPrice: 0,
  discountPercent: 10,
  isPromoEnabled: false,
  popularSizes: [...DEFAULT_SIZES],
  flowerGroup: '',
  maxQty: 101,
})

watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) {
      return
    }
    Object.assign(form, {
      id: props.initial?.id || crypto.randomUUID(),
      section: props.initial?.section || props.section,
      flowerName: props.initial?.flowerName || '',
      photoUrl: '',
      unitPrice: props.initial?.unitPrice ?? 0,
      secondaryUnitPrice: props.initial?.secondaryUnitPrice ?? 0,
      packagingPrice: props.initial?.packagingPrice ?? 0,
      hasPistachio: props.initial?.hasPistachio ?? true,
      pistachioQty: props.initial?.pistachioQty ?? 0,
      pistachioUnitPrice: props.initial?.pistachioUnitPrice ?? 80,
      hasEucalyptus: props.initial?.hasEucalyptus ?? false,
      eucalyptusUnitPrice: props.initial?.eucalyptusUnitPrice ?? 0,
      discountPercent: props.initial?.discountPercent ?? 10,
      isPromoEnabled: props.initial?.isPromoEnabled ?? false,
      popularSizes: props.initial?.popularSizes?.length ? [...props.initial.popularSizes] : [...DEFAULT_SIZES],
      flowerGroup: props.initial ? (props.initial.flowerGroup || '') : (props.defaultGroup ?? ''),
      maxQty: props.initial?.maxQty ?? 101,
    })
  },
  { immediate: true },
)

const title = computed(() => (props.initial ? 'Редактирование' : 'Новый цветок'))

// Количество эвкалипта хранится строкой, пока его набирают: так можно ввести
// и «1.5», и «1,5», не теряя запятую на полпути.
const eucalyptusQtyInput = ref('')

function parseQtyInput(raw: string): number {
  const value = Number(String(raw).replace(',', '.').trim())
  return Number.isFinite(value) && value > 0 ? value : 0
}

watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) return
    const qty = props.initial?.eucalyptusQty ?? 0
    eucalyptusQtyInput.value = qty ? String(qty).replace('.', ',') : ''
  },
  { immediate: true },
)

const newSizeInput = ref('')

const canAddSize = computed(() => {
  const n = parseInt(newSizeInput.value, 10)
  return Number.isInteger(n) && n > 0 && !form.popularSizes.includes(n)
})

function addSize(): void {
  if (!canAddSize.value) return
  const n = parseInt(newSizeInput.value, 10)
  form.popularSizes = [...form.popularSizes, n].sort((a, b) => a - b)
  newSizeInput.value = ''
}

function removeSize(size: number): void {
  form.popularSizes = form.popularSizes.filter((s) => s !== size)
}

function submit(): void {
  const item: FlowerItem = {
    ...props.initial,
    ...form,
    popularSizes: [...form.popularSizes],
    flowerGroup: form.flowerGroup || undefined,
    secondaryUnitPrice: form.secondaryUnitPrice || undefined,
    hasEucalyptus: form.hasEucalyptus || undefined,
    eucalyptusQty: form.hasEucalyptus ? parseQtyInput(eucalyptusQtyInput.value) : undefined,
    eucalyptusUnitPrice: form.hasEucalyptus ? (form.eucalyptusUnitPrice || 0) : undefined,
  }
  emit('save', item)
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal">
      <h3>{{ title }}</h3>
      <div class="form-grid">
        <label>
          Вид цветка
          <input v-model="form.flowerName" />
        </label>
        <label>
          Категория (группа)
          <select v-model="form.flowerGroup">
            <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>
        <label>
          Цена цветка 1 (за 1 шт)
          <input v-model.number="form.unitPrice" type="number" min="0" />
        </label>
        <label>
          Цена цветка 2 (0 — считать по одной цене)
          <input v-model.number="form.secondaryUnitPrice" type="number" min="0" />
        </label>
        <label>
          Стоимость упаковки
          <input v-model.number="form.packagingPrice" type="number" min="0" />
        </label>
        <label>
          Цена фисташки за 1
          <input v-model.number="form.pistachioUnitPrice" type="number" min="0" />
        </label>
        <label>
          Скидка %
          <input v-model.number="form.discountPercent" type="number" min="0" max="99" />
        </label>
        <label>
          До какого количества (шт)
          <input v-model.number="form.maxQty" type="number" min="1" max="101" step="2" />
        </label>
        <label>
          Кол-во фисташки
          <input v-model.number="form.pistachioQty" type="number" min="0" />
        </label>
        <label>
          <input v-model="form.isPromoEnabled" type="checkbox" />
          Применять акцию
        </label>
        <label>
          <input v-model="form.hasPistachio" type="checkbox" />
          Использовать фисташку
        </label>
        <label>
          <input v-model="form.hasEucalyptus" type="checkbox" />
          Использовать эвкалипт
        </label>
        <label v-if="form.hasEucalyptus">
          Кол-во эвкалипта (можно 1,5)
          <input v-model="eucalyptusQtyInput" type="text" inputmode="decimal" placeholder="например 1,5" />
        </label>
        <label v-if="form.hasEucalyptus">
          Цена эвкалипта за 1
          <input v-model.number="form.eucalyptusUnitPrice" type="number" min="0" />
        </label>
      </div>
      <div class="ps-editor">
        <span class="ps-editor-label">Популярные размеры</span>
        <div class="ps-chips">
          <span v-for="size in form.popularSizes" :key="size" class="ps-chip">
            {{ size }}
            <button type="button" class="ps-chip-remove" @click="removeSize(size)">×</button>
          </span>
          <span class="ps-add">
            <input
              v-model="newSizeInput"
              class="ps-add-input"
              type="number"
              min="1"
              placeholder="Размер"
              @keydown.enter.prevent="addSize"
            />
            <button type="button" class="ps-add-btn" :disabled="!canAddSize" @click="addSize">+</button>
          </span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="primary" @click="submit">Сохранить</button>
        <button @click="emit('close')">Отмена</button>
      </div>
    </div>
  </div>
</template>
