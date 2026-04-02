<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
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
const qtyInputMap = reactive<Record<string, string>>({})
const targetPriceMap = reactive<Record<string, string>>({})
const suggestedSelectionMap = reactive<Record<string, 'lower' | 'higher' | ''>>({})
const sizeButtonSelectionMap = reactive<Record<string, boolean>>({})
const oddOptions = Array.from({ length: 51 }, (_, i) => i * 2 + 1)
const hydrangeaOddOptions = Array.from({ length: 18 }, (_, i) => i * 2 + 1)
const POPULAR_SIZES_NOTE = '*в столбце "Популярные размеры" указан диаметр коробок'
const mobileOpenCategory = ref<string | null>(null)
const CHRYZA_BUSH_220_ID = 'b3d0d1d2-4fd5-4a12-9ea8-220220220220'
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1'
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de'
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3'
const GYPSOPHILA_ID = '5d8d5e68-cbd2-4e9a-a2ea-9fd6b7f9c201'
const GYPSOPHILA_COMPOSITION_ID = '0f3b0a0d-6b0c-4cf0-8d32-7e5f49d0b902'
const CARNATION_MIX_ID = '9f340ce7-5f4a-4f3d-8e8f-1e165566aa01'
const MOBILE_PRIMARY_CATEGORY_ORDER = ['rose', 'alstroemerii', 'carnation', 'chryza', 'hydrangea', 'gypsophila'] as const
const MOBILE_SEASONAL_CATEGORY_ORDER = ['peony', 'tulip'] as const
type FlowerFilterKey = 'all' | 'rose' | 'alstroemerii' | 'carnation' | 'chryza' | 'hydrangea' | 'gypsophila' | 'peony' | 'tulip'
const PRIMARY_FLOWER_FILTER_ORDER: FlowerFilterKey[] = ['all', 'rose', 'alstroemerii', 'carnation', 'chryza', 'hydrangea', 'gypsophila']
const SEASONAL_FLOWER_FILTER_ORDER: FlowerFilterKey[] = ['all', 'peony', 'tulip']
const FLOWER_FILTER_STORAGE_KEY = 'flowers-baza-active-flower-filters'
const uiLabels = {
  title: '\u041f\u0440\u0430\u0439\u0441 \u0431\u0443\u043a\u0435\u0442\u043e\u0432',
  chooseJson: '\u0412\u044b\u0431\u0440\u0430\u0442\u044c JSON',
  addFlower: '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0446\u0432\u0435\u0442\u043e\u043a',
  file: '\u0424\u0430\u0439\u043b',
  fileNotChosen: '\u0424\u0430\u0439\u043b \u043d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d',
  fallbackStorage: 'File API \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d, \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c localStorage',
  flowerKind: '\u0412\u0438\u0434 \u0446\u0432\u0435\u0442\u043a\u0430',
  qty: '\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e',
  qtyPlaceholder: '\u043a\u043e\u043b-\u0432\u043e',
  popularSizes: '\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u044b',
  targetPrice: '\u0446\u0435\u043d\u0430',
  withoutPromo: '\u0411\u0435\u0437 \u0430\u043a\u0446\u0438\u0438',
  promo: '\u0410\u043a\u0446\u0438\u044f',
  flowerPrice: '\u0426\u0435\u043d\u0430 \u0446\u0432\u0435\u0442\u043a\u0430',
  packaging: '\u0423\u043f\u0430\u043a\u043e\u0432\u043a\u0430',
  pistachio: '\u0424\u0438\u0441\u0442\u0430\u0448\u043a\u0430',
  actions: '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f',
  qtyResetOne: '\u0441\u0431\u0440\u043e\u0441 \u043d\u0430 1',
  pieces: '\u0448\u0442.',
  edit: '\u0420\u0435\u0434.',
  delete: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
  enable: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c',
  empty: '\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u043d\u0435\u0442 \u0432 \u044d\u0442\u043e\u0439 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438',
  peonies: '\u041f\u0438\u043e\u043d\u044b',
  tulips: '\u0422\u044e\u043b\u044c\u043f\u0430\u043d\u044b',
  mobileQtyReset: '\u0441\u0431\u0440\u043e\u0441 \u043d\u0430 \u043c\u0438\u043d\u0438\u043c\u0443\u043c',
  priceReset: '\u0441\u0431\u0440\u043e\u0441 \u0446\u0435\u043d\u044b',
  allSections: '\u0412\u0441\u0435 \u0440\u0430\u0437\u0434\u0435\u043b\u044b',
  composition: '\u0421\u043e\u0441\u0442\u0430\u0432',
  flowerCost: '\u0421\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0446\u0432\u0435\u0442\u043e\u0432',
  promo10: '\u0410\u043a\u0446\u0438\u044f 10%',
  promo15: '\u0410\u043a\u0446\u0438\u044f 15%',
  currentPromo: '\u0422\u0435\u043a\u0443\u0449\u0430\u044f \u0430\u043a\u0446\u0438\u044f',
  priceTablesHint: '\u041f\u043e\u043b\u043d\u0430\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u043f\u043e \u0432\u0441\u0435\u043c \u0446\u0432\u0435\u0442\u0430\u043c, \u0441\u043e\u0441\u0442\u0430\u0432\u0430\u043c \u0438 \u0446\u0435\u043d\u0430\u043c',
} as const
const MOBILE_PRIMARY_CATEGORY_LABELS: Record<(typeof MOBILE_PRIMARY_CATEGORY_ORDER)[number], string> = {
  rose: '\u0420\u043e\u0437\u044b',
  alstroemerii: '\u0410\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438',
  carnation: '\u0413\u0432\u043e\u0437\u0434\u0438\u043a\u0438',
  chryza: '\u0425\u0440\u0438\u0437\u0430\u043d\u0442\u0435\u043c\u044b',
  hydrangea: '\u0413\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438',
  gypsophila: '\u0413\u0438\u043f\u0441\u043e\u0444\u0438\u043b\u0430',
}
const FLOWER_FILTER_LABELS: Record<FlowerFilterKey, string> = {
  all: '\u0412\u0441\u0435 \u0446\u0432\u0435\u0442\u044b',
  rose: '\u0420\u043e\u0437\u044b',
  alstroemerii: '\u0410\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438',
  carnation: '\u0413\u0432\u043e\u0437\u0434\u0438\u043a\u0438',
  chryza: '\u0425\u0440\u0438\u0437\u0430\u043d\u0442\u0435\u043c\u044b',
  hydrangea: '\u0413\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438',
  gypsophila: '\u0413\u0438\u043f\u0441\u043e\u0444\u0438\u043b\u0430',
  peony: '\u041f\u0438\u043e\u043d\u044b',
  tulip: '\u0422\u044e\u043b\u044c\u043f\u0430\u043d\u044b',
}
function getAllowedFlowerFilters(section: SectionKey): FlowerFilterKey[] {
  return section === 'sezonnye' ? SEASONAL_FLOWER_FILTER_ORDER : PRIMARY_FLOWER_FILTER_ORDER
}

function loadStoredFlowerFilters(): Partial<Record<SectionKey, FlowerFilterKey>> {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(FLOWER_FILTER_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<Record<SectionKey, FlowerFilterKey>>
  } catch {
    return {}
  }
}

function getInitialFlowerFilter(section: SectionKey): FlowerFilterKey {
  const stored = loadStoredFlowerFilters()[section]
  return stored && getAllowedFlowerFilters(section).includes(stored) ? stored : 'all'
}

const activeFlowerFilter = ref<FlowerFilterKey>(getInitialFlowerFilter(store.activeSection))
const MAIN_ORDER = [
  '\u0420\u041e\u0417\u042b \u043f\u043e 150',
  '\u0420\u041e\u0417\u042b \u043f\u043e 250',
  '\u0420\u041e\u0417\u042b \u043f\u043e 300',
  '\u0410\u041b\u042c\u0421\u0422\u0420\u041e\u041c\u0415\u0420\u0418\u0418',
  '\u0413\u0412\u041e\u0417\u0414\u0418\u041a\u0418 - \u043e\u0431\u044b\u0447\u043d\u044b\u0435',
  '\u0413\u0412\u041e\u0417\u0414\u0418\u041a\u0418 - \u043b\u0443\u043d\u043d\u044b\u0435',
  '\u0413\u0412\u041e\u0417\u0414\u0418\u041a\u0418 - \u043c\u0438\u043a\u0441',
  '\u0425\u0420\u0418\u0417\u0410 - \u043a\u0443\u0441\u0442\u043e\u0432\u0430\u044f \u043f\u043e 220',
  '\u0425\u0420\u0418\u0417\u0410 - \u043a\u0443\u0441\u0442\u043e\u0432\u0430\u044f \u043f\u043e 250',
  '\u0425\u0420\u0418\u0417\u0410 - \u043a\u0443\u0441\u0442\u043e\u0432\u0430\u044f \u043f\u043e 300',
  '\u0425\u0420\u0418\u0417\u0410 - \u043e\u0434\u043d\u043e\u0433\u043e\u043b\u043e\u0432\u0430\u044f',
  '\u0413\u041e\u0420\u0422\u0415\u041d\u0417\u0418\u0418',
  '\u0413\u0418\u041f\u0421\u041e\u0424\u0418\u041b\u0410 - \u0431\u0443\u043a\u0435\u0442\u044b',
  '\u0413\u0418\u041f\u0421\u041e\u0424\u0418\u041b\u0410 - \u043a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u0438',
]

const MAIN_ORDER_INDEX = new Map(MAIN_ORDER.map((name, index) => [name, index]))

function getMainOrderIndex(item: FlowerItem): number {
  if (isCarnationMix(item)) return 5.5
  return MAIN_ORDER_INDEX.get(item.flowerName.trim()) ?? Number.MAX_SAFE_INTEGER
}

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

const CARNATION_MIX_PISTACHIO_QTY_BY_ODD = [
  0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
  3, 4, 4, 4, 4, 5, 5, 5, 5, 6,
  6, 6, 6, 7, 7, 7, 7, 8, 8, 8,
  8, 9, 9, 9, 9, 10, 10, 10, 10, 11,
  11, 11, 11, 12, 12, 12, 12, 13, 13, 13,
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
  90, 190, 190, 190, 210, 210, 210, 270, 270, 270,
  270, 370, 330, 330, 330, 330, 390, 490, 490, 490,
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

const CARNATION_MIX_PACKAGING_BY_ODD = [
  160, 130, 200, 190, 260, 230, 360, 230, 300, 370,
  340, 370, 340, 410, 380, 410, 480, 450, 420, 450,
  520, 590, 560, 690, 660, 630, 700, 630, 700, 670,
  640, 670, 640, 710, 680, 810, 780, 750, 820, 750,
  820, 790, 760, 890, 860, 930, 900, 930, 900, 970,
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
const CHRYZA_BUSH_220_PACKAGING_BY_ODD = [
  130, 130, 190, 250, 210, 270, 330, 390, 350, 410,
  470, 530, 590, 550, 610, 670, 630, 690, 650, 710,
  670, 730, 790, 850, 910, 870, 930, 990, 950, 1010,
  980, 1030, 1090, 1050, 1110, 1070, 1130, 1190, 1150, 1210,
  1170, 1230, 1290, 1250, 1310, 1270, 1330, 1390, 1350, 1410,
  1370,
]
const GYPSOPHILA_COMPOSITION_PACKAGING_BY_QTY: Record<number, number> = {
  1: 800,
  3: 1090,
  5: 990,
  7: 1090,
  25: 1690,
}
const GYPSOPHILA_COMPOSITION_LABELS: Record<number, string> = {
  1: 'стак.',
  3: '10',
  5: '13',
  7: '15',
  25: '20',
}
const GYPSOPHILA_PACKAGING_BY_ODD = [
  90, 190, 190, 190, 290, 390, 390, 390, 490, 490,
  590, 590, 690, 690, 790, 790, 890, 890, 890, 890,
  890, 890, 890, 990, 990, 990, 990, 1090, 1090, 1090,
  1090, 1190, 1190, 1190, 1190, 1190, 1290, 1290, 1290, 1290,
  1290, 1390, 1390, 1390, 1390, 1390, 1490, 1490, 1490, 1490,
  1590,
]
const CHRYZA_BUSH_300_PACKAGING_BY_ODD = [
  190, 190, 290, 290, 290, 390, 390, 490, 490, 590,
  590, 690, 690, 790, 790, 890, 890, 890, 990, 990,
  990, 1090, 1090, 1090, 1090, 1190, 1190, 1190, 1190, 1190,
  1290, 1290, 1290, 1290, 1290, 1390, 1390, 1390, 1390, 1390,
  1490, 1490, 1490, 1490, 1490, 1590, 1590, 1590, 1590, 1590,
  1690,
]

const SECTION_ORDER = ['osnovnye', 'sezonnye'] as const

type BaseSectionKey = (typeof SECTION_ORDER)[number]

type PriceTableRow = {
  qty: number
  withoutPromo: string
  pistachio: string
  packaging: string
  promo10: string
  promo15: string
}

type PriceTableGroup = {
  item: FlowerItem
  rows: PriceTableRow[]
}

function compareFlowers(a: FlowerItem, b: FlowerItem): number {
  if (a.section !== b.section) {
    return SECTION_ORDER.indexOf(a.section as BaseSectionKey) - SECTION_ORDER.indexOf(b.section as BaseSectionKey)
  }

  if (a.section === 'osnovnye' && b.section === 'osnovnye') {
    const ai = getMainOrderIndex(a)
    const bi = getMainOrderIndex(b)
    if (ai !== bi) return ai - bi
  }

  return a.flowerName.localeCompare(b.flowerName, 'ru')
}

function matchesFlowerFilter(item: FlowerItem, filter: FlowerFilterKey): boolean {
  return filter === 'all' || getFlowerGroup(item) === filter
}

const visibleRows = computed(() => [...store.filteredBySection]
  .filter((item) => matchesFlowerFilter(item, activeFlowerFilter.value))
  .sort(compareFlowers))

const flowerFilterTabs = computed(() => {
  const order = getAllowedFlowerFilters(store.activeSection)
  return order.map((key) => ({
    key,
    label: FLOWER_FILTER_LABELS[key],
  }))
})

const selectedPriceTableId = ref<string>('')

const priceTableGroups = computed<PriceTableGroup[]>(() => [...store.flowers]
  .sort(compareFlowers)
  .map((item) => ({
    item,
    rows: getPriceTableRows(item),
  })))

const activePriceTableGroup = computed<PriceTableGroup | null>(() => {
  const groups = priceTableGroups.value
  if (!groups.length) {
    return null
  }
  return groups.find((group) => group.item.id === selectedPriceTableId.value) ?? groups[0]
})

const mobileSectionDefinitions = computed(() => {
  if (store.activeSection === 'osnovnye') {
    return MOBILE_PRIMARY_CATEGORY_ORDER.map((key) => ({
      key,
      label: MOBILE_PRIMARY_CATEGORY_LABELS[key],
      matcher: (item: FlowerItem) => getFlowerGroup(item) === key,
    }))
  }

  return MOBILE_SEASONAL_CATEGORY_ORDER.map((key) => ({
    key,
    label: key === 'peony' ? uiLabels.peonies : uiLabels.tulips,
    matcher: (item: FlowerItem) => getFlowerGroup(item) === key,
  }))
})

const mobileCardSections = computed(() => mobileSectionDefinitions.value
  .map((section) => ({
    key: section.key,
    label: section.label,
    items: visibleRows.value.filter(section.matcher),
    collapsible: true,
  }))
  .filter((section) => section.items.length > 0))

function getMobileOpenCategoryKey(): string | null {
  const firstSection = mobileCardSections.value[0]
  if (!firstSection) {
    return null
  }
  if (mobileOpenCategory.value === null) {
    return null
  }
  return mobileCardSections.value.some((section) => section.key === mobileOpenCategory.value)
    ? mobileOpenCategory.value
    : firstSection.key
}

function isMobileCategoryOpen(key: string): boolean {
  return getMobileOpenCategoryKey() === key
}

function selectMobileCategory(key: string): void {
  const shouldOpen = !isMobileCategoryOpen(key)
  mobileOpenCategory.value = shouldOpen ? key : null
  if (!shouldOpen || typeof window === 'undefined' || window.innerWidth > 760) {
    return
  }
  void nextTick(() => {
    const section = document.querySelector<HTMLElement>('[data-mobile-section="' + key + '"]')
    if (!section) {
      return
    }
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function getFlowerGroup(item: FlowerItem): string {
  if (isChryzaSingle(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item)) return 'chryza'
  if (isRose150(item) || isRose250(item) || isRose300(item)) return 'rose'
  if (isAlstroemerii(item)) return 'alstroemerii'
  if (isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item)) return 'carnation'
  if (isHydrangea(item)) return 'hydrangea'
  if (isGypsophila(item) || isGypsophilaComposition(item)) return 'gypsophila'
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
  if (isChryzaBush300(previous) && isChryzaSingle(item)) {
    return false
  }
  return getFlowerGroup(previous) !== getFlowerGroup(item)
}

function getMinQty(item: FlowerItem): number {
  return isCarnationMix(item) ? 3 : 1
}

function getMaxQty(item: FlowerItem): number {
  return 101
}

function normalizeQty(item: FlowerItem, value: number): number {
  if (isGypsophilaComposition(item)) {
    const options = item.popularSizes
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) {
      return options[0] ?? 1
    }
    let nearest = options[0] ?? 1
    let nearestDistance = Math.abs(nearest - numeric)
    for (const option of options) {
      const distance = Math.abs(option - numeric)
      if (distance < nearestDistance) {
        nearest = option
        nearestDistance = distance
      }
    }
    return nearest
  }
  const odd = toOdd(value)
  const min = getMinQty(item)
  const max = getMaxQty(item)
  if (odd < min) return min
  if (odd > max) return max
  return odd
}

function getQtyOptions(item: FlowerItem): number[] {
  if (isGypsophilaComposition(item)) return item.popularSizes
  if (isCarnationMix(item)) return oddOptions.slice(1)
  return isHydrangea(item) || isChryzaSingle(item) ? hydrangeaOddOptions : oddOptions
}

function getQty(item: FlowerItem): number {
  if (!qtyMap[item.id]) {
    qtyMap[item.id] = getMinQty(item)
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
  return name.includes('\u0430\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438')
}

function isCarnationCommon(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('\u0433\u0432\u043e\u0437\u0434\u0438\u043a\u0438 - \u043e\u0431\u044b\u0447\u043d\u044b\u0435')
}

function isCarnationMoon(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('\u0433\u0432\u043e\u0437\u0434\u0438\u043a\u0438 - \u043b\u0443\u043d\u043d\u044b\u0435')
}

function isCarnationMix(item: FlowerItem): boolean {
  return item.id === CARNATION_MIX_ID
}

function isPeonies(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('\u043f\u0438\u043e\u043d\u044b')
}

function isTulips(item: FlowerItem): boolean {
  return item.id === '327eb882-6a93-45c5-bb20-8a53b19bc27e'
}

function isHydrangea(item: FlowerItem): boolean {
  const name = item.flowerName.trim().toLowerCase()
  return name.includes('\u0433\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438')
}

function isGypsophila(item: FlowerItem): boolean {
  return item.id === GYPSOPHILA_ID
}

function isGypsophilaComposition(item: FlowerItem): boolean {
  return item.id === GYPSOPHILA_COMPOSITION_ID
}
function isPromoDisabledForQty(item: FlowerItem, qty: number): boolean {
  return isGypsophilaComposition(item) && [1, 3, 5].includes(qty)
}
function isPackagingHidden(item: FlowerItem): boolean {
  return isGypsophilaComposition(item)
}

function isChryzaSingle(item: FlowerItem): boolean {
  return item.id === CHRYZA_SINGLE_ID
}

function isChryzaBush220(item: FlowerItem): boolean {
  return item.id === CHRYZA_BUSH_220_ID
}

function isChryzaBush250(item: FlowerItem): boolean {
  return item.id === CHRYZA_BUSH_250_ID
}

function isChryzaBush300(item: FlowerItem): boolean {
  return item.id === CHRYZA_BUSH_300_ID
}


function hasAutoPackagingByQty(item: FlowerItem): boolean {
  return isRose150(item) || isRose250(item) || isRose300(item) || isAlstroemerii(item) || isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item) || isHydrangea(item) || isGypsophila(item) || isGypsophilaComposition(item) || isPeonies(item) || isTulips(item) || isChryzaSingle(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item)
}
function getPackagingPrice(item: FlowerItem, qty: number): number {
  if (!hasAutoPackagingByQty(item)) {
    return item.packagingPrice
  }
  const idx = isCarnationMix(item) ? (toOdd(qty) - 3) / 2 : (toOdd(qty) - 1) / 2
  if (isTulips(item)) {
    return TULIP_PACKAGING_BY_ODD[idx] ?? TULIP_PACKAGING_BY_ODD[TULIP_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isChryzaBush220(item)) {
    return CHRYZA_BUSH_220_PACKAGING_BY_ODD[idx] ?? CHRYZA_BUSH_220_PACKAGING_BY_ODD[CHRYZA_BUSH_220_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
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
  if (isCarnationMix(item)) {
    return CARNATION_MIX_PACKAGING_BY_ODD[idx] ?? CARNATION_MIX_PACKAGING_BY_ODD[CARNATION_MIX_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isPeonies(item)) {
    return PEONY_PACKAGING_BY_ODD[idx] ?? PEONY_PACKAGING_BY_ODD[PEONY_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isHydrangea(item)) {
    return HYDRANGEA_PACKAGING_BY_ODD[idx] ?? HYDRANGEA_PACKAGING_BY_ODD[HYDRANGEA_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
  }
  if (isGypsophilaComposition(item)) {
    return GYPSOPHILA_COMPOSITION_PACKAGING_BY_QTY[qty] ?? item.packagingPrice
  }
  if (isGypsophila(item)) {
    return GYPSOPHILA_PACKAGING_BY_ODD[idx] ?? GYPSOPHILA_PACKAGING_BY_ODD[GYPSOPHILA_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice
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
  const idx = isCarnationMix(item) ? (toOdd(qty) - 3) / 2 : (toOdd(qty) - 1) / 2
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
  if (isCarnationMix(item)) {
    return CARNATION_MIX_PISTACHIO_QTY_BY_ODD[idx] ?? CARNATION_MIX_PISTACHIO_QTY_BY_ODD[CARNATION_MIX_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0
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
  if (isPromoDisabledForQty(item, qty)) {
    return calcWithoutPromoForRow(item, qty)
  }
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

  const normalized = normalizeQty(item, value)
  qtyMap[item.id] = normalized
  qtyInputMap[item.id] = String(normalized)
  suggestedSelectionMap[item.id] = ''
  sizeButtonSelectionMap[item.id] = false
  activeRowId.value = item.id
}

function resetQty(item: FlowerItem): void {
  qtyMap[item.id] = getMinQty(item)
  qtyInputMap[item.id] = ''
  suggestedSelectionMap[item.id] = ''
  sizeButtonSelectionMap[item.id] = false
  activeRowId.value = item.id
}

function resetTargetPrice(item: FlowerItem): void {
  targetPriceMap[item.id] = ''
  suggestedSelectionMap[item.id] = ''
  activeRowId.value = item.id
}

function chooseSize(item: FlowerItem, size: number): void {
  const normalized = normalizeQty(item, size)
  qtyMap[item.id] = normalized
  qtyInputMap[item.id] = String(normalized)
  suggestedSelectionMap[item.id] = ''
  sizeButtonSelectionMap[item.id] = true
  activeRowId.value = item.id
}

function getTargetPriceValue(item: FlowerItem): string {
  return targetPriceMap[item.id] ?? ''
}

function updateTargetPrice(item: FlowerItem, value: string): void {
  targetPriceMap[item.id] = value
  suggestedSelectionMap[item.id] = ''
  activeRowId.value = item.id
}

function getQtyInputValue(item: FlowerItem): string {
  return qtyInputMap[item.id] ?? ''
}

function updateQtyInput(item: FlowerItem, value: string): void {
  qtyInputMap[item.id] = value
  if (!value.trim()) {
    qtyMap[item.id] = getMinQty(item)
    suggestedSelectionMap[item.id] = ''
    sizeButtonSelectionMap[item.id] = false
    activeRowId.value = item.id
    return
  }

  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    qtyMap[item.id] = normalizeQty(item, parsed)
    suggestedSelectionMap[item.id] = ''
    sizeButtonSelectionMap[item.id] = false
  }
  activeRowId.value = item.id
}

function commitQtyInput(item: FlowerItem): void {
  const rawValue = getQtyInputValue(item).trim()
  if (!rawValue) {
    qtyMap[item.id] = getMinQty(item)
    qtyInputMap[item.id] = ''
    suggestedSelectionMap[item.id] = ''
    sizeButtonSelectionMap[item.id] = false
    activeRowId.value = item.id
    return
  }
  chooseQty(item, Number(rawValue))
}

function chooseSuggestedQty(item: FlowerItem, option: PriceSelectionOption | null, side: 'lower' | 'higher'): void {
  if (!option) return
  const normalized = normalizeQty(item, option.qty)
  qtyMap[item.id] = normalized
  qtyInputMap[item.id] = String(normalized)
  suggestedSelectionMap[item.id] = side
  sizeButtonSelectionMap[item.id] = false
  activeRowId.value = item.id
}

type PriceSelectionOption = {
  qty: number
  price: number
}

function getPriceSelectionOptions(item: FlowerItem): PriceSelectionOption[] {
  const options = getQtyOptions(item)
    .map((qty) => ({ qty, price: Math.round(calcWithoutPromoForRow(item, qty)) }))
    .filter((option) => Number.isFinite(option.price))

  const unique = new Map<number, PriceSelectionOption>()
  for (const option of options) {
    if (!unique.has(option.price)) {
      unique.set(option.price, option)
    }
  }

  return [...unique.values()].sort((a, b) => a.price - b.price)
}

function getAdjacentPrices(item: FlowerItem): { lower: PriceSelectionOption | null; higher: PriceSelectionOption | null } {
  const rawValue = getTargetPriceValue(item)
  const target = Number(rawValue)
  if (!rawValue || !Number.isFinite(target)) {
    return { lower: null, higher: null }
  }

  const options = getPriceSelectionOptions(item)
  let lower: PriceSelectionOption | null = null
  let higher: PriceSelectionOption | null = null

  for (const option of options) {
    if (option.price < target) {
      lower = option
      continue
    }
    if (option.price > target) {
      higher = option
      break
    }
  }

  return { lower, higher }
}

function formatPrice(value: number): string {
  return String(Math.round(value))
}

function getMixQtySplit(qty: number): { primary: number; secondary: number } {
  return {
    primary: Math.ceil(qty / 2),
    secondary: Math.floor(qty / 2),
  }
}

function formatPriceWithRuble(value: number): string {
  return formatPrice(value)
}

function getFlowerCostValue(item: FlowerItem, qty: number): number {
  const secondaryUnitPrice = Number(item.secondaryUnitPrice) || 0
  if (secondaryUnitPrice > 0) {
    const split = getMixQtySplit(qty)
    return split.primary * item.unitPrice + split.secondary * secondaryUnitPrice
  }
  return qty * item.unitPrice
}

function getCompositionLabel(item: FlowerItem, qty: number): string {
  if (isGypsophilaComposition(item)) {
    return GYPSOPHILA_COMPOSITION_LABELS[qty] ?? ''
  }
  if (isCarnationMix(item)) {
    const split = getMixQtySplit(qty)
    return `${split.primary} + ${split.secondary} \u0448\u0442.`
  }
  return `${qty} \u0448\u0442.`
}

function getFlowerCostLabel(item: FlowerItem, qty: number): string {
  if (isGypsophilaComposition(item)) {
    const label = GYPSOPHILA_COMPOSITION_LABELS[qty] ?? qty
    return `${label} = ${formatPriceWithRuble(calcWithoutPromoForRow(item, qty))}`
  }
  const secondaryUnitPrice = Number(item.secondaryUnitPrice) || 0
  if (secondaryUnitPrice > 0) {
    const split = getMixQtySplit(qty)
    return `${split.primary} x ${formatPrice(item.unitPrice)} + ${split.secondary} x ${formatPrice(secondaryUnitPrice)} = ${formatPriceWithRuble(getFlowerCostValue(item, qty))}`
  }
  return `${qty} x ${formatPrice(item.unitPrice)} = ${formatPriceWithRuble(getFlowerCostValue(item, qty))}`
}

function getPistachioCostValue(item: FlowerItem, qty: number): number {
  if (isPistachioLocked(item) || !item.hasPistachio) {
    return 0
  }
  return getPistachioQty(item, qty) * PISTACHIO_UNIT_PRICE
}

function getPistachioLabel(item: FlowerItem, qty: number): string {
  if (isPistachioLocked(item)) {
    return '\u2014'
  }
  if (!item.hasPistachio) {
    return '\u0432\u044b\u043a\u043b.'
  }
  const pistachioQty = getPistachioQty(item, qty)
  if (!pistachioQty) {
    return '0'
  }
  return `${pistachioQty} x ${PISTACHIO_UNIT_PRICE} = ${formatPriceWithRuble(getPistachioCostValue(item, qty))}`
}

function getPromoPriceForPercent(item: FlowerItem, qty: number, discountPercent: number): number {
  if (isPromoDisabledForQty(item, qty)) {
    return calcWithoutPromoForRow(item, qty)
  }
  const pistachioLocked = isPistachioLocked(item)
  return calcWithPromo(
    {
      ...item,
      discountPercent,
      isPromoEnabled: true,
      packagingPrice: getPackagingPrice(item, qty),
      hasPistachio: pistachioLocked ? false : item.hasPistachio,
      pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
      pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    },
    qty,
  )
}

function getCurrentPromoLabel(item: FlowerItem, qty: number): string {
  if (isPromoDisabledForQty(item, qty)) {
    return '-'
  }
  if (!item.isPromoEnabled) {
    return '\u0432\u044b\u043a\u043b.'
  }
  return `${item.discountPercent}% = ${formatPriceWithRuble(getPromoPriceForPercent(item, qty, item.discountPercent))}`
}

function getPriceTableRows(item: FlowerItem): PriceTableRow[] {
  return getQtyOptions(item).map((qty) => ({
    qty,
    withoutPromo: formatPriceWithRuble(calcWithoutPromoForRow(item, qty)),
    pistachio: getPistachioLabel(item, qty),
    packaging: isPackagingHidden(item) ? '-' : formatPriceWithRuble(getPackagingPrice(item, qty)),
    promo10: isPromoDisabledForQty(item, qty) ? '-' : formatPriceWithRuble(getPromoPriceForPercent(item, qty, 10)),
    promo15: isPromoDisabledForQty(item, qty) ? '-' : formatPriceWithRuble(getPromoPriceForPercent(item, qty, 15)),
  }))
}

function isPistachioLocked(item: FlowerItem): boolean {
  return isTulips(item) || isGypsophila(item) || isGypsophilaComposition(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item)
}

function hidesMobilePistachio(item: FlowerItem): boolean {
  return isTulips(item) || isGypsophila(item) || isGypsophilaComposition(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item)
}

function usesAutoPistachioQty(item: FlowerItem): boolean {
  return isRose150(item) || isRose250(item) || isRose300(item) || isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item) || isAlstroemerii(item) || isHydrangea(item) || isPeonies(item) || isChryzaSingle(item)
}

function isQtyInputLocked(item: FlowerItem): boolean {
  return isGypsophilaComposition(item)
}

function getPopularSizeLabel(item: FlowerItem, size: number): string {
  if (isGypsophilaComposition(item)) {
    return GYPSOPHILA_COMPOSITION_LABELS[size] ?? String(size)
  }
  return String(size)
}

function isPopularSizeActive(item: FlowerItem, size: number): boolean {
  if (isGypsophilaComposition(item)) {
    return Boolean(sizeButtonSelectionMap[item.id]) && getQty(item) === size
  }
  return getQty(item) === size
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
  activeFlowerFilter.value = getInitialFlowerFilter(section)
  mobileOpenCategory.value = null
  if (section !== 'priceTables') {
    return
  }
  selectedPriceTableId.value = activePriceTableGroup.value?.item.id ?? priceTableGroups.value[0]?.item.id ?? ''
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

watch(activeFlowerFilter, (value) => {
  if (store.activeSection === 'priceTables' || typeof window === 'undefined') {
    return
  }
  const stored = loadStoredFlowerFilters()
  stored[store.activeSection] = value
  window.localStorage.setItem(FLOWER_FILTER_STORAGE_KEY, JSON.stringify(stored))
})

watch(() => store.activeSection, (section) => {
  if (section === 'priceTables') {
    return
  }
  activeFlowerFilter.value = getInitialFlowerFilter(section)
}, { immediate: true })

onMounted(async () => {
  await store.bootstrap()
})
</script>

<template>
  <div class="layout" @click="handlePageClick">
    <SidebarMenu :active="store.activeSection" @change="onSectionChange" />

    <main class="content">
      <header class="toolbar">
        <h1 class="toolbar-title">{{ uiLabels.title }}: {{ SECTION_LABELS[store.activeSection] }}</h1>
        <div class="toolbar-side">
          <AuthGate v-if="!store.unlocked" @unlocked="store.setUnlocked" />
          <div class="toolbar-actions">
            <button v-if="store.unlocked" @click="onChooseFile">{{ uiLabels.chooseJson }}</button>
            <button v-if="store.unlocked && store.activeSection !== 'priceTables'" @click="openCreate">{{ uiLabels.addFlower }}</button>
          </div>
        </div>
      </header>

      <div v-if="store.unlocked" class="status-row">
        <span v-if="store.fileName">{{ uiLabels.file }}: {{ store.fileName }}</span>
        <span v-else>{{ uiLabels.fileNotChosen }}</span>
        <span v-if="store.usingFallbackStorage" class="warn">{{ uiLabels.fallbackStorage }}</span>
        <span v-if="store.saveError" class="error">{{ store.saveError }}</span>
      </div>

      <section v-if="store.activeSection === 'priceTables'" class="price-matrix-page">

        <div class="price-matrix-tabs">
          <template v-for="group in priceTableGroups" :key="group.item.id">
            <div v-if="group.item.id === CHRYZA_BUSH_250_ID" class="price-matrix-tabs-break"></div>
            <button
              type="button"
              class="price-matrix-tab"
              :class="{ active: activePriceTableGroup?.item.id === group.item.id }"
              @click="selectedPriceTableId = group.item.id"
            >
              {{ group.item.flowerName }}
            </button>
          </template>
        </div>

        <article v-if="activePriceTableGroup" class="price-matrix-card">
          <div class="price-matrix-card-head">
            <div>
              <h3>{{ activePriceTableGroup.item.flowerName }}</h3>
            </div>
            <div class="price-matrix-card-meta">
              <span>{{ uiLabels.flowerPrice }}: <span class="price-with-ruble"><span>{{ formatPriceWithRuble(activePriceTableGroup.item.unitPrice) }}</span><span class="price-ruble">&#8381;</span></span></span>
              <span v-if="isCarnationMix(activePriceTableGroup.item)">{{ uiLabels.flowerPrice }} 2: <span class="price-with-ruble"><span>{{ formatPriceWithRuble(activePriceTableGroup.item.secondaryUnitPrice || 0) }}</span><span class="price-ruble">&#8381;</span></span></span>
            </div>
          </div>

          <div class="table-wrap price-matrix-table-wrap">
            <table class="price-matrix-table">
              <thead>
                <tr>
                  <th></th>
                  <th>{{ uiLabels.withoutPromo }}</th>
                  <th>{{ uiLabels.pistachio }}</th>
                  <th>{{ uiLabels.packaging }}</th>
                  <th>{{ uiLabels.promo10 }}</th>
                  <th>{{ uiLabels.promo15 }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in activePriceTableGroup.rows" :key="`${activePriceTableGroup.item.id}-${row.qty}`">
                  <td>{{ row.qty }}</td>
                  <td><span class="price-with-ruble"><span>{{ row.withoutPromo }}</span><span class="price-ruble">&#8381;</span></span></td>
                  <td>{{ row.pistachio }}</td>
                  <td>
                    <template v-if="row.packaging === '-'">-</template>
                    <span v-else class="price-with-ruble"><span>{{ row.packaging }}</span><span class="price-ruble">&#8381;</span></span>
                  </td>
                  <td><span class="price-with-ruble"><span>{{ row.promo10 }}</span><span class="price-ruble">&#8381;</span></span></td>
                  <td><span class="price-with-ruble"><span>{{ row.promo15 }}</span><span class="price-ruble">&#8381;</span></span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <template v-else>
        <div class="price-matrix-tabs flower-filter-tabs">
          <button
            v-for="filterTab in flowerFilterTabs"
            :key="filterTab.key"
            type="button"
            class="price-matrix-tab"
            :class="{ active: activeFlowerFilter === filterTab.key }"
            @click="activeFlowerFilter = filterTab.key"
          >
            {{ filterTab.label }}
          </button>
        </div>

        <div class="table-wrap desktop-table-wrap">
        <table class="price-table">
          <colgroup>
            <col style="width: 19%" />
            <col style="width: 11%" />
            <col style="width: 18%" />
            <col style="width: 9%" />
            <col style="width: 14%" />
            <col style="width: 11%" />
            <col style="width: 11%" />
            <col style="width: 11%" />
            <col v-if="store.unlocked" style="width: 14%" />
          </colgroup>
          <thead>
            <tr>
              <th>{{ uiLabels.flowerKind }}</th>
              <th>{{ uiLabels.qty }}</th>
              <th>
                <span class="popular-sizes-title">{{ uiLabels.popularSizes }}</span>
              </th>
              <th class="offer-divider">{{ uiLabels.withoutPromo }}</th>
              <th class="promo-divider">{{ uiLabels.promo }}</th>
              <th class="price-divider">{{ uiLabels.flowerPrice }}</th>
              <th>{{ uiLabels.packaging }}</th>
              <th>{{ uiLabels.pistachio }}</th>
              <th v-if="store.unlocked">{{ uiLabels.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in visibleRows" :key="item.id" :class="{ 'is-active': activeRowId === item.id, 'group-start': isGroupStart(item, index) }" @click="activeRowId = item.id">
              <td class="flower-name-cell" @click="activeRowId = item.id">
                <span>{{ item.flowerName }}</span>
                <span v-if="isGypsophilaComposition(item)" class="popular-sizes-note">{{ POPULAR_SIZES_NOTE }}</span>
              </td>
<td>
                <div class="qty-stack">
                  <div class="qty-cell">
                    <template v-if="isQtyInputLocked(item)">
                      <span class="center-input qty-select promo-disabled-mark qty-dash">-</span>
                      <button class="qty-reset" type="button" :aria-label="uiLabels.qtyResetOne" @click="resetQty(item)">
                        <img class="qty-reset-icon" :src="resetIcon" alt="" />
                      </button>
                    </template>
                    <template v-else>
                      <input
                        class="center-input qty-select"
                        type="number"
                        :min="getMinQty(item)"
                        max="101"
                        step="2"
                        :value="getQtyInputValue(item)"
                        :placeholder="uiLabels.qtyPlaceholder"
                        @input="updateQtyInput(item, ($event.target as HTMLInputElement).value)"
                        @change="commitQtyInput(item)"
                      />
                      <button class="qty-reset" type="button" :aria-label="uiLabels.qtyResetOne" @click="resetQty(item)">
                        <img class="qty-reset-icon" :src="resetIcon" alt="" />
                      </button>
                    </template>
                  </div>
                  <div class="target-price-cell">
                    <div class="currency-input-wrap currency-input-wrap-target">
                      <input
                        class="short-input center-input price-pick-input qty-price-input"
                        type="number"
                        min="0"
                        :placeholder="uiLabels.targetPrice"
                        :value="getTargetPriceValue(item)"
                        @input="updateTargetPrice(item, ($event.target as HTMLInputElement).value)"
                      />
                      <span v-if="getTargetPriceValue(item)" class="currency-input-sign">&#8381;</span>
                    </div>
                    <button class="qty-reset" type="button" :aria-label="uiLabels.priceReset" @click="resetTargetPrice(item)">
                      <img class="qty-reset-icon" :src="resetIcon" alt="" />
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="sizes-stack">
                  <div class="sizes">
                    <button
                      v-for="size in item.popularSizes"
                      :key="size"
                      :class="{ active: isPopularSizeActive(item, size) }"
                      @click="chooseSize(item, size)"
                    >
                      {{ getPopularSizeLabel(item, size) }}
                    </button>
                  </div>
                  <div class="price-pick-layout inline-price-pick-layout">
                    <button
                      type="button"
                      class="price-pick-option price-pick-option-left"
                      :class="{ 'is-empty': !getAdjacentPrices(item).lower, active: suggestedSelectionMap[item.id] === 'lower' }"
                      :disabled="!getAdjacentPrices(item).lower"
                      @click="chooseSuggestedQty(item, getAdjacentPrices(item).lower, 'lower')"
                    >
                      <span v-if="getAdjacentPrices(item).lower" class="price-with-ruble"><span>{{ formatPrice(getAdjacentPrices(item).lower!.price) }}</span><span class="price-ruble">&#8381;</span></span>
                    </button>
                    <button
                      type="button"
                      class="price-pick-option price-pick-option-right"
                      :class="{ 'is-empty': !getAdjacentPrices(item).higher, active: suggestedSelectionMap[item.id] === 'higher' }"
                      :disabled="!getAdjacentPrices(item).higher"
                      @click="chooseSuggestedQty(item, getAdjacentPrices(item).higher, 'higher')"
                    >
                      <span v-if="getAdjacentPrices(item).higher" class="price-with-ruble"><span>{{ formatPrice(getAdjacentPrices(item).higher!.price) }}</span><span class="price-ruble">&#8381;</span></span>
                    </button>
                  </div>
                </div>
              </td>
              <td class="offer-divider" :class="{ 'price-strong': activeRowId === item.id }"><span class="price-with-ruble"><span>{{ formatPrice(calcWithoutPromoForRow(item, getQty(item))) }}</span><span class="price-ruble">&#8381;</span></span></td>
              <td class="promo-divider">
                <div class="promo-col" :class="{ 'promo-col-disabled': isPromoDisabledForQty(item, getQty(item)) }">
                  <template v-if="isPromoDisabledForQty(item, getQty(item))">
                    <span class="center-cell promo-disabled-mark">-</span>
                  </template>
                  <template v-else>
                    <select
                      class="center-input"
                      :value="item.discountPercent"
                      @change="store.patchFlower(item.id, { discountPercent: Number(($event.target as HTMLSelectElement).value), isPromoEnabled: true })"
                    >
                      <option :value="10">10</option>
                      <option :value="15">15</option>
                    </select>
                    <span class="center-cell price-with-ruble" :class="{ 'price-strong': activeRowId === item.id }"><span>{{ formatPrice(calcWithPromoForRow({ ...item, isPromoEnabled: true }, getQty(item))) }}</span><span class="price-ruble">&#8381;</span></span>
                  </template>
                </div>
              </td>
              <td class="price-divider">
                <div v-if="!isCarnationMix(item)" class="currency-input-wrap">
                  <input
                    class="short-input center-input"
                    :disabled="!store.unlocked"
                    type="number"
                    min="0"
                    :value="item.unitPrice"
                    @input="store.patchFlower(item.id, { unitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                  />
                  <span class="currency-input-sign">&#8381;</span>
                </div>
                <div v-else class="mix-price-fields">
                  <div class="mix-price-item">
                    <div class="currency-input-wrap">
                      <input
                        class="short-input center-input"
                        :disabled="!store.unlocked"
                        type="number"
                        min="0"
                        :value="item.unitPrice"
                        @input="store.patchFlower(item.id, { unitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                      />
                      <span class="currency-input-sign">&#8381;</span>
                    </div>
                    <span class="mix-price-qty">{{ getMixQtySplit(getQty(item)).primary }} {{ uiLabels.pieces }}</span>
                  </div>
                  <div class="mix-price-item">
                    <div class="currency-input-wrap">
                      <input
                        class="short-input center-input"
                        :disabled="!store.unlocked"
                        type="number"
                        min="0"
                        :value="item.secondaryUnitPrice || 0"
                        @input="store.patchFlower(item.id, { secondaryUnitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                      />
                      <span class="currency-input-sign">&#8381;</span>
                    </div>
                    <span class="mix-price-qty">{{ getMixQtySplit(getQty(item)).secondary }} {{ uiLabels.pieces }}</span>
                  </div>
                </div>
              </td>
              <td>
                <template v-if="isPackagingHidden(item)">
                  <span class="promo-disabled-mark">-</span>
                </template>
                <div v-else class="currency-input-wrap">
                  <input
                    class="short-input center-input"
                    :disabled="hasAutoPackagingByQty(item) || !store.unlocked"
                    type="number"
                    min="0"
                    :value="getPackagingPrice(item, getQty(item))"
                    @input="store.patchFlower(item.id, { packagingPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                  />
                  <span class="currency-input-sign">&#8381;</span>
                </div>
              </td>
              <td>
                <div v-if="!isPistachioLocked(item)" class="pistachio-cell">
                  <input
                    type="checkbox"
                    :checked="item.hasPistachio"
                    @change="store.patchFlower(item.id, { hasPistachio: ($event.target as HTMLInputElement).checked })"
                  />
                  <input
                    class="short-input center-input"
                    :disabled="!store.unlocked || usesAutoPistachioQty(item)"
                    type="number"
                    min="0"
                    :value="getPistachioQty(item, getQty(item))"
                    @input="store.patchFlower(item.id, { pistachioQty: Number(($event.target as HTMLInputElement).value) || 0 })"
                  />
                </div>
              </td>
              <td v-if="store.unlocked">
                <div class="row-actions">
                  <button :disabled="!store.unlocked" @click="openEdit(item)">{{ uiLabels.edit }}</button>
                  <button :disabled="!store.unlocked" class="danger" @click="store.deleteFlower(item.id)">{{ uiLabels.delete }}</button>
                </div>
              </td>
            </tr>
            <tr v-if="!visibleRows.length">
              <td :colspan="store.unlocked ? 9 : 8" class="empty">{{ uiLabels.empty }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      </template>
      <div v-if="store.activeSection !== 'priceTables'" class="mobile-cards" :class="{ 'mobile-cards-grouped': mobileCardSections.length > 0 }">
        <template v-if="mobileCardSections.some((section) => section.items.length)">
          <section v-for="section in mobileCardSections" :key="section.key" class="mobile-section" :data-mobile-section="section.key">
            <button
              v-if="section.collapsible"
              type="button"
              class="mobile-category-toggle"
              :class="{ 'is-open': isMobileCategoryOpen(section.key) }"
              @click="selectMobileCategory(section.key)"
            >
              <span>{{ section.label }}</span>
              <span class="mobile-category-toggle-icon">{{ isMobileCategoryOpen(section.key) ? '-' : '+' }}</span>
            </button>

            <div v-if="!section.collapsible || isMobileCategoryOpen(section.key)" class="mobile-section-list">
              <article
                v-for="item in section.items"
                :key="item.id"
                class="mobile-card"
                :class="{ 'is-active': activeRowId === item.id }"
              >
                <div class="mobile-card-header">
                  <button class="mobile-flower-name" type="button" @click="activeRowId = item.id">
                    {{ item.flowerName }}
                  </button>
                  <span v-if="isGypsophilaComposition(item)" class="mobile-helper-note">{{ POPULAR_SIZES_NOTE }}</span>
                  <div v-if="store.unlocked" class="mobile-card-actions">
                    <button type="button" @click="openEdit(item)">{{ uiLabels.edit }}</button>
                    <button type="button" class="danger" @click="store.deleteFlower(item.id)">{{ uiLabels.delete }}</button>
                  </div>
                </div>

                <div class="mobile-card-grid">
                  <div class="mobile-card-row mobile-card-row-top mobile-card-row-top-integrated">
                    <div class="mobile-field mobile-field-qty">
                      <span class="mobile-label">{{ uiLabels.qty }}</span>
                      <div class="qty-stack">
                        <div class="qty-cell">
                          <template v-if="isQtyInputLocked(item)">
                      <span class="center-input qty-select promo-disabled-mark qty-dash">-</span>
                      <button class="qty-reset" type="button" :aria-label="uiLabels.qtyResetOne" @click="resetQty(item)">
                        <img class="qty-reset-icon" :src="resetIcon" alt="" />
                      </button>
                    </template>
                          <template v-else>
                            <input
                              class="center-input qty-select"
                              type="number"
                              :min="getMinQty(item)"
                              max="101"
                              step="2"
                              :value="getQtyInputValue(item)"
                              :placeholder="uiLabels.qtyPlaceholder"
                              @input="updateQtyInput(item, ($event.target as HTMLInputElement).value)"
                              @change="commitQtyInput(item)"
                            />
                            <button class="qty-reset" type="button" :aria-label="uiLabels.mobileQtyReset" @click="resetQty(item)">
                              <img class="qty-reset-icon" :src="resetIcon" alt="" />
                            </button>
                          </template>
                        </div>
                        <div class="target-price-cell">
                          <div class="currency-input-wrap currency-input-wrap-target currency-input-wrap-mobile">
                            <input
                              class="short-input center-input mobile-input price-pick-input qty-price-input"
                              type="number"
                              min="0"
                              :placeholder="uiLabels.targetPrice"
                              :value="getTargetPriceValue(item)"
                              @input="updateTargetPrice(item, ($event.target as HTMLInputElement).value)"
                            />
                            <span v-if="getTargetPriceValue(item)" class="currency-input-sign">&#8381;</span>
                          </div>
                          <button class="qty-reset" type="button" :aria-label="uiLabels.priceReset" @click="resetTargetPrice(item)">
                            <img class="qty-reset-icon" :src="resetIcon" alt="" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="mobile-field mobile-field-sizes">
                      <span class="mobile-label">{{ uiLabels.popularSizes }}</span>
                      <div class="sizes-stack">
                        <div class="sizes">
                          <button
                            v-for="size in item.popularSizes"
                            :key="size"
                            :class="{ active: isPopularSizeActive(item, size) }"
                            @click="chooseSize(item, size)"
                          >
                            {{ getPopularSizeLabel(item, size) }}
                          </button>
                        </div>
                        <div class="price-pick-layout inline-price-pick-layout">
                          <button
                            type="button"
                            class="price-pick-option price-pick-option-left"
                            :class="{ 'is-empty': !getAdjacentPrices(item).lower, active: suggestedSelectionMap[item.id] === 'lower' }"
                            :disabled="!getAdjacentPrices(item).lower"
                            @click="chooseSuggestedQty(item, getAdjacentPrices(item).lower, 'lower')"
                          >
                      <span v-if="getAdjacentPrices(item).lower" class="price-with-ruble"><span>{{ formatPrice(getAdjacentPrices(item).lower!.price) }}</span><span class="price-ruble">&#8381;</span></span>
                          </button>
                          <button
                            type="button"
                            class="price-pick-option price-pick-option-right"
                            :class="{ 'is-empty': !getAdjacentPrices(item).higher, active: suggestedSelectionMap[item.id] === 'higher' }"
                            :disabled="!getAdjacentPrices(item).higher"
                            @click="chooseSuggestedQty(item, getAdjacentPrices(item).higher, 'higher')"
                          >
                            <span v-if="getAdjacentPrices(item).higher" class="price-with-ruble"><span>{{ formatPrice(getAdjacentPrices(item).higher!.price) }}</span><span class="price-ruble">&#8381;</span></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mobile-card-row mobile-card-row-metrics mobile-metrics">
                    <div class="mobile-metric">
                      <span class="mobile-label">{{ uiLabels.withoutPromo }}</span>
                      <strong class="price-with-ruble" :class="{ 'price-strong': activeRowId === item.id }"><span>{{ formatPrice(calcWithoutPromoForRow(item, getQty(item))) }}</span><span class="price-ruble">&#8381;</span></strong>
                    </div>
                    <div class="mobile-metric">
                      <span class="mobile-label">{{ uiLabels.promo }}</span>
                      <div class="mobile-promo-value" :class="{ 'mobile-promo-value-disabled': isPromoDisabledForQty(item, getQty(item)) }">
                        <template v-if="isPromoDisabledForQty(item, getQty(item))">
                          <strong class="price-with-ruble promo-disabled-mark">-</strong>
                        </template>
                        <template v-else>
                          <select
                            class="center-input"
                            :value="item.discountPercent"
                            @change="store.patchFlower(item.id, { discountPercent: Number(($event.target as HTMLSelectElement).value), isPromoEnabled: true })"
                          >
                            <option :value="10">10</option>
                            <option :value="15">15</option>
                          </select>
                          <strong class="price-with-ruble" :class="{ 'price-strong': activeRowId === item.id }"><span>{{ formatPrice(calcWithPromoForRow({ ...item, isPromoEnabled: true }, getQty(item))) }}</span><span class="price-ruble">&#8381;</span></strong>
                        </template>
                      </div>
                    </div>
                  </div>

                  <div class="mobile-card-row mobile-card-row-bottom">
                    <label class="mobile-field mobile-field-compact">
                      <span class="mobile-label">{{ uiLabels.flowerPrice }}</span>
                      <div v-if="!isCarnationMix(item)" class="currency-input-wrap currency-input-wrap-mobile">
                        <input
                          class="short-input center-input mobile-input"
                          :disabled="!store.unlocked"
                          type="number"
                          min="0"
                          :value="item.unitPrice"
                          @input="store.patchFlower(item.id, { unitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                        />
                        <span class="currency-input-sign">&#8381;</span>
                      </div>
                      <div v-else class="mix-price-fields mobile-mix-price-fields">
                        <div class="mix-price-item">
                          <div class="currency-input-wrap currency-input-wrap-mobile">
                            <input
                              class="short-input center-input mobile-input"
                              :disabled="!store.unlocked"
                              type="number"
                              min="0"
                              :value="item.unitPrice"
                              @input="store.patchFlower(item.id, { unitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                            />
                            <span class="currency-input-sign">&#8381;</span>
                          </div>
                          <span class="mix-price-qty">{{ getMixQtySplit(getQty(item)).primary }} {{ uiLabels.pieces }}</span>
                        </div>
                        <div class="mix-price-item">
                          <div class="currency-input-wrap currency-input-wrap-mobile">
                            <input
                              class="short-input center-input mobile-input"
                              :disabled="!store.unlocked"
                              type="number"
                              min="0"
                              :value="item.secondaryUnitPrice || 0"
                              @input="store.patchFlower(item.id, { secondaryUnitPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                            />
                            <span class="currency-input-sign">&#8381;</span>
                          </div>
                          <span class="mix-price-qty">{{ getMixQtySplit(getQty(item)).secondary }} {{ uiLabels.pieces }}</span>
                        </div>
                      </div>
                    </label>

                    <label class="mobile-field mobile-field-compact">
                      <span class="mobile-label">{{ uiLabels.packaging }}</span>
                      <template v-if="isPackagingHidden(item)">
                        <span class="promo-disabled-mark">-</span>
                      </template>
                      <div v-else class="currency-input-wrap currency-input-wrap-mobile">
                        <input
                          class="short-input center-input mobile-input"
                          :disabled="hasAutoPackagingByQty(item) || !store.unlocked"
                          type="number"
                          min="0"
                          :value="getPackagingPrice(item, getQty(item))"
                          @input="store.patchFlower(item.id, { packagingPrice: Number(($event.target as HTMLInputElement).value) || 0 })"
                        />
                        <span class="currency-input-sign">&#8381;</span>
                      </div>
                    </label>

                    <div v-if="hidesMobilePistachio(item)" class="mobile-field mobile-field-compact mobile-field-pistachio mobile-field-pistachio-empty"></div>

                    <div v-else class="mobile-field mobile-field-compact mobile-field-pistachio">
                      <div class="mobile-field-head mobile-field-head-inline">
                        <span class="mobile-label">{{ uiLabels.pistachio }}</span>
                        <label class="mobile-checkbox mobile-checkbox-inline">
                          <input
                            type="checkbox"
                            :checked="isPistachioLocked(item) ? false : item.hasPistachio"
                            :disabled="isPistachioLocked(item)"
                            @change="store.patchFlower(item.id, { hasPistachio: ($event.target as HTMLInputElement).checked })"
                          />
                        </label>
                      </div>
                      <div class="pistachio-cell mobile-pistachio-cell">
                        <input
                          class="short-input center-input mobile-input"
                          :disabled="!store.unlocked || isPistachioLocked(item) || usesAutoPistachioQty(item)"
                          type="number"
                          min="0"
                          :value="isPistachioLocked(item) ? '' : getPistachioQty(item, getQty(item))"
                          @input="store.patchFlower(item.id, { pistachioQty: Number(($event.target as HTMLInputElement).value) || 0 })"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </template>

        <div v-else class="empty mobile-empty">{{ uiLabels.empty }}</div>
      </div>
    </main>


    <FlowerEditorModal
      :model-value="editorOpen"
      :initial="editorItem"
      :section="store.activeSection === 'priceTables' ? 'osnovnye' : store.activeSection"
      @close="editorOpen = false"
      @save="saveEditor"
    />
  </div>
</template>



































