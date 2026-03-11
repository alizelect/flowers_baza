import fs from 'node:fs/promises'
import path from 'node:path'
import XLSX from 'xlsx'

const INPUT_PATH = process.argv[2] || 'C:/Users/user/Downloads/ЦЕНЫ МОНИКИ 11.2024.xlsx'
const OUTPUT_PATH = process.argv[3] || path.resolve('data/flowers.json')

const DEFAULT_SIZES = [15, 25, 35, 51]
const PLACEHOLDER = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80'

const SECTION_MAP = {
  'ОСНОВНЫЕ': 'osnovnye',
  'Сезонные': 'sezonnye',
}

const STOP_WORDS = ['по ', 'фист', 'уп.', 'упаков', 'обычных', 'лунных', 'цены', 'архив', 'акци']

function cleanText(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function isText(value) {
  return typeof value === 'string' && /[A-Za-zА-Яа-яЁё]/.test(value)
}

function isMeaningfulName(value) {
  if (!isText(value)) return false
  const s = cleanText(value)
  if (!s || s.length < 3) return false
  const low = s.toLowerCase()
  if (STOP_WORDS.some((w) => low.includes(w))) return false
  return true
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const normalized = cleanText(value).replace(',', '.').replace(/[^\d.-]/g, '')
    const n = Number(normalized)
    if (Number.isFinite(n)) return n
  }
  return null
}

function createItem(section, name, unitPrice) {
  const flowerName = cleanText(name)
  return {
    id: crypto.randomUUID(),
    section,
    flowerName,
    photoUrl: PLACEHOLDER,
    unitPrice,
    packagingPrice: 0,
    hasPistachio: false,
    pistachioQty: 0,
    pistachioUnitPrice: 40,
    discountPercent: 10,
    isPromoEnabled: false,
    popularSizes: DEFAULT_SIZES,
  }
}

function extractSheetItems(rows, section) {
  const items = []
  const used = new Set()
  for (let r = 0; r < rows.length; r += 1) {
    for (let c = 0; c < rows[r].length; c += 1) {
      const cell = rows[r][c]
      if (!isMeaningfulName(cell)) continue

      let foundPrice = null
      const probes = [[r + 1, c], [r + 2, c], [r, c + 1], [r + 1, c + 1], [r + 2, c + 1]]
      for (const [pr, pc] of probes) {
        const row = rows[pr]
        if (!row) continue
        const n = toNumber(row[pc])
        if (n && n > 0) {
          foundPrice = n
          break
        }
      }
      if (!foundPrice) continue

      const flowerName = cleanText(String(cell))
      const key = `${section}:${flowerName.toLowerCase()}`
      if (used.has(key)) continue
      used.add(key)
      items.push(createItem(section, flowerName, foundPrice))
    }
  }
  return items
}

async function main() {
  const workbook = XLSX.readFile(INPUT_PATH)
  const allItems = []

  for (const sheetName of Object.keys(SECTION_MAP)) {
    const ws = workbook.Sheets[sheetName]
    if (!ws) continue
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' })
    allItems.push(...extractSheetItems(rows, SECTION_MAP[sheetName]))
  }

  const dedup = new Map()
  for (const item of allItems) {
    const key = `${item.section}:${item.flowerName.toLowerCase()}`
    if (!dedup.has(key)) dedup.set(key, item)
  }

  const payload = { updatedAt: new Date().toISOString(), items: [...dedup.values()] }
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
  process.stdout.write(`Imported ${payload.items.length} items into ${OUTPUT_PATH}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
