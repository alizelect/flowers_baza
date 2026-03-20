export type SectionKey = 'osnovnye' | 'sezonnye' | 'priceTables'

export interface FlowerItem {
  id: string
  section: SectionKey
  flowerName: string
  photoUrl: string
  unitPrice: number
  secondaryUnitPrice?: number
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
  osnovnye: '\u041e\u0441\u043d\u043e\u0432\u043d\u044b\u0435',
  sezonnye: '\u0421\u0435\u0437\u043e\u043d\u043d\u044b\u0435',
  priceTables: '\u0422\u0430\u0431\u043b\u0438\u0446\u044b \u0446\u0435\u043d',
}
