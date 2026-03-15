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
const HYDRANGEA_ID = '49771275-f9ae-4bd3-9fe6-d42bda7b5dfd'
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de'
const CARNATION_COMMON_ID = 'e44cee36-55f1-4532-8ab3-9d60ea7175dc'
const CARNATION_MOON_ID = 'ff7772fb-f770-4702-8963-f717440d617c'
const CARNATION_MIX_ID = '9f340ce7-5f4a-4f3d-8e8f-1e165566aa01'
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1'
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3'
const ALSTROMERII_ID = 'd9821a47-a022-4147-a88e-4857ed43deb9'

function isSectionKey(value: string | null): value is SectionKey {
  return value === 'osnovnye' || value === 'sezonnye'
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

  if (!hasMix) {
    const moonIndex = next.findIndex((item) => item.id === CARNATION_MOON_ID)
    const mixItem: FlowerItem = {
      id: CARNATION_MIX_ID,
      section: 'osnovnye',
      flowerName: '\u0413\u0412\u041E\u0417\u0414\u0418\u041A\u0418 - \u043C\u0438\u043A\u0441',
      photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      unitPrice: 100,
      secondaryUnitPrice: 130,
      packagingPrice: 0,
      hasPistachio: true,
      pistachioQty: 0,
      pistachioUnitPrice: 40,
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

  return next
}

function normalizeItem(item: FlowerItem): FlowerItem {
  const normalizedFlowerName = item.id === CARNATION_MIX_ID ? '\u0413\u0412\u041E\u0417\u0414\u0418\u041A\u0418 - \u043C\u0438\u043A\u0441' : item.flowerName
  const popularSizes = item.id === HYDRANGEA_ID
    ? [3, 5, 7, 9, 11]
    : item.id === CHRYZA_SINGLE_ID
      ? [3, 5, 7, 9, 11]
      : item.id === CARNATION_COMMON_ID || item.id === CARNATION_MOON_ID || item.id === CARNATION_MIX_ID
        ? [9, 11, 15, 25, 35]
        : item.id === CHRYZA_BUSH_250_ID || item.id === CHRYZA_BUSH_300_ID
          ? [3, 5, 7, 11, 15]
          : item.id === ALSTROMERII_ID
            ? [5, 7, 9, 11, 15]
            : item.popularSizes?.length ? item.popularSizes.map((s) => Number(s)) : [...DEFAULT_SIZES]

  return {
    ...item,
    flowerName: normalizedFlowerName,
    popularSizes,
    unitPrice: Number(item.unitPrice) || 0,
    secondaryUnitPrice: Number(item.secondaryUnitPrice) || 0,
    packagingPrice: Number(item.packagingPrice) || 0,
    pistachioQty: Number(item.pistachioQty) || 0,
    pistachioUnitPrice: Number(item.pistachioUnitPrice) || 40,
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

  watch(activeSection, (value) => {
    localStorage.setItem(ACTIVE_SECTION_KEY, value)
  }, { immediate: true })

  const filteredBySection = computed(() => flowers.value.filter((item) => item.section === activeSection.value))

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
      return
    }
    const parsed = JSON.parse(raw) as FlowerDatabase
    flowers.value = ensureRequiredItems(parsed.items || []).map(normalizeItem)
    fileName.value = 'localStorage'
  }

  async function loadFromProjectJson(): Promise<boolean> {
    try {
      const response = await fetch(PROJECT_JSON_PATH, { cache: 'no-store' })
      if (!response.ok) {
        return false
      }
      const db = (await response.json()) as FlowerDatabase
      flowers.value = ensureRequiredItems(db.items || []).map(normalizeItem)
      fileName.value = 'data/flowers.json'
      saveError.value = ''
      return true
    } catch {
      return false
    }
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
      flowers.value = (db.items || []).map(normalizeItem)
      usingFallbackStorage.value = false
    } catch (error) {
      saveError.value = `Ошибка загрузки: ${errorMessage(error)}`
      const loaded = await loadFromProjectJson()
      if (!loaded) {
        await loadFromFallback()
      }
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
        return
      }

      const stored = await loadStoredHandle()
      if (!stored) {
        usingFallbackStorage.value = true
        const loaded = await loadFromProjectJson()
        if (!loaded && hasFallbackData()) {
          await loadFromFallback()
        }
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
        return
      }

      handle.value = stored
      fileName.value = stored.name
      const db = await readJsonFile<FlowerDatabase>(stored)
      flowers.value = (db.items || []).map(normalizeItem)
      usingFallbackStorage.value = false
    } catch (error) {
      saveError.value = `Ошибка загрузки: ${errorMessage(error)}`
      await clearStoredHandle()
      const loaded = await loadFromProjectJson()
      if (!loaded) {
        await loadFromFallback()
      }
    } finally {
      loading.value = false
    }
  }

  async function saveNow(): Promise<void> {
    saveError.value = ''
    try {
      if (usingFallbackStorage.value || !handle.value) {
        await saveToFallback()
        return
      }
      await writeJsonFile(handle.value, buildDb(flowers.value))
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
    saveNow,
    upsertFlower,
    deleteFlower,
    patchFlower,
    attachAutoImage,
  }
})






