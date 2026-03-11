export type SectionKey = 'osnovnye' | 'sezonnye'

export interface FlowerItem {
  id: string
  section: SectionKey
  flowerName: string
  photoUrl: string
  unitPrice: number
  packagingPrice: number
  hasPistachio: boolean
  pistachioQty: number
  pistachioUnitPrice: number
  discountPercent: number
  isPromoEnabled: boolean
  popularSizes: number[]
}

export interface FlowerDatabase {
  updatedAt: string
  items: FlowerItem[]
}

export const DEFAULT_SIZES = [7, 9, 11, 15, 25]

export const SECTION_LABELS: Record<SectionKey, string> = {
  osnovnye: 'Основные',
  sezonnye: 'Сезонные',
}


