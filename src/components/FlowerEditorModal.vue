<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { FlowerItem, SectionKey } from '../types'
import { DEFAULT_SIZES } from '../types'

const props = defineProps<{
  modelValue: boolean
  initial?: FlowerItem
  section: SectionKey
}>()

const emit = defineEmits<{ close: []; save: [FlowerItem] }>()

const form = reactive<FlowerItem>({
  id: '',
  section: props.section,
  flowerName: '',
  photoUrl: '',
  unitPrice: 0,
  secondaryUnitPrice: 0,
  packagingPrice: 0,
  hasPistachio: true,
  pistachioQty: 0,
  pistachioUnitPrice: 40,
  discountPercent: 10,
  isPromoEnabled: false,
  popularSizes: [...DEFAULT_SIZES],
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
      pistachioUnitPrice: props.initial?.pistachioUnitPrice ?? 40,
      discountPercent: props.initial?.discountPercent ?? 10,
      isPromoEnabled: props.initial?.isPromoEnabled ?? false,
      popularSizes: props.initial?.popularSizes?.length ? [...props.initial.popularSizes] : [...DEFAULT_SIZES],
    })
  },
  { immediate: true },
)

const title = computed(() => (props.initial ? 'Редактирование' : 'Новый цветок'))

function submit(): void {
  emit('save', { ...form, popularSizes: [...form.popularSizes] })
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
          Стоимость цветка (за 1 шт)
          <input v-model.number="form.unitPrice" type="number" min="0" />
        </label>
        <label v-if="form.flowerName === 'ГВОЗДИКИ - микс'">
          Цена второго вида (за 1 шт)
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
      </div>
      <div class="modal-actions">
        <button class="primary" @click="submit">Сохранить</button>
        <button @click="emit('close')">Отмена</button>
      </div>
    </div>
  </div>
</template>

