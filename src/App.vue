<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AuthGate from './components/AuthGate.vue'
import FlowerEditorModal from './components/FlowerEditorModal.vue'
import SidebarMenu from './components/SidebarMenu.vue'
import { useFlowersStore } from './stores/flowers'
import type { FlowerItem, SectionKey } from './types'
import { SECTION_LABELS } from './types'
import { calcWithPromo, calcWithoutPromo, toOdd } from './utils/pricing'
import resetIcon from './assets/reset-icon.png'

const store = useFlowersStore()


const editorOpen = ref(false)
const editorItem = ref<FlowerItem>()
const activeRowId = ref<string>('')

const qtyMap = reactive<Record<string, number>>({})
const oddOptions = Array.from({ length: 51 }, (_, i) => i * 2 + 1)
const hydrangeaOddOptions = Array.from({ length: 18 }, (_, i) => i * 2 + 1)
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1'
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de'
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3'

const MAIN_ORDER = [
  'розы по 150',
  'розы по 250',
  'розы по 300',
  'альстромерии',
  'гвоздики - обычные',
  'гвоздики - лунные',
  'хриза - кустовая по 250',
  'хриза - кустовая по 300',
  'хриза - одноголовая',
  'гортензии',
]

const ROSE_150_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
  6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
  9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
  11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
  14,
]

const ROSE_250_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
  6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
  9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
  11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
  14,
]

const ROSE_300_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
  6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
  9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
  11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
  14,
]

const CARNATION_COMMON_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 0, 2, 2, 2, 3, 3, 3,
  3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
  6, 6, 6, 6, 7, 7, 7, 7, 8, 8,
  8, 8, 9, 9, 9, 9, 10, 10, 10, 10,
  11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
  13,
]

const CARNATION_MOON_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 0, 2, 2, 2, 3, 3, 3,
  3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
  6, 6, 6, 6, 7, 7, 7, 7, 8, 8,
  8, 8, 9, 9, 9, 9, 10, 10, 10, 10,
  11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
  13,
]

const ALSTROMERII_PISTACHIO_QTY_BY_ODD = [
  0, 1, 1, 1, 2, 2, 3, 3, 3, 4,
  4, 4, 5, 5, 5, 5, 6, 6, 6, 6,
  7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
  9, 9, 10, 10, 10, 10, 11, 11, 11, 11,
  12, 12, 12, 12, 13, 13, 13, 14, 14, 14,
  15,
]

const HYDRANGEA_PISTACHIO_QTY_BY_ODD = [
  0, 2, 3, 4, 4, 5, 5, 6, 6, 7,
  7, 8, 8, 9, 9, 10, 10, 10, 10, 10,
  11, 11, 11, 11, 11, 12, 12, 12, 12, 12,
  13, 13, 13, 13, 13, 14, 14, 14, 14, 14,
  15, 15, 15, 15, 15, 16, 16, 16, 16, 16,
  17,
]

const CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD = [
  0, 1, 2, 3, 3, 4, 4, 5, 5, 5,
  6, 6, 6, 7, 7, 7, 8, 8, 8, 8,
  8, 9, 9, 9, 9, 9, 10, 10, 10, 10,
  10, 11, 11, 11, 11, 11, 12, 12, 12, 12,
  12, 13, 13, 13, 13, 13, 14, 14, 14, 14,
  14,
]

const PEONY_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
  6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
  9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
  11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
  14,
]

const PISTACHIO_UNIT_PRICE = 40

const ROSE_150_PACKAGING_BY_ODD = [
  140, 140, 240, 260, 260, 360, 420, 520, 520, 620,
  680, 680, 680, 680, 740, 740, 740, 840, 800, 800,
  800, 800, 860, 860, 860, 860, 920, 920, 920, 920,
  980, 980, 980, 980, 1040, 1040, 1040, 1040, 1000, 1000,
  1000, 1000, 1160, 1160, 1160, 1160, 1120, 1120, 1120, 1120,
  1180,
]

const ROSE_300_PACKAGING_BY_ODD = [
  190, 190, 290, 310, 310, 410, 370, 570, 570, 670,
  630, 730, 730, 730, 790, 790, 790, 890, 850, 850,
  850, 850, 1010, 1010, 1010, 1010, 970, 970, 970, 970,
  1030, 1030, 1030, 1030, 1090, 1090, 1090, 1090, 1050, 1050,
  1050, 1050, 1110, 1110, 1110, 1110, 1070, 1070, 1070, 1070,
  1130,
]

const ALSTROMERII_PACKAGING_BY_ODD = [
  190, 150, 250, 250, 310, 310, 270, 370, 370, 430,
  430, 530, 490, 490, 490, 590, 550, 550, 650, 650,
  610, 710, 710, 710, 770, 770, 770, 870, 930, 930,
  930, 930, 990, 990, 990, 990, 1050, 1050, 1050, 1050,
  1110, 1110, 1110, 1110, 1170, 1170, 1170, 1230, 1230, 1230,
  1290,
]

const CARNATION_COMMON_PACKAGING_BY_ODD = [
  190, 190, 190, 210, 210, 210, 270, 270, 270, 270,
  370, 330, 330, 330, 330, 390, 490, 490, 490, 450,
  450, 450, 550, 610, 610, 610, 710, 570, 570, 570,
  570, 730, 730, 730, 730, 690, 690, 690, 690, 750,
  750, 750, 750, 810, 810, 810, 810, 770, 770, 770,
]

const CARNATION_MOON_PACKAGING_BY_ODD = [
  120, 160, 200, 180, 240, 280, 220, 320, 260, 300,
  340, 380, 380, 420, 360, 400, 500, 540, 580, 520,
  520, 560, 600, 640, 640, 680, 620, 660, 660, 700,
  640, 680, 680, 720, 660, 700, 800, 740, 780, 820,
  720, 760, 800, 840, 840, 880, 920, 960, 960, 900,
  940,
]

const HYDRANGEA_PACKAGING_BY_ODD = [
  200, 340, 420, 500, 620, 700, 820, 900, 1020, 1200,
  1220, 1300, 1420, 1500, 1620, 1700, 1820, 1940, 1960, 1980,
  2060, 1980, 2000, 2020, 2040, 2020, 2040, 2060, 2080, 3000,
  2080, 3000, 3020, 3040, 3060, 3040, 3060, 3080, 4000, 4020,
  4000, 4020, 4040, 4060, 4080, 4060, 4080, 5000, 5020, 5040,
  5020,
]

const PEONY_PACKAGING_BY_ODD = [
  100, 220, 240, 380, 400, 420, 500, 620, 740, 760,
  840, 960, 980, 1000, 1080, 1100, 1120, 1140, 1220, 1340,
  1360, 1380, 1460, 1480, 1500, 1520, 1500, 1520, 1540, 1560,
  1640, 1660, 1680, 1700, 1780, 1800, 1820, 1840, 1820, 1840,
  1860, 1880, 1860, 1880, 1900, 1920, 1900, 1920, 1940, 1960,
  1940,
]

const TULIP_PACKAGING_BY_ODD = [
  130, 230, 290, 250, 310, 270, 330, 390, 350, 410,
  470, 530, 590, 550, 610, 670, 730, 790, 750, 810,
  870, 830, 890, 850, 910, 970, 930, 990, 950, 1010,
  1070, 1030, 1090, 1050, 1110, 1170, 1130, 1190, 1150, 1210,
  1270, 1230, 1290, 1250, 1310, 1370, 1330, 1390, 1350, 1410,
  1470,
]

const CHRYZA_SINGLE_PACKAGING_BY_ODD = [
  100, 180, 260, 340, 360, 440, 560, 640, 660, 680,
  660, 680, 800, 880, 1000, 1020, 1000, 1020, 1040, 1060,
  1080, 1160, 1180, 1200, 1220, 1240, 1220, 1240, 1260, 1280,
  1300, 1380, 1300, 1320, 1340, 1360, 1340, 1360, 1380, 1400,
  1420, 1400, 1420, 1440, 1460, 1480, 1560, 1580, 1600, 1620,
  1640,
]

const CHRYZA_BUSH_250_PACKAGING_BY_ODD = [
  140, 240, 240, 240, 340, 340, 340, 440, 440, 440,
  540, 540, 640, 640, 740, 740, 740, 840, 840, 840,
  940, 940, 940, 1040, 1040, 1040, 1140, 1140, 1140, 1140,
  1240, 1240, 1240, 1240, 1240, 1340, 1340, 1340, 1340, 1340,
  1440, 1440, 1440, 1440, 1440, 1540, 1540, 1540, 1540, 1540,
  1640,
]
const CHRYZA_BUSH_300_PACKAGING_BY_ODD = [
  190, 190, 290, 290, 290, 390, 390, 490, 490, 590,
  590, 690, 690, 790, 790, 890, 890, 890, 990, 990,
  990, 1090, 1090, 1090, 1090, 1190, 1190, 1190, 1190, 1190,
  1290, 1290, 1290, 1290, 1290, 1390, 1390, 1390, 1390, 1390,
  1490, 1490, 1490, 1490, 1490, 1590, 1590, 1590, 1590, 1590,
  1690,
]

const visibleRows = computed(() => {
  const bySection = store.filteredBySection
  return [...bySection].sort((a, b) => {
    if (store.activeSection === 'osnovnye') {
      const ai = MAIN_ORDER.indexOf(a.flowerName.toLowerCase())
      const bi = MAIN_ORDER.indexOf(b.flowerName.toLowerCase())
      const an = ai === -1 ? Number.MAX_SAFE_INTEGER : ai
      const bn = bi === -1 ? Number.MAX_SAFE_INTEGER : bi
      return an - bn
    }
    return a.flowerName.localeCompare(b.flowerName, 'ru')
  })
})

function getFlowerGroup(item: FlowerItem): string {
  if (isRose150(item) || isRose250(item) || isRose300(item)) return 'rose'
  if (isAlstroemerii(item)) return 'alstroemerii'
  if (isCarnationCommon(item) || isCarnationMoon(item)) return 'carnation'
  if (isChryzaSingle(item) || isChryzaBush250(item) || isChryzaBush300(item)) return 'chryza'
  if (isHydrangea(item)) return 'hydrangea'
  if (isPeonies(item)) return 'peony'
  if (isTulips(item)) return 'tulip'
  return item.flowerName.trim().toLowerCase()
}

function isGroupStart(item: FlowerItem, index: number): boolean {
  if (index === 0) {
    return false
  }
  const previous = visibleRows.value[index - 1]
  if (!previous) {
    return false
  }
  return getFlowerGroup(previous) !== getFlowerGroup(item)
}

function getMaxQty(item: FlowerItem): number {

  return 101
}

function normalizeQty(item: FlowerItem, value: number): number {
  const odd = toOdd(value)
  const max = getMaxQty(item)
  if (odd < 1) return 1
  if (odd > max) return max
  return odd
}

function getQtyOptions(item: FlowerItem): number[] {
  return isHydrangea(item) || isChryzaSingle(item) ? hydrangeaOddOptions : oddOptions
}

function getQty(item: FlowerItem): number {
  if (!qtyMap[item.id]) {
    qtyMap[item.id] = 1
  }
  qtyMap[item.id] = normalizeQty(item, qtyMap[item.id])
  return qtyMap[item.id]
}


function isRose150(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('150')
}

function isRose250(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('250')
}

function isRose300(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('300')
}

function isAlstroemerii(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('альстромер')
}

function isCarnationCommon(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('гвоздики - обычные')
}

function isCarnationMoon(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('гвоздики - лунные')
}

function isPeonies(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('пион') || name.includes('рџрёрѕрн')
}

function isTulips(item: FlowerItem): boolean {
  return item.id === '327eb882-6a93-45c5-bb20-8a53b19bc27e'
}

function isHydrangea(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('гортенз')
}

function isChryzaSingle(item: FlowerItem): boolean {
  return item.id === CHRYZA_SINGLE_ID
}

function isChryzaBush250(item: FlowerItem): boolean {
  return item.id === CHRYZA_BUSH_250_ID
}

function isChryzaBush300(item: FlowerItem): boolean {
  return item.id === CHRYZA_BUSH_300_ID
}


function hasAutoPackagingByQty(item: FlowerItem): boolean {
  return isRose150(item) || isRose250(item) || isRose300(item) || isAlstroemerii(item) || isCarnationCommon(item) || isCarnationMoon(item) || isHydrangea(item) || isPeonies(item) || isTulips(item) || isChryzaSingle(item) || isChryzaBush250(item) || isChryzaBush300(item)
}
function getPackagingPrice(item: FlowerItem, qty: number): number {
  if (!hasAutoPackagingByQty(item)) {
    return item.packagingPrice
  }
  const idx = (toOdd(qty) - 1) / 2
  if (isTulips(item)) {
    return TULIP_PACKAGING_BY_ODD[idx] ?? TULIP_PACKAGING_BY_ODD[TULIP_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isChryzaBush250(item)) {
    return CHRYZA_BUSH_250_PACKAGING_BY_ODD[idx] ?? CHRYZA_BUSH_250_PACKAGING_BY_ODD[CHRYZA_BUSH_250_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isChryzaBush300(item)) {
    return CHRYZA_BUSH_300_PACKAGING_BY_ODD[idx] ?? CHRYZA_BUSH_300_PACKAGING_BY_ODD[CHRYZA_BUSH_300_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isRose300(item)) {
    return ROSE_300_PACKAGING_BY_ODD[idx] ?? item.packagingPrice
  }
  if (isAlstroemerii(item)) {
    return ALSTROMERII_PACKAGING_BY_ODD[idx] ?? item.packagingPrice
  }
  if (isCarnationCommon(item)) {
    return CARNATION_COMMON_PACKAGING_BY_ODD[idx] ?? CARNATION_COMMON_PACKAGING_BY_ODD[CARNATION_COMMON_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isCarnationMoon(item)) {
    return CARNATION_MOON_PACKAGING_BY_ODD[idx] ?? CARNATION_MOON_PACKAGING_BY_ODD[CARNATION_MOON_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isPeonies(item)) {
    return PEONY_PACKAGING_BY_ODD[idx] ?? PEONY_PACKAGING_BY_ODD[PEONY_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isHydrangea(item)) {
    return HYDRANGEA_PACKAGING_BY_ODD[idx] ?? HYDRANGEA_PACKAGING_BY_ODD[HYDRANGEA_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isChryzaSingle(item)) {
    return CHRYZA_SINGLE_PACKAGING_BY_ODD[idx] ?? CHRYZA_SINGLE_PACKAGING_BY_ODD[CHRYZA_SINGLE_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  return ROSE_150_PACKAGING_BY_ODD[idx] ?? item.packagingPrice
}

function getPistachioQty(item: FlowerItem, qty: number): number {
  if (isPistachioLocked(item)) {
    return 0
  }
  const idx = (toOdd(qty) - 1) / 2
  if (isRose150(item)) {
    return ROSE_150_PISTACHIO_QTY_BY_ODD[idx] ?? 0
  }
  if (isRose250(item)) {
    return ROSE_250_PISTACHIO_QTY_BY_ODD[idx] ?? 0
  }
  if (isRose300(item)) {
    return ROSE_300_PISTACHIO_QTY_BY_ODD[idx] ?? 0
  }
  if (isCarnationCommon(item)) {
    return CARNATION_COMMON_PISTACHIO_QTY_BY_ODD[idx] ?? CARNATION_COMMON_PISTACHIO_QTY_BY_ODD[CARNATION_COMMON_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0
  }
  if (isCarnationMoon(item)) {
    return CARNATION_MOON_PISTACHIO_QTY_BY_ODD[idx] ?? CARNATION_MOON_PISTACHIO_QTY_BY_ODD[CARNATION_MOON_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0
  }
  if (isAlstroemerii(item)) {
    return ALSTROMERII_PISTACHIO_QTY_BY_ODD[idx] ?? 0
  }
  if (isPeonies(item)) {
    return PEONY_PISTACHIO_QTY_BY_ODD[idx] ?? PEONY_PISTACHIO_QTY_BY_ODD[PEONY_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0
  }
  if (isHydrangea(item)) {
    return HYDRANGEA_PISTACHIO_QTY_BY_ODD[idx] ?? HYDRANGEA_PISTACHIO_QTY_BY_ODD[HYDRANGEA_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0
  }
  if (isChryzaSingle(item)) {
    return CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD[idx] ?? CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD[CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0
  }
  return item.pistachioQty
}

function calcWithoutPromoForRow(item: FlowerItem, qty: number): number {
  const pistachioLocked = isPistachioLocked(item)
  return calcWithoutPromo(
    {
      ...item,
      packagingPrice: getPackagingPrice(item, qty),
      hasPistachio: pistachioLocked ? false : item.hasPistachio,
      pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
      pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    },
    qty,
  )
}

function calcWithPromoForRow(item: FlowerItem, qty: number): number {
  const pistachioLocked = isPistachioLocked(item)
  return calcWithPromo(
    {
      ...item,
      packagingPrice: getPackagingPrice(item, qty),
      hasPistachio: pistachioLocked ? false : item.hasPistachio,
      pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
      pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    },
    qty,
  )
}

function chooseQty(item: FlowerItem, value: number): void {

  qtyMap[item.id] = normalizeQty(item, value)
  activeRowId.value = item.id
}

function resetQty(item: FlowerItem): void {
  qtyMap[item.id] = 1
  activeRowId.value = item.id
}

function chooseSize(item: FlowerItem, size: number): void {
  qtyMap[item.id] = normalizeQty(item, size)
  activeRowId.value = item.id
}

function formatPrice(value: number): string {
  return String(Math.round(value))
}

function isPistachioLocked(item: FlowerItem): boolean {
  return isTulips(item) || isChryzaBush250(item) || isChryzaBush300(item)
}
function clearActiveRow(): void {
  activeRowId.value = ''
}

function handlePageClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest('button, input, select, label, .price-table, .modal, .menu-btn')) return
  clearActiveRow()
}

function onSectionChange(section: SectionKey): void {
  store.activeSection = section
}

function openCreate(): void {
  editorItem.value = undefined
  editorOpen.value = true
}

function openEdit(item: FlowerItem): void {
  editorItem.value = item
  editorOpen.value = true
}

async function saveEditor(item: FlowerItem): Promise<void> {
  await store.upsertFlower(item)
  editorOpen.value = false
}

async function onChooseFile(): Promise<void> {
  await store.chooseFile()
}

onMounted(async () => {
  await store.bootstrap()
})
</script>

<template>
  <div class="layout" @click="handlePageClick">
    <SidebarMenu :active="store.activeSection" @change="onSectionChange" />

    <main class="content">
      <header class="toolbar">
        <h1>Прайс букетов: {{ SECTION_LABELS[store.activeSection] }}</h1>
        <div class="toolbar-actions">
          <button @click="onChooseFile">Выбрать JSON</button>
          <button :disabled="!store.unlocked" @click="openCreate">Добавить цветок</button>
        </div>
      </header>

      <AuthGate v-if="!store.unlocked" @unlocked="store.setUnlocked" />

      <div v-if="store.unlocked" class="status-row">
        <span v-if="store.fileName">Файл: {{ store.fileName }}</span>
        <span v-else>Файл не выбран</span>
        <span v-if="store.usingFallbackStorage" class="warn">File API недоступен, используем localStorage</span>
        <span v-if="store.saveError" class="error">{{ store.saveError }}</span>
      </div>

      <div class="table-wrap">
        <table class="price-table">
          <colgroup>
            <col style="width: 21%" />
            <col style="width: 9%" />
            <col style="width: 14%" />
            <col style="width: 9%" />
            <col style="width: 9%" />
            <col style="width: 9%" />
            <col style="width: 9%" />
            <col style="width: 11%" />
            <col style="width: 14%" />
          </colgroup>
          <thead>
            <tr>
              <th>Вид цветка</th>
              <th>Количество</th>
              <th>Популярные размеры</th>
              <th>Цена цветка</th>
              <th>Упаковка</th>
              <th>Фисташка</th>
              <th>Без акции</th>
              <th>Акция</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in visibleRows" :key="item.id" :class="{ 'is-active': activeRowId === item.id, 'group-start': isGroupStart(item, index) }">
              <td class="flower-name-cell" @click="activeRowId = item.id">{{ item.flowerName }}</td>
              <td>
                <div class="qty-cell">
                  <input
                    class="center-input qty-select"
                    type="number"
                    min="1"
                    max="101"
                    step="2"
                    :value="getQty(item)"
                    @change="chooseQty(item, Number(($event.target as HTMLInputElement).value))"
                  />
                  <button class="qty-reset" type="button" aria-label="����� �� 1" @click="resetQty(item)">
                    <img class="qty-reset-icon" :src="resetIcon" alt="" />
                  </button>
                </div>
              </td>
              <td>
                <div class="sizes">
                  <button
                    v-for="size in item.popularSizes"
                    :key="size"
                    :class="{ active: getQty(item) === size }"
                    @click="chooseSize(item, size)"
                  >
                    {{ size }}
                  </button>
                </div>
              </td>
              <td>
                <input
                  class="short-input center-input"
                  :disabled="!store.unlocked"
                  type="number"
                  min="0"
                  :value="item.unitPrice"
                  @input="store.patchFlower(item.id, { unitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                />
              </td>
              <td>
                <input
                  class="short-input center-input"
                  :disabled="hasAutoPackagingByQty(item) || !store.unlocked"
                  type="number"
                  min="0"
                  :value="getPackagingPrice(item, getQty(item))"
                  @input="store.patchFlower(item.id, { packagingPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                />
              </td>
              <td>
                <div class="pistachio-cell">
                  <input
                    type="checkbox"
                    :checked="isPistachioLocked(item) ? false : item.hasPistachio"
                    :disabled="isPistachioLocked(item)"
                    @change="store.patchFlower(item.id, { hasPistachio: ($event.target as HTMLInputElement).checked })"
                  />
                  <input
                    class="short-input center-input"
                    :disabled="!store.unlocked || isPistachioLocked(item) || isRose150(item) || isRose250(item) || isRose300(item) || isCarnationCommon(item) || isCarnationMoon(item) || isAlstroemerii(item) || isHydrangea(item) || isPeonies(item) || isChryzaSingle(item)"
                    type="number"
                    min="0"
                    :value="isPistachioLocked(item) ? '' : getPistachioQty(item, getQty(item))"
                    @input="store.patchFlower(item.id, { pistachioQty: Number(($event.target as HTMLInputElement).value) || 0 })"
                  />
                </div>
              </td>

              <td :class="{ 'price-strong': activeRowId === item.id }">{{ formatPrice(calcWithoutPromoForRow(item, getQty(item))) }}</td>
              <td>
                <div class="promo-col">
                  <select
                    class="center-input"
                    :value="item.discountPercent"
                    @change="store.patchFlower(item.id, { discountPercent: Number(($event.target as HTMLSelectElement).value), isPromoEnabled: true })"
                  >
                    <option :value="10">10</option>
                    <option :value="15">15</option>
                  </select>
                  <span class="center-cell" :class="{ 'price-strong': activeRowId === item.id }">{{ formatPrice(calcWithPromoForRow({ ...item, isPromoEnabled: true }, getQty(item))) }}</span>
                </div>
              </td>
              <td>
                <div class="row-actions">
                  <button :disabled="!store.unlocked" @click="openEdit(item)">Ред.</button>
                  <button :disabled="!store.unlocked" class="danger" @click="store.deleteFlower(item.id)">Удалить</button>
                </div>
              </td>
            </tr>
            <tr v-if="!visibleRows.length">
              <td colspan="9" class="empty">Записей нет в этой категории</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <FlowerEditorModal
      :model-value="editorOpen"
      :initial="editorItem"
      :section="store.activeSection"
      @close="editorOpen = false"
      @save="saveEditor"
    />
  </div>
</template>

