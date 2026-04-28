import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { FlowerDatabase, FlowerItem, SectionKey } from '../types'
import {
  clearStoredHandle,
  ensureReadPermission,
  ensureReadWritePermission,
  isFileSystemApiAvailable,
  loadStoredHandle,
  pickJsonFile,
  readJsonFile,
  storeHandle,
  writeJsonFile,
} from '../utils/fileSystem'
import { DEFAULT_SIZES } from '../types'
import { fetchWikimediaImage, getPlaceholderImage } from '../utils/wikimedia'

const LOCAL_STORAGE_KEY = 'flowers-baza-fallback'
const ACTIVE_SECTION_KEY = 'flowers-baza-active-section'
const PROJECT_JSON_PATH = `${import.meta.env.BASE_URL}data/flowers.json`
const PROJECT_JSON_REFRESH_MS = 500
const HYDRANGEA_ID = '49771275-f9ae-4bd3-9fe6-d42bda7b5dfd'
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de'
const CARNATION_COMMON_ID = 'e44cee36-55f1-4532-8ab3-9d60ea7175dc'
const CARNATION_MOON_ID = 'ff7772fb-f770-4702-8963-f717440d617c'
const CARNATION_MIX_ID = '9f340ce7-5f4a-4f3d-8e8f-1e165566aa01'
const CHRYZA_BUSH_220_ID = 'b3d0d1d2-4fd5-4a12-9ea8-220220220220'
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1'
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3'
const GYPSOPHILA_ID = '5d8d5e68-cbd2-4e9a-a2ea-9fd6b7f9c201'
const GYPSOPHILA_COMPOSITION_ID = '0f3b0a0d-6b0c-4cf0-8d32-7e5f49d0b902'
const ALSTROMERII_ID = 'd9821a47-a022-4147-a88e-4857ed43deb9'
const TANACETUM_ID = 'c2dcf0a6-f7fb-4c48-b2a4-290290290290'

function isSectionKey(value: string | null): value is SectionKey {
  return value === 'osnovnye' || value === 'sezonnye' || value === 'priceTables'
}

function loadActiveSection(): SectionKey {
  const stored = localStorage.getItem(ACTIVE_SECTION_KEY)
  return isSectionKey(stored) ? stored : 'osnovnye'
}

function hasFallbackData(): boolean {
  return !!localStorage.getItem(LOCAL_STORAGE_KEY)
}

function normalizeDiscountPercent(item: Pick<FlowerItem, 'id' | 'discountPercent'>): number {
  return Number(item.discountPercent) || 0
}

function isCarnationId(id: string): boolean {
  return id === CARNATION_COMMON_ID || id === CARNATION_MOON_ID || id === CARNATION_MIX_ID
}

function normalizeLoadedDiscountPercent(item: Pick<FlowerItem, 'id' | 'discountPercent'>): number {
  if (isCarnationId(item.id)) {
    return 10
  }
  return normalizeDiscountPercent(item)
}

function ensureRequiredItems(items: FlowerItem[]): FlowerItem[] {
  const next = [...items]
  const hasMix = next.some((item) => item.id === CARNATION_MIX_ID)
  const hasChryzaBush220 = next.some((item) => item.id === CHRYZA_BUSH_220_ID)
  const hasGypsophila = next.some((item) => item.id === GYPSOPHILA_ID)
  const hasGypsophilaComposition = next.some((item) => item.id === GYPSOPHILA_COMPOSITION_ID)
  const hasTanacetum = next.some((item) => item.id === TANACETUM_ID)

  if (!hasMix) {
    const moonIndex = next.findIndex((item) => item.id === CARNATION_MOON_ID)
    const mixItem: FlowerItem = {
      id: CARNATION_MIX_ID,
      section: 'osnovnye',
      flowerName: 'ГВОЗДИКИ - микс',
      photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      unitPrice: 100,
      secondaryUnitPrice: 130,
      packagingPrice: 0,
      hasPistachio: true,
      pistachioQty: 0,
      pistachioUnitPrice: 80,
      discountPercent: 10,
      isPromoEnabled: true,
      popularSizes: [9, 11, 15, 25, 35],
    }

    if (moonIndex >= 0) {
      next.splice(moonIndex + 1, 0, mixItem)
    } else {
      next.push(mixItem)
    }
  }


  if (!hasChryzaBush220) {
    const bush250Index = next.findIndex((item) => item.id === CHRYZA_BUSH_250_ID)
    const bush220Item: FlowerItem = {
      id: CHRYZA_BUSH_220_ID,
      section: 'osnovnye',
      flowerName: 'ХРИЗА - кустовая по 220',
      photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      unitPrice: 220,
      packagingPrice: 0,
      hasPistachio: false,
      pistachioQty: 0,
      pistachioUnitPrice: 80,
      discountPercent: 10,
      isPromoEnabled: false,
      popularSizes: [3, 5, 7, 9, 11, 15],
    }

    if (bush250Index >= 0) {
      next.splice(bush250Index, 0, bush220Item)
    } else {
      next.push(bush220Item)
    }
  }

  if (!hasGypsophila) {
    const hydrangeaIndex = next.findIndex((item) => item.id === HYDRANGEA_ID)
    const gypsophilaItem: FlowerItem = {
      id: GYPSOPHILA_ID,
      section: 'osnovnye',
      flowerName: 'ГИПСОФИЛА - букеты',
      photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      unitPrice: 200,
      packagingPrice: 0,
      hasPistachio: false,
      pistachioQty: 0,
      pistachioUnitPrice: 80,
      discountPercent: 10,
      isPromoEnabled: false,
      popularSizes: [7, 9, 11, 15, 25],
    }

    if (hydrangeaIndex >= 0) {
      next.splice(hydrangeaIndex + 1, 0, gypsophilaItem)
    } else {
      next.push(gypsophilaItem)
    }
  }

  if (!hasGypsophilaComposition) {
    const bouquetIndex = next.findIndex((item) => item.id === GYPSOPHILA_ID)
    const gypsophilaCompositionItem: FlowerItem = {
      id: GYPSOPHILA_COMPOSITION_ID,
      section: 'osnovnye',
      flowerName: 'ГИПСОФИЛА - композиции',
      photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      unitPrice: 200,
      packagingPrice: 0,
      hasPistachio: false,
      pistachioQty: 0,
      pistachioUnitPrice: 80,
      discountPercent: 10,
      isPromoEnabled: false,
      popularSizes: [1, 3, 5, 7, 25],
    }

    if (bouquetIndex >= 0) {
      next.splice(bouquetIndex + 1, 0, gypsophilaCompositionItem)
    } else {
      next.push(gypsophilaCompositionItem)
    }
  }

  if (!hasTanacetum) {
    const tanacetumItem: FlowerItem = {
      id: TANACETUM_ID,
      section: 'osnovnye',
      flowerName: 'ТАНАЦЕТУМ',
      photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      unitPrice: 290,
      packagingPrice: 0,
      hasPistachio: false,
      pistachioQty: 0,
      pistachioUnitPrice: 80,
      discountPercent: 10,
      isPromoEnabled: true,
      popularSizes: [5, 7, 9, 11, 15, 25],
    }

    next.push(tanacetumItem)
  }

  return next
}

function normalizeItem(item: FlowerItem): FlowerItem {
  const normalizedFlowerName = item.id === CARNATION_MIX_ID ? 'ГВОЗДИКИ - микс' : item.flowerName
  const popularSizes = item.id === HYDRANGEA_ID
    ? [1, 3, 5, 7, 9, 11]
    : item.id === CHRYZA_SINGLE_ID
      ? [3, 5, 7, 9, 11]
      : item.id === CARNATION_COMMON_ID || item.id === CARNATION_MOON_ID || item.id === CARNATION_MIX_ID
        ? [9, 11, 15, 25, 35]
        : item.id === CHRYZA_BUSH_220_ID || item.id === CHRYZA_BUSH_250_ID || item.id === CHRYZA_BUSH_300_ID
          ? [3, 5, 7, 9, 11, 15]
          : item.id === ALSTROMERII_ID
            ? [5, 7, 9, 11, 15]
            : item.id === TANACETUM_ID
              ? [5, 7, 9, 11, 15, 25]
            : item.popularSizes?.length ? item.popularSizes.map((s) => Number(s)) : [...DEFAULT_SIZES]

  return {
    ...item,
    flowerName: normalizedFlowerName,
    popularSizes,
    unitPrice: Number(item.unitPrice) || 0,
    secondaryUnitPrice: Number(item.secondaryUnitPrice) || 0,
    packagingPrice: Number(item.packagingPrice) || 0,
    pistachioQty: Number(item.pistachioQty) || 0,
    pistachioUnitPrice: 80,
    discountPercent: normalizeLoadedDiscountPercent(item),
    photoUrl: item.photoUrl || getPlaceholderImage(),
  }
}

function buildDb(items: FlowerItem[]): FlowerDatabase {
  return {
    updatedAt: new Date().toISOString(),
    items: ensureRequiredItems(items),
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Не удалось загрузить данные из файла'
}

function getDbSignature(db: FlowerDatabase): string {
  return JSON.stringify({
    updatedAt: db.updatedAt ?? null,
    items: db.items ?? [],
  })
}

export const useFlowersStore = defineStore('flowers', () => {
  const flowers = ref<FlowerItem[]>([])
  const activeSection = ref<SectionKey>(loadActiveSection())
  const unlocked = ref(false)
  const fileName = ref('')
  const usingFallbackStorage = ref(false)
  const loading = ref(false)
  const saveError = ref('')
  const handle = ref<FileSystemFileHandle>()
  const saveTimer = ref<number>()
  const projectJsonPoller = ref<number>()
  const lastLoadedSignature = ref('')
  const isRefreshing = ref(false)

  watch(activeSection, (value) => {
    localStorage.setItem(ACTIVE_SECTION_KEY, value)
  }, { immediate: true })

  const filteredBySection = computed(() => activeSection.value === 'priceTables' ? flowers.value : flowers.value.filter((item) => item.section === activeSection.value))

  function setUnlocked(value: boolean): void {
    unlocked.value = value
  }

  function markDirtyAutoSave(): void {
    if (saveTimer.value) {
      clearTimeout(saveTimer.value)
    }

    saveTimer.value = window.setTimeout(async () => {
      await saveNow()
    }, 400)
  }

  async function loadFromFallback(): Promise<void> {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      flowers.value = []
      lastLoadedSignature.value = ''
      return
    }
    const parsed = JSON.parse(raw) as FlowerDatabase
    flowers.value = ensureRequiredItems(parsed.items || []).map(normalizeItem)
    fileName.value = 'localStorage'
    lastLoadedSignature.value = getDbSignature(parsed)
  }

  async function applyDatabase(db: FlowerDatabase, nextFileName: string): Promise<void> {
    flowers.value = ensureRequiredItems(db.items || []).map(normalizeItem)
    fileName.value = nextFileName
    saveError.value = ''
    lastLoadedSignature.value = getDbSignature(db)
  }

  async function loadFromProjectJson(): Promise<boolean> {
    try {
      const response = await fetch(PROJECT_JSON_PATH, { cache: 'no-store' })
      if (!response.ok) {
        return false
      }
      const db = (await response.json()) as FlowerDatabase
      await applyDatabase(db, 'data/flowers.json')
      return true
    } catch {
      return false
    }
  }

  async function refreshFromSourceIfAvailable(): Promise<void> {
    if (isRefreshing.value) {
      return
    }

    isRefreshing.value = true
    try {
      if (usingFallbackStorage.value && !handle.value) {
        const response = await fetch(PROJECT_JSON_PATH, { cache: 'no-store' })
        if (!response.ok) {
          return
        }
        const db = (await response.json()) as FlowerDatabase
        const signature = getDbSignature(db)
        if (signature !== lastLoadedSignature.value) {
          await applyDatabase(db, 'data/flowers.json')
        }
        return
      }

      if (!handle.value) {
        return
      }

      const db = await readJsonFile<FlowerDatabase>(handle.value)
      const signature = getDbSignature(db)
      if (signature !== lastLoadedSignature.value) {
        await applyDatabase(db, handle.value.name)
      }
    } finally {
      isRefreshing.value = false
    }
  }

  function refreshFromSourceSoon(): void {
    void refreshFromSourceIfAvailable()
  }

  function refreshWhenVisible(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return
    }
    refreshFromSourceSoon()
  }

  function stopProjectJsonPolling(): void {
    if (projectJsonPoller.value) {
      clearInterval(projectJsonPoller.value)
      projectJsonPoller.value = undefined
    }
  }

  function startProjectJsonPolling(): void {
    if (typeof window === 'undefined') {
      return
    }
    stopProjectJsonPolling()
    refreshFromSourceSoon()
    projectJsonPoller.value = window.setInterval(() => {
      void refreshFromSourceIfAvailable()
    }, PROJECT_JSON_REFRESH_MS)
    window.removeEventListener('focus', refreshFromSourceSoon)
    document.removeEventListener('visibilitychange', refreshWhenVisible)
    window.addEventListener('focus', refreshFromSourceSoon)
    document.addEventListener('visibilitychange', refreshWhenVisible)
  }

  function dispose(): void {
    stopProjectJsonPolling()
    if (typeof window === 'undefined') {
      return
    }
    window.removeEventListener('focus', refreshFromSourceSoon)
    document.removeEventListener('visibilitychange', refreshWhenVisible)
  }

  async function saveToFallback(): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(buildDb(flowers.value)))
  }

  async function chooseFile(): Promise<void> {
    saveError.value = ''
    if (!isFileSystemApiAvailable()) {
      usingFallbackStorage.value = true
      const loaded = await loadFromProjectJson()
      if (!loaded && hasFallbackData()) {
        await loadFromFallback()
      }
      startProjectJsonPolling()
      return
    }

    try {
      const picked = await pickJsonFile()
      const canRead = await ensureReadPermission(picked)
      const canWrite = await ensureReadWritePermission(picked)
      if (!canRead || !canWrite) {
        throw new Error('Нет доступа на чтение/запись JSON-файла')
      }

      handle.value = picked
      fileName.value = picked.name
      await storeHandle(picked)

      const db = await readJsonFile<FlowerDatabase>(picked)
      await applyDatabase(db, picked.name)
      usingFallbackStorage.value = false
      startProjectJsonPolling()
    } catch (error) {
      saveError.value = `Ошибка загрузки: ${errorMessage(error)}`
      const loaded = await loadFromProjectJson()
      if (!loaded) {
        await loadFromFallback()
      }
      startProjectJsonPolling()
    }
  }

  async function bootstrap(): Promise<void> {
    loading.value = true
    saveError.value = ''
    try {
      if (!isFileSystemApiAvailable()) {
        usingFallbackStorage.value = true
        const loaded = await loadFromProjectJson()
        if (!loaded && hasFallbackData()) {
          await loadFromFallback()
        }
        startProjectJsonPolling()
        return
      }

      const stored = await loadStoredHandle()
      if (!stored) {
        usingFallbackStorage.value = true
        const loaded = await loadFromProjectJson()
        if (!loaded && hasFallbackData()) {
          await loadFromFallback()
        }
        startProjectJsonPolling()
        return
      }

      const canRead = await ensureReadPermission(stored)
      const canWrite = await ensureReadWritePermission(stored)
      if (!canRead || !canWrite) {
        await clearStoredHandle()
        usingFallbackStorage.value = true
        const loaded = await loadFromProjectJson()
        if (!loaded && hasFallbackData()) {
          await loadFromFallback()
        }
        startProjectJsonPolling()
        return
      }

      handle.value = stored
      fileName.value = stored.name
      const db = await readJsonFile<FlowerDatabase>(stored)
      await applyDatabase(db, stored.name)
      usingFallbackStorage.value = false
      startProjectJsonPolling()
    } catch (error) {
      saveError.value = `Ошибка загрузки: ${errorMessage(error)}`
      await clearStoredHandle()
      const loaded = await loadFromProjectJson()
      if (!loaded) {
        await loadFromFallback()
      }
      startProjectJsonPolling()
    } finally {
      loading.value = false
    }
  }

  async function saveNow(): Promise<void> {
    saveError.value = ''
    try {
      if (usingFallbackStorage.value || !handle.value) {
        const db = buildDb(flowers.value)
        await saveToFallback()
        lastLoadedSignature.value = getDbSignature(db)
        return
      }
      const db = buildDb(flowers.value)
      await writeJsonFile(handle.value, db)
      lastLoadedSignature.value = getDbSignature(db)
    } catch {
      saveError.value = 'Ошибка автосохранения. Выберите JSON-файл заново.'
    }
  }

  async function upsertFlower(input: FlowerItem): Promise<void> {
    const item = normalizeItem(input)
    const idx = flowers.value.findIndex((f) => f.id === item.id)
    if (idx === -1) {
      flowers.value.push(item)
    } else {
      flowers.value[idx] = item
    }
    markDirtyAutoSave()
  }

  function deleteFlower(id: string): void {
    flowers.value = flowers.value.filter((item) => item.id !== id)
    markDirtyAutoSave()
  }

  function patchFlower(id: string, patch: Partial<FlowerItem>): void {
    const item = flowers.value.find((f) => f.id === id)
    if (!item) {
      return
    }
    Object.assign(item, patch)
    markDirtyAutoSave()
  }

  async function attachAutoImage(id: string): Promise<void> {
    const item = flowers.value.find((f) => f.id === id)
    if (!item) {
      return
    }
    const image = await fetchWikimediaImage(item.flowerName)
    item.photoUrl = image
    markDirtyAutoSave()
  }

  return {
    flowers,
    activeSection,
    unlocked,
    fileName,
    loading,
    saveError,
    usingFallbackStorage,
    filteredBySection,
    setUnlocked,
    bootstrap,
    chooseFile,
    dispose,
    refreshFromSourceIfAvailable,
    saveNow,
    upsertFlower,
    deleteFlower,
    patchFlower,
    attachAutoImage,
  }
})
