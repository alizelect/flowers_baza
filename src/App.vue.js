import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import AuthGate from './components/AuthGate.vue';
import FlowerEditorModal from './components/FlowerEditorModal.vue';
import SidebarMenu from './components/SidebarMenu.vue';
import { useFlowersStore } from './stores/flowers';
import { SECTION_LABELS } from './types';
import { calcWithPromo, calcWithoutPromo, toOdd } from './utils/pricing';
import resetIcon from './assets/reset-icon.png';
const store = useFlowersStore();
const editorOpen = ref(false);
const editorItem = ref();
const activeRowId = ref('');
const qtyMap = reactive({});
const qtyInputMap = reactive({});
const targetPriceMap = reactive({});
const suggestedSelectionMap = reactive({});
const sizeButtonSelectionMap = reactive({});
const MOBILE_BREAKPOINT = 760;
const isMobileViewport = ref(false);
const mobilePriceMatrixPromo = ref('10');
const oddOptions = Array.from({ length: 51 }, (_, i) => i * 2 + 1);
const hydrangeaOddOptions = Array.from({ length: 18 }, (_, i) => i * 2 + 1);
const POPULAR_SIZES_NOTE = '*в столбце "Популярные размеры" указан диаметр коробок';
const mobileOpenCategory = ref(loadStoredMobileOpenCategories()[store.activeSection] ?? null);
const CHRYZA_BUSH_220_ID = 'b3d0d1d2-4fd5-4a12-9ea8-220220220220';
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1';
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de';
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3';
const GYPSOPHILA_ID = '5d8d5e68-cbd2-4e9a-a2ea-9fd6b7f9c201';
const GYPSOPHILA_COMPOSITION_ID = '0f3b0a0d-6b0c-4cf0-8d32-7e5f49d0b902';
const CARNATION_MIX_ID = '9f340ce7-5f4a-4f3d-8e8f-1e165566aa01';
const TANACETUM_ID = 'c2dcf0a6-f7fb-4c48-b2a4-290290290290';
const MOBILE_PRIMARY_CATEGORY_ORDER = ['rose', 'alstroemerii', 'carnation', 'chryza', 'hydrangea', 'gypsophila', 'tanacetum'];
const MOBILE_SEASONAL_CATEGORY_ORDER = ['peony', 'tulip'];
const PRIMARY_FLOWER_FILTER_ORDER = ['all', 'rose', 'alstroemerii', 'carnation', 'chryza', 'hydrangea', 'gypsophila', 'tanacetum'];
const SEASONAL_FLOWER_FILTER_ORDER = ['all', 'peony', 'tulip'];
const FLOWER_FILTER_STORAGE_KEY = 'flowers-baza-active-flower-filters';
const PRICE_MATRIX_STORAGE_KEY = 'flowers-baza-price-matrix-state';
const MOBILE_OPEN_CATEGORY_STORAGE_KEY = 'flowers-baza-mobile-open-categories';
const uiLabels = {
    title: '\u041c\u043e\u043d\u043e\u0431\u0443\u043a\u0435\u0442\u044b',
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
    withoutPromo: '\u0426\u0435\u043d\u0430',
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
};
const MOBILE_PRIMARY_CATEGORY_LABELS = {
    rose: '\u0420\u043e\u0437\u044b',
    alstroemerii: '\u0410\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438',
    carnation: '\u0413\u0432\u043e\u0437\u0434\u0438\u043a\u0438',
    chryza: '\u0425\u0440\u0438\u0437\u0430\u043d\u0442\u0435\u043c\u044b',
    tanacetum: '\u0422\u0430\u043d\u0430\u0446\u0435\u0442\u0443\u043c',
    hydrangea: '\u0413\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438',
    gypsophila: '\u0413\u0438\u043f\u0441\u043e\u0444\u0438\u043b\u0430',
};
const FLOWER_FILTER_LABELS = {
    all: '\u0412\u0441\u0435 \u0446\u0432\u0435\u0442\u044b',
    rose: '\u0420\u043e\u0437\u044b',
    alstroemerii: '\u0410\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438',
    carnation: '\u0413\u0432\u043e\u0437\u0434\u0438\u043a\u0438',
    chryza: '\u0425\u0440\u0438\u0437\u0430\u043d\u0442\u0435\u043c\u044b',
    tanacetum: '\u0422\u0430\u043d\u0430\u0446\u0435\u0442\u0443\u043c',
    hydrangea: '\u0413\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438',
    gypsophila: '\u0413\u0438\u043f\u0441\u043e\u0444\u0438\u043b\u0430',
    peony: '\u041f\u0438\u043e\u043d\u044b',
    tulip: '\u0422\u044e\u043b\u044c\u043f\u0430\u043d\u044b',
};
const ROSE_VARIETY_TABLES = [
    {
        title: 'РОЗЫ по 150',
        columns: [
            ['российская', 'Sophia Loren'],
        ],
    },
    {
        title: 'РОЗЫ по 200',
        columns: [
            ['Mandala'],
        ],
    },
    {
        title: 'РОЗЫ по 250',
        columns: [
            ['Nina', 'Candlelight', 'Sweet for love', 'Faith', 'Priority'],
            ['Free spirit', 'Pink Mondial', 'Mondial', 'Shimmer'],
        ],
    },
    {
        title: 'РОЗЫ по 300',
        columns: [
            ['Explorer', 'Pink Floyd', 'Candy Expression', 'Pink Expression', 'Mandarin', 'Hermosa', "Pink O'Hara", "White O'Hara", 'Playa Blanca'],
            ['Quicksand', 'Menta', 'Sweet Menta', "Queen's Crown", 'Country Blues', 'Be Sweet', 'Suave', 'Lilit'],
        ],
    },
    {
        title: 'РОЗЫ по 400',
        columns: [
            ['Veggie'],
        ],
    },
];
const CHRYZA_VARIETY_TABLES = [
    {
        title: 'КУСТОВЫЕ по 220',
        columns: [
            ['Santini'],
        ],
    },
    {
        title: 'КУСТОВЫЕ по 250',
        columns: [
            ['Kalimba', 'Altay'],
        ],
    },
    {
        title: 'КУСТОВЫЕ по 300',
        columns: [
            ['Newton', 'Pastella Rose'],
        ],
    },
    {
        title: 'ОДНОГОЛОВЫЕ по 290',
        columns: [
            ['Magnum', 'вся одноголовая'],
        ],
    },
];
const PEONY_VARIETY_TABLES = [
    {
        title: 'ПИОНЫ по 590',
        columns: [
            ['Coral Charm', 'Sarah Bernhardt'],
        ],
    },
];
function getAllowedFlowerFilters(section) {
    return section === 'sezonnye' ? SEASONAL_FLOWER_FILTER_ORDER : PRIMARY_FLOWER_FILTER_ORDER;
}
function loadStoredFlowerFilters() {
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(FLOWER_FILTER_STORAGE_KEY);
        if (!raw)
            return {};
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function getInitialFlowerFilter(section) {
    const stored = loadStoredFlowerFilters()[section];
    return stored && getAllowedFlowerFilters(section).includes(stored) ? stored : 'all';
}
function loadStoredPriceMatrixState() {
    const allowedCategories = ['rose', 'carnation', 'chryza', 'alstroemerii', 'hydrangea', 'gypsophila', 'tanacetum', 'tulip', 'peony'];
    if (typeof window === 'undefined') {
        return { selectedPriceTableId: '', mobilePriceMatrixCategory: 'rose', priceTableSection: 'osnovnye' };
    }
    try {
        const raw = window.localStorage.getItem(PRICE_MATRIX_STORAGE_KEY);
        if (!raw) {
            return { selectedPriceTableId: '', mobilePriceMatrixCategory: 'rose', priceTableSection: 'osnovnye' };
        }
        const parsed = JSON.parse(raw);
        const mobileCategory = parsed.mobilePriceMatrixCategory;
        return {
            selectedPriceTableId: typeof parsed.selectedPriceTableId === 'string' ? parsed.selectedPriceTableId : '',
            mobilePriceMatrixCategory: allowedCategories.includes(mobileCategory)
                ? mobileCategory
                : 'rose',
            priceTableSection: parsed.priceTableSection === 'sezonnye' ? 'sezonnye' : 'osnovnye',
        };
    }
    catch {
        return { selectedPriceTableId: '', mobilePriceMatrixCategory: 'rose', priceTableSection: 'osnovnye' };
    }
}
function loadStoredMobileOpenCategories() {
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(MOBILE_OPEN_CATEGORY_STORAGE_KEY);
        if (!raw)
            return {};
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
const activeFlowerFilter = ref(getInitialFlowerFilter(store.activeSection));
const MAIN_ORDER = [
    '\u0420\u041e\u0417\u042b \u043f\u043e 150',
    '\u0420\u041e\u0417\u042b \u043f\u043e 200',
    '\u0420\u041e\u0417\u042b \u043f\u043e 250',
    '\u0420\u041e\u0417\u042b \u043f\u043e 300',
    '\u0420\u041e\u0417\u042b \u043f\u043e 400',
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
    '\u0422\u0410\u041d\u0410\u0426\u0415\u0422\u0423\u041c',
];
const MAIN_ORDER_INDEX = new Map(MAIN_ORDER.map((name, index) => [name, index]));
function getMainOrderIndex(item) {
    if (isCarnationMix(item))
        return 5.5;
    return MAIN_ORDER_INDEX.get(item.flowerName.trim()) ?? Number.MAX_SAFE_INTEGER;
}
const ROSE_150_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
    4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
    6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
    9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
    11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
    14,
];
const ROSE_250_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
    4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
    6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
    9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
    11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
    14,
];
const ROSE_300_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
    4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
    6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
    9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
    11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
    14,
];
const CARNATION_COMMON_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 0, 2, 2, 2, 3, 3, 3,
    3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
    6, 6, 6, 6, 7, 7, 7, 7, 8, 8,
    8, 8, 9, 9, 9, 9, 10, 10, 10, 10,
    11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
    13,
];
const CARNATION_MOON_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 0, 2, 2, 2, 3, 3, 3,
    3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
    6, 6, 6, 6, 7, 7, 7, 7, 8, 8,
    8, 8, 9, 9, 9, 9, 10, 10, 10, 10,
    11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
    13,
];
const CARNATION_MIX_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
    3, 4, 4, 4, 4, 5, 5, 5, 5, 6,
    6, 6, 6, 7, 7, 7, 7, 8, 8, 8,
    8, 9, 9, 9, 9, 10, 10, 10, 10, 11,
    11, 11, 11, 12, 12, 12, 12, 13, 13, 13,
];
const ALSTROMERII_PISTACHIO_QTY_BY_ODD = [
    0, 1, 1, 1, 2, 2, 3, 3, 3, 4,
    4, 4, 5, 5, 5, 5, 6, 6, 6, 6,
    7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
    9, 9, 10, 10, 10, 10, 11, 11, 11, 11,
    12, 12, 12, 12, 13, 13, 13, 14, 14, 14,
    15,
];
const HYDRANGEA_PISTACHIO_QTY_BY_ODD = [
    0, 2, 3, 4, 4, 5, 5, 6, 6, 7,
    7, 8, 8, 9, 9, 10, 10, 10, 10, 10,
    11, 11, 11, 11, 11, 12, 12, 12, 12, 12,
    13, 13, 13, 13, 13, 14, 14, 14, 14, 14,
    15, 15, 15, 15, 15, 16, 16, 16, 16, 16,
    17,
];
const CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD = [
    0, 1, 2, 3, 3, 4, 4, 5, 5, 5,
    6, 6, 6, 7, 7, 7, 8, 8, 8, 8,
    8, 9, 9, 9, 9, 9, 10, 10, 10, 10,
    10, 11, 11, 11, 11, 11, 12, 12, 12, 12,
    12, 13, 13, 13, 13, 13, 14, 14, 14, 14,
    14,
];
const PEONY_PISTACHIO_QTY_BY_ODD = [
    0, 0, 0, 2, 2, 2, 3, 3, 3, 3,
    4, 4, 4, 4, 5, 5, 5, 5, 6, 6,
    6, 6, 7, 7, 7, 7, 8, 8, 8, 8,
    9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
    11, 11, 12, 12, 12, 12, 13, 13, 13, 13,
    14,
];
const PISTACHIO_UNIT_PRICE = 80;
const ODD_PISTACHIO_PACKAGING_ADJUSTMENT = 40;
const ROSE_EXTRA_PISTACHIO_QTY_START = 21;
const ALSTROMERII_EXTRA_PISTACHIO_QTY_AFTER = 19;
const CHRYZA_SINGLE_PACKAGING_DISCOUNT_START = 5;
const CHRYZA_SINGLE_PACKAGING_DISCOUNT = 100;
const CHRYZA_SINGLE_EXTRA_PACKAGING_DISCOUNT_START = 15;
const CHRYZA_SINGLE_EXTRA_PACKAGING_DISCOUNT = 100;
const CHRYZA_SINGLE_PACKAGING_OVERRIDES = {
    13: 360,
};
const ROSE_200_PACKAGING_DISCOUNT_START = 5;
const ROSE_200_PACKAGING_DISCOUNT = 100;
function getArrayValue(values, idx, fallback = 0) {
    return values[idx] ?? values[values.length - 1] ?? fallback;
}
function getAdjustedPistachioQty(qty) {
    return qty > 0 ? Math.ceil(qty / 2) : 0;
}
function getAdjustedPackagingPrice(packagingPrice, oldPistachioQty) {
    if (oldPistachioQty > 0 && oldPistachioQty % 2 === 1) {
        return Math.max(0, packagingPrice - ODD_PISTACHIO_PACKAGING_ADJUSTMENT);
    }
    return packagingPrice;
}
function shouldAddExtraRosePistachio(qty) {
    return toOdd(qty) >= ROSE_EXTRA_PISTACHIO_QTY_START;
}
function getRosePistachioQty(oldPistachioQty, qty) {
    const adjustedQty = getAdjustedPistachioQty(oldPistachioQty);
    return shouldAddExtraRosePistachio(qty) ? adjustedQty + 1 : adjustedQty;
}
function getRosePackagingPrice(packagingPrice, oldPistachioQty, qty) {
    const adjustedPrice = getAdjustedPackagingPrice(packagingPrice, oldPistachioQty);
    if (shouldAddExtraRosePistachio(qty)) {
        return Math.max(0, adjustedPrice - PISTACHIO_UNIT_PRICE);
    }
    return adjustedPrice;
}
function getRose200PackagingPrice(packagingPrice, oldPistachioQty, qty) {
    const adjustedPrice = getRosePackagingPrice(packagingPrice, oldPistachioQty, qty);
    if (toOdd(qty) >= ROSE_200_PACKAGING_DISCOUNT_START) {
        return Math.max(0, adjustedPrice - ROSE_200_PACKAGING_DISCOUNT);
    }
    return adjustedPrice;
}
function shouldAddExtraAlstroemeriiPistachio(qty) {
    return toOdd(qty) >= ALSTROMERII_EXTRA_PISTACHIO_QTY_AFTER;
}
function getAlstroemeriiPistachioQty(oldPistachioQty, qty) {
    const adjustedQty = getAdjustedPistachioQty(oldPistachioQty);
    return shouldAddExtraAlstroemeriiPistachio(qty) ? adjustedQty + 1 : adjustedQty;
}
function getAlstroemeriiPackagingPrice(packagingPrice, oldPistachioQty, qty) {
    const adjustedPrice = getAdjustedPackagingPrice(packagingPrice, oldPistachioQty);
    if (shouldAddExtraAlstroemeriiPistachio(qty)) {
        return Math.max(0, adjustedPrice - PISTACHIO_UNIT_PRICE);
    }
    return adjustedPrice;
}
function isChryzaSingleSpecialPistachioQty(qty) {
    const normalizedQty = toOdd(qty);
    return normalizedQty === 7 || normalizedQty === 9;
}
function getChryzaSinglePistachioQty(oldPistachioQty, qty) {
    if (isChryzaSingleSpecialPistachioQty(qty)) {
        return 1;
    }
    return getAdjustedPistachioQty(oldPistachioQty);
}
function getChryzaSinglePackagingPrice(packagingPrice, oldPistachioQty, qty) {
    const normalizedQty = toOdd(qty);
    const overridePrice = CHRYZA_SINGLE_PACKAGING_OVERRIDES[normalizedQty];
    if (overridePrice !== undefined) {
        return overridePrice;
    }
    let adjustedPrice = getAdjustedPackagingPrice(packagingPrice, oldPistachioQty);
    if (normalizedQty >= CHRYZA_SINGLE_PACKAGING_DISCOUNT_START) {
        adjustedPrice = Math.max(0, adjustedPrice - CHRYZA_SINGLE_PACKAGING_DISCOUNT);
    }
    if (normalizedQty >= CHRYZA_SINGLE_EXTRA_PACKAGING_DISCOUNT_START) {
        adjustedPrice = Math.max(0, adjustedPrice - CHRYZA_SINGLE_EXTRA_PACKAGING_DISCOUNT);
    }
    if (!isChryzaSingleSpecialPistachioQty(normalizedQty)) {
        return adjustedPrice;
    }
    const currentPistachioCost = getAdjustedPistachioQty(oldPistachioQty) * PISTACHIO_UNIT_PRICE;
    const nextPistachioCost = getChryzaSinglePistachioQty(oldPistachioQty, normalizedQty) * PISTACHIO_UNIT_PRICE;
    return Math.max(0, adjustedPrice + (currentPistachioCost - nextPistachioCost));
}
const ROSE_150_PACKAGING_BY_ODD = [
    140, 140, 240, 260, 260, 360, 420, 520, 520, 620,
    680, 680, 680, 680, 740, 740, 740, 840, 800, 800,
    800, 800, 860, 860, 860, 860, 920, 920, 920, 920,
    980, 980, 980, 980, 1040, 1040, 1040, 1040, 1000, 1000,
    1000, 1000, 1160, 1160, 1160, 1160, 1120, 1120, 1120, 1120,
    1180,
];
const ROSE_300_PACKAGING_BY_ODD = [
    190, 190, 290, 310, 310, 310, 370, 570, 570, 670,
    630, 730, 730, 730, 790, 790, 790, 890, 850, 850,
    850, 850, 1010, 1010, 1010, 1010, 970, 970, 970, 970,
    1030, 1030, 1030, 1030, 1090, 1090, 1090, 1090, 1050, 1050,
    1050, 1050, 1110, 1110, 1110, 1110, 1070, 1070, 1070, 1070,
    1130,
];
const ALSTROMERII_PACKAGING_BY_ODD = [
    190, 150, 250, 250, 310, 310, 270, 370, 370, 430,
    430, 530, 490, 490, 490, 590, 550, 550, 650, 650,
    610, 710, 710, 710, 770, 770, 770, 870, 930, 930,
    930, 930, 990, 990, 990, 990, 1050, 1050, 1050, 1050,
    1110, 1110, 1110, 1110, 1170, 1170, 1170, 1230, 1230, 1230,
    1290,
];
const CARNATION_COMMON_PACKAGING_BY_ODD = [
    90, 190, 190, 190, 210, 210, 210, 270, 270, 270,
    270, 370, 330, 330, 330, 330, 390, 490, 490, 490,
    450, 450, 550, 610, 610, 610, 710, 570, 570, 570,
    570, 730, 730, 730, 730, 690, 690, 690, 690, 750,
    750, 750, 750, 810, 810, 810, 810, 770, 770, 770,
];
const CARNATION_MOON_PACKAGING_BY_ODD = [
    120, 160, 200, 180, 240, 280, 220, 320, 260, 300,
    340, 380, 380, 420, 360, 400, 500, 540, 580, 520,
    520, 560, 600, 640, 640, 680, 620, 660, 660, 700,
    640, 680, 680, 720, 660, 700, 800, 740, 780, 820,
    720, 760, 800, 840, 840, 880, 920, 960, 960, 900,
    940,
];
const CARNATION_MIX_PACKAGING_BY_ODD = [
    160, 130, 200, 190, 260, 230, 360, 230, 300, 370,
    340, 370, 340, 410, 380, 410, 480, 450, 420, 450,
    520, 590, 560, 690, 660, 630, 700, 630, 700, 670,
    640, 670, 640, 710, 680, 810, 780, 750, 820, 750,
    820, 790, 760, 890, 860, 930, 900, 930, 900, 970,
];
const HYDRANGEA_PACKAGING_BY_ODD = [
    200, 240, 320, 400, 520, 600, 720, 800, 920, 1100,
    1120, 1200, 1320, 1400, 1520, 1600, 1720, 1840, 1860, 1880,
    1960, 1880, 1900, 1920, 1940, 1920, 1940, 1960, 1980, 2900,
    1980, 2900, 2920, 2940, 2960, 2940, 2960, 2980, 3900, 3920,
    3900, 3920, 3940, 3960, 3980, 3960, 3980, 4900, 4920, 4940,
    4920,
];
const PEONY_PACKAGING_BY_ODD = [
    160, 220, 240, 380, 400, 420, 500, 620, 740, 760,
    840, 960, 980, 1000, 1080, 1100, 1120, 1140, 1220, 1340,
    1360, 1380, 1460, 1480, 1500, 1520, 1500, 1520, 1540, 1560,
    1640, 1660, 1680, 1700, 1780, 1800, 1820, 1840, 1820, 1840,
    1860, 1880, 1860, 1880, 1900, 1920, 1900, 1920, 1940, 1960,
    1940,
];
const TULIP_PACKAGING_BY_ODD = [
    130, 230, 290, 250, 310, 270, 330, 390, 350, 410,
    470, 530, 590, 550, 610, 670, 730, 790, 750, 810,
    870, 830, 890, 850, 910, 970, 930, 990, 950, 1010,
    1070, 1030, 1090, 1050, 1110, 1170, 1130, 1190, 1150, 1210,
    1270, 1230, 1290, 1250, 1310, 1370, 1330, 1390, 1350, 1410,
    1470,
];
const CHRYZA_SINGLE_PACKAGING_BY_ODD = [
    100, 180, 260, 340, 360, 440, 560, 640, 660, 680,
    660, 680, 800, 880, 1000, 1020, 1000, 1020, 1040, 1060,
    1080, 1160, 1180, 1200, 1220, 1240, 1220, 1240, 1260, 1280,
    1300, 1380, 1300, 1320, 1340, 1360, 1340, 1360, 1380, 1400,
    1420, 1400, 1420, 1440, 1460, 1480, 1560, 1580, 1600, 1620,
    1640,
];
const CHRYZA_BUSH_250_PACKAGING_BY_ODD = [
    140, 240, 240, 240, 340, 340, 340, 440, 440, 440,
    540, 540, 640, 640, 740, 740, 740, 840, 840, 840,
    940, 940, 940, 1040, 1040, 1040, 1140, 1140, 1140, 1140,
    1240, 1240, 1240, 1240, 1240, 1340, 1340, 1340, 1340, 1340,
    1440, 1440, 1440, 1440, 1440, 1540, 1540, 1540, 1540, 1540,
    1640,
];
const CHRYZA_BUSH_220_PACKAGING_BY_ODD = [
    130, 130, 190, 250, 210, 270, 330, 390, 350, 410,
    470, 530, 590, 550, 610, 670, 630, 690, 650, 710,
    670, 730, 790, 850, 910, 870, 930, 990, 950, 1010,
    980, 1030, 1090, 1050, 1110, 1070, 1130, 1190, 1150, 1210,
    1170, 1230, 1290, 1250, 1310, 1270, 1330, 1390, 1350, 1410,
    1370,
];
const GYPSOPHILA_COMPOSITION_PACKAGING_BY_QTY = {
    1: 800,
    3: 1090,
    5: 990,
    7: 1090,
    25: 1690,
};
const GYPSOPHILA_COMPOSITION_LABELS = {
    1: 'стак.',
    3: '10',
    5: '13',
    7: '15',
    25: '20',
};
const GYPSOPHILA_PACKAGING_BY_ODD = [
    90, 190, 190, 190, 290, 390, 390, 390, 490, 490,
    590, 590, 690, 690, 790, 790, 890, 890, 890, 890,
    890, 890, 890, 990, 990, 990, 990, 1090, 1090, 1090,
    1090, 1190, 1190, 1190, 1190, 1190, 1290, 1290, 1290, 1290,
    1290, 1390, 1390, 1390, 1390, 1390, 1490, 1490, 1490, 1490,
    1590,
];
const TANACETUM_PACKAGING_BY_ODD = [
    100, 120, 200, 260, 280, 300, 320, 440, 560, 580,
    600, 620, 640, 660, 680, 700, 720, 740, 760, 780,
    800, 820, 840, 860, 880, 900, 920, 940, 960, 980,
    1000, 1020, 1040, 1060, 1080, 2000, 2020, 2040, 2060, 2080,
    2100, 2120, 2140, 2160, 2180, 2200, 2220, 2240, 2260, 2280,
    2300,
];
const CHRYZA_BUSH_300_PACKAGING_BY_ODD = [
    190, 190, 290, 290, 290, 390, 390, 490, 490, 590,
    590, 690, 690, 790, 790, 890, 890, 890, 990, 990,
    990, 1090, 1090, 1090, 1090, 1190, 1190, 1190, 1190, 1190,
    1290, 1290, 1290, 1290, 1290, 1390, 1390, 1390, 1390, 1390,
    1490, 1490, 1490, 1490, 1490, 1590, 1590, 1590, 1590, 1590,
    1690,
];
const SECTION_ORDER = ['osnovnye', 'sezonnye'];
function compareFlowers(a, b) {
    if (a.section !== b.section) {
        return SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
    }
    if (a.section === 'osnovnye' && b.section === 'osnovnye') {
        if (isTanacetum(a) !== isTanacetum(b)) {
            return isTanacetum(a) ? 1 : -1;
        }
        const ai = getMainOrderIndex(a);
        const bi = getMainOrderIndex(b);
        if (ai !== bi)
            return ai - bi;
    }
    return a.flowerName.localeCompare(b.flowerName, 'ru');
}
function matchesFlowerFilter(item, filter) {
    return filter === 'all' || getFlowerGroup(item) === filter;
}
function shouldShowRoseVarieties() {
    return store.activeSection === 'osnovnye' && activeFlowerFilter.value === 'rose';
}
function shouldShowChryzaVarieties() {
    return store.activeSection === 'osnovnye' && activeFlowerFilter.value === 'chryza';
}
function shouldShowPeonyVarieties() {
    return store.activeSection === 'sezonnye' && activeFlowerFilter.value === 'peony';
}
function getVarietyRowCount(table) {
    return Math.max(...table.columns.map((column) => column.length));
}
function getRoseVarietyTable(item) {
    if (getFlowerGroup(item) !== 'rose') {
        return null;
    }
    return ROSE_VARIETY_TABLES.find((table) => table.title === item.flowerName.trim()) ?? null;
}
function getChryzaVarietyTable(item) {
    if (item.id === CHRYZA_BUSH_220_ID) {
        return CHRYZA_VARIETY_TABLES[0];
    }
    if (item.id === CHRYZA_BUSH_250_ID) {
        return CHRYZA_VARIETY_TABLES[1];
    }
    if (item.id === CHRYZA_BUSH_300_ID) {
        return CHRYZA_VARIETY_TABLES[2];
    }
    if (item.id === CHRYZA_SINGLE_ID) {
        return CHRYZA_VARIETY_TABLES[3];
    }
    return null;
}
function getPeonyVarietyTable(item) {
    return item.flowerName.trim() === PEONY_VARIETY_TABLES[0].title ? PEONY_VARIETY_TABLES[0] : null;
}
function getPriceMatrixVarietyTable(item) {
    return getRoseVarietyTable(item) ?? getChryzaVarietyTable(item) ?? getPeonyVarietyTable(item);
}
const visibleRows = computed(() => [...store.filteredBySection]
    .filter((item) => matchesFlowerFilter(item, activeFlowerFilter.value))
    .sort(compareFlowers));
const flowerFilterTabs = computed(() => {
    const order = getAllowedFlowerFilters(store.activeSection);
    return order.map((key) => ({
        key,
        label: FLOWER_FILTER_LABELS[key],
    }));
});
const initialPriceMatrixState = loadStoredPriceMatrixState();
const selectedPriceTableId = ref(initialPriceMatrixState.selectedPriceTableId);
const priceTableSection = ref(initialPriceMatrixState.priceTableSection);
const priceTableGroups = computed(() => [...store.flowers]
    .filter((item) => item.section === priceTableSection.value)
    .sort(compareFlowers)
    .map((item) => ({
    item,
    rows: getPriceTableRows(item),
})));
const activePriceTableGroup = computed(() => {
    const groups = priceTableGroups.value;
    if (!groups.length) {
        return null;
    }
    return groups.find((group) => group.item.id === selectedPriceTableId.value) ?? groups[0];
});
const activePriceMatrixVarietyTable = computed(() => (activePriceTableGroup.value ? getPriceMatrixVarietyTable(activePriceTableGroup.value.item) : null));
const MOBILE_PRICE_MATRIX_CATEGORY_ORDER = [
    'rose',
    'carnation',
    'chryza',
    'alstroemerii',
    'hydrangea',
    'gypsophila',
    'tanacetum',
    'tulip',
    'peony',
];
const mobilePriceMatrixCategoryOrder = computed(() => (priceTableSection.value === 'sezonnye'
    ? ['peony', 'tulip']
    : ['rose', 'carnation', 'chryza', 'alstroemerii', 'hydrangea', 'gypsophila', 'tanacetum']));
const mobilePriceMatrixCategory = ref(initialPriceMatrixState.mobilePriceMatrixCategory);
const PRICE_MATRIX_TAB_ROWS = {
    osnovnye: [
        ['РОЗЫ по 150', 'РОЗЫ по 200', 'РОЗЫ по 250', 'РОЗЫ по 300', 'РОЗЫ по 400', null, 'ГВОЗДИКИ - обычные', 'ГВОЗДИКИ - лунные', 'ГВОЗДИКИ - микс'],
        ['ХРИЗА - одноголовая', null, 'ХРИЗА - кустовая по 220', 'ХРИЗА - кустовая по 250', 'ХРИЗА - кустовая по 300', null, 'ТАНАЦЕТУМ', null, 'ГОРТЕНЗИИ'],
        ['АЛЬСТРОМЕРИИ', null, 'ГИПСОФИЛА - букеты', 'ГИПСОФИЛА - композ.'],
    ],
    sezonnye: [
        ['ПИОНЫ по 590', 'ПИОНЫ по 690', 'ПИОНЫ по 790', null, 'ТЮЛЬПАНЫ по 220'],
    ],
};
function normalizePriceMatrixTabName(name) {
    const normalized = name.trim();
    if (normalized === 'ГИПСОФИЛА - композ.') {
        return 'ГИПСОФИЛА - композиции';
    }
    return normalized;
}
const priceMatrixTabRows = computed(() => {
    const groupMap = new Map(priceTableGroups.value.map((group) => [normalizePriceMatrixTabName(group.item.flowerName), group]));
    return PRICE_MATRIX_TAB_ROWS[priceTableSection.value].map((row) => row
        .map((name) => {
        if (name === null) {
            return { type: 'spacer' };
        }
        const group = groupMap.get(normalizePriceMatrixTabName(name));
        return group ? { type: 'item', group } : null;
    })
        .filter((entry) => entry !== null));
});
function getPriceMatrixCategoryKey(item) {
    const group = getFlowerGroup(item);
    return MOBILE_PRICE_MATRIX_CATEGORY_ORDER.includes(group)
        ? group
        : null;
}
const mobilePriceMatrixCategories = computed(() => mobilePriceMatrixCategoryOrder.value
    .map((key) => ({
    key,
    label: FLOWER_FILTER_LABELS[key],
    items: priceTableGroups.value.filter((group) => getFlowerGroup(group.item) === key),
}))
    .filter((category) => category.items.length > 0));
const mobileActivePriceMatrixCategory = computed(() => {
    const availableKeys = mobilePriceMatrixCategories.value.map((category) => category.key);
    if (!availableKeys.length) {
        return null;
    }
    if (availableKeys.includes(mobilePriceMatrixCategory.value)) {
        return mobilePriceMatrixCategory.value;
    }
    return availableKeys[0] ?? null;
});
const mobilePriceMatrixSubtabs = computed(() => {
    const key = mobileActivePriceMatrixCategory.value;
    if (!key) {
        return [];
    }
    return priceTableGroups.value.filter((group) => getFlowerGroup(group.item) === key);
});
const mobilePriceMatrixHasSubtabs = computed(() => mobilePriceMatrixSubtabs.value.length > 1);
const activePriceTableHidesPistachio = computed(() => {
    const item = activePriceTableGroup.value?.item;
    if (!item) {
        return false;
    }
    return hidesMobilePistachio(item) || isPistachioLocked(item);
});
function selectMobilePriceMatrixCategory(key) {
    mobilePriceMatrixCategory.value = key;
    const firstGroup = priceTableGroups.value.find((group) => getFlowerGroup(group.item) === key);
    if (firstGroup) {
        selectPriceTableGroup(firstGroup);
    }
}
function getFirstPriceTableGroupByCategory(key) {
    if (key === 'all') {
        return null;
    }
    return priceTableGroups.value.find((group) => getFlowerGroup(group.item) === key) ?? null;
}
function selectPriceTableGroup(group) {
    selectedPriceTableId.value = group.item.id;
    const category = getPriceMatrixCategoryKey(group.item);
    if (category) {
        mobilePriceMatrixCategory.value = category;
    }
}
function selectLinkedPriceTableGroup(filter) {
    const linkedGroup = getFirstPriceTableGroupByCategory(filter);
    if (!linkedGroup) {
        return false;
    }
    selectPriceTableGroup(linkedGroup);
    return true;
}
function getLinkedFlowerFilterForSection(section) {
    if (section === 'priceTables') {
        return 'all';
    }
    const group = activePriceTableGroup.value ? getPriceMatrixCategoryKey(activePriceTableGroup.value.item) : null;
    return group && getAllowedFlowerFilters(section).includes(group) ? group : getInitialFlowerFilter(section);
}
const mobileSectionDefinitions = computed(() => {
    if (store.activeSection === 'osnovnye') {
        return MOBILE_PRIMARY_CATEGORY_ORDER.map((key) => ({
            key,
            label: MOBILE_PRIMARY_CATEGORY_LABELS[key],
            matcher: (item) => getFlowerGroup(item) === key,
        }));
    }
    return MOBILE_SEASONAL_CATEGORY_ORDER.map((key) => ({
        key,
        label: key === 'peony' ? uiLabels.peonies : uiLabels.tulips,
        matcher: (item) => getFlowerGroup(item) === key,
    }));
});
const mobileCardSections = computed(() => mobileSectionDefinitions.value
    .map((section) => ({
    key: section.key,
    label: section.label,
    items: visibleRows.value.filter(section.matcher),
    collapsible: true,
}))
    .filter((section) => section.items.length > 0));
function getMobileOpenCategoryKey() {
    const firstSection = mobileCardSections.value[0];
    if (!firstSection) {
        return null;
    }
    if (mobileOpenCategory.value === null) {
        return null;
    }
    return mobileCardSections.value.some((section) => section.key === mobileOpenCategory.value)
        ? mobileOpenCategory.value
        : firstSection.key;
}
function isMobileCategoryOpen(key) {
    return getMobileOpenCategoryKey() === key;
}
function selectMobileCategory(key) {
    const shouldOpen = !isMobileCategoryOpen(key);
    mobileOpenCategory.value = shouldOpen ? key : null;
    if (!shouldOpen || typeof window === 'undefined' || window.innerWidth > 760) {
        return;
    }
    void nextTick(() => {
        const section = document.querySelector('[data-mobile-section="' + key + '"]');
        if (!section) {
            return;
        }
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}
function getFlowerGroup(item) {
    if (isChryzaSingle(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item))
        return 'chryza';
    if (isRose150(item) || isRose200(item) || isRose250(item) || isRose300(item) || isRose400(item))
        return 'rose';
    if (isAlstroemerii(item))
        return 'alstroemerii';
    if (isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item))
        return 'carnation';
    if (isTanacetum(item))
        return 'tanacetum';
    if (isHydrangea(item))
        return 'hydrangea';
    if (isGypsophila(item) || isGypsophilaComposition(item))
        return 'gypsophila';
    if (isPeonies(item))
        return 'peony';
    if (isTulips(item))
        return 'tulip';
    return item.flowerName.trim().toLowerCase();
}
function isGroupStart(item, index) {
    if (index === 0) {
        return false;
    }
    const previous = visibleRows.value[index - 1];
    if (!previous) {
        return false;
    }
    if (isChryzaBush300(previous) && isChryzaSingle(item)) {
        return true;
    }
    return getFlowerGroup(previous) !== getFlowerGroup(item);
}
function getMinQty(item) {
    return isCarnationMix(item) ? 3 : 1;
}
function getMaxQty(item) {
    return 101;
}
function normalizeQty(item, value) {
    if (isGypsophilaComposition(item)) {
        const options = item.popularSizes;
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return options[0] ?? 1;
        }
        let nearest = options[0] ?? 1;
        let nearestDistance = Math.abs(nearest - numeric);
        for (const option of options) {
            const distance = Math.abs(option - numeric);
            if (distance < nearestDistance) {
                nearest = option;
                nearestDistance = distance;
            }
        }
        return nearest;
    }
    const odd = toOdd(value);
    const min = getMinQty(item);
    const max = getMaxQty(item);
    if (odd < min)
        return min;
    if (odd > max)
        return max;
    return odd;
}
function getQtyOptions(item) {
    if (isGypsophilaComposition(item))
        return item.popularSizes;
    if (isCarnationMix(item))
        return oddOptions.slice(1);
    return isHydrangea(item) || isChryzaSingle(item) ? hydrangeaOddOptions : oddOptions;
}
function getQty(item) {
    if (!qtyMap[item.id]) {
        qtyMap[item.id] = getMinQty(item);
    }
    qtyMap[item.id] = normalizeQty(item, qtyMap[item.id]);
    return qtyMap[item.id];
}
function hasQtySelection(item) {
    return Boolean(qtyInputMap[item.id]?.trim())
        || Boolean(sizeButtonSelectionMap[item.id])
        || Boolean(suggestedSelectionMap[item.id]);
}
function isRose150(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('150');
}
function isRose200(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('200');
}
function isRose250(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('250');
}
function isRose300(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('300');
}
function isRose400(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('400');
}
function isAlstroemerii(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('\u0430\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438');
}
function isCarnationCommon(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('\u0433\u0432\u043e\u0437\u0434\u0438\u043a\u0438 - \u043e\u0431\u044b\u0447\u043d\u044b\u0435');
}
function isCarnationMoon(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('\u0433\u0432\u043e\u0437\u0434\u0438\u043a\u0438 - \u043b\u0443\u043d\u043d\u044b\u0435');
}
function isCarnationMix(item) {
    return item.id === CARNATION_MIX_ID;
}
function isPeonies(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('\u043f\u0438\u043e\u043d\u044b');
}
function isTulips(item) {
    return item.id === '327eb882-6a93-45c5-bb20-8a53b19bc27e';
}
function isHydrangea(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('\u0433\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438');
}
function isGypsophila(item) {
    return item.id === GYPSOPHILA_ID;
}
function isGypsophilaComposition(item) {
    return item.id === GYPSOPHILA_COMPOSITION_ID;
}
function isTanacetum(item) {
    return item.id === TANACETUM_ID || item.flowerName.trim().toLowerCase().includes('\u0442\u0430\u043d\u0430\u0446\u0435\u0442\u0443\u043c');
}
function isPromoDisabledForQty(item, qty) {
    return isGypsophilaComposition(item) && [1, 3, 5].includes(qty);
}
function isPackagingHidden(item) {
    return isGypsophilaComposition(item);
}
function isChryzaSingle(item) {
    return item.id === CHRYZA_SINGLE_ID;
}
function isChryzaBush220(item) {
    return item.id === CHRYZA_BUSH_220_ID;
}
function isChryzaBush250(item) {
    return item.id === CHRYZA_BUSH_250_ID;
}
function isChryzaBush300(item) {
    return item.id === CHRYZA_BUSH_300_ID;
}
function hasAutoPackagingByQty(item) {
    return isRose150(item) || isRose200(item) || isRose250(item) || isRose300(item) || isRose400(item) || isAlstroemerii(item) || isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item) || isHydrangea(item) || isGypsophila(item) || isGypsophilaComposition(item) || isTanacetum(item) || isPeonies(item) || isTulips(item) || isChryzaSingle(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item);
}
function getPackagingPrice(item, qty) {
    if (!hasAutoPackagingByQty(item)) {
        return item.packagingPrice;
    }
    if (isTanacetum(item)) {
        return getArrayValue(TANACETUM_PACKAGING_BY_ODD, Math.max(0, Math.min(50, (toOdd(qty) - 1) / 2)), item.packagingPrice);
    }
    const idx = isCarnationMix(item) ? (toOdd(qty) - 3) / 2 : (toOdd(qty) - 1) / 2;
    if (isTulips(item)) {
        return getArrayValue(TULIP_PACKAGING_BY_ODD, idx, item.packagingPrice);
    }
    if (isChryzaBush220(item)) {
        return getArrayValue(CHRYZA_BUSH_220_PACKAGING_BY_ODD, idx, item.packagingPrice);
    }
    if (isChryzaBush250(item)) {
        return getArrayValue(CHRYZA_BUSH_250_PACKAGING_BY_ODD, idx, item.packagingPrice);
    }
    if (isChryzaBush300(item)) {
        return getArrayValue(CHRYZA_BUSH_300_PACKAGING_BY_ODD, idx, item.packagingPrice);
    }
    if (isRose300(item)) {
        return getRosePackagingPrice(getArrayValue(ROSE_300_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(ROSE_300_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose400(item)) {
        return getRosePackagingPrice(getArrayValue(ROSE_300_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(ROSE_300_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose200(item)) {
        return getRose200PackagingPrice(getArrayValue(ROSE_300_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(ROSE_300_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose250(item)) {
        return getRosePackagingPrice(getArrayValue(ROSE_150_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(ROSE_250_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose150(item)) {
        return getRosePackagingPrice(getArrayValue(ROSE_150_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(ROSE_150_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isAlstroemerii(item)) {
        return getAlstroemeriiPackagingPrice(getArrayValue(ALSTROMERII_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(ALSTROMERII_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isCarnationCommon(item)) {
        return getAdjustedPackagingPrice(getArrayValue(CARNATION_COMMON_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(CARNATION_COMMON_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isCarnationMoon(item)) {
        return getAdjustedPackagingPrice(getArrayValue(CARNATION_MOON_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(CARNATION_MOON_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isCarnationMix(item)) {
        return getAdjustedPackagingPrice(getArrayValue(CARNATION_MIX_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(CARNATION_MIX_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isPeonies(item)) {
        return getAdjustedPackagingPrice(getArrayValue(PEONY_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(PEONY_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isHydrangea(item)) {
        return getAdjustedPackagingPrice(getArrayValue(HYDRANGEA_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(HYDRANGEA_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isGypsophilaComposition(item)) {
        return GYPSOPHILA_COMPOSITION_PACKAGING_BY_QTY[qty] ?? item.packagingPrice;
    }
    if (isGypsophila(item)) {
        return getArrayValue(GYPSOPHILA_PACKAGING_BY_ODD, idx, item.packagingPrice);
    }
    if (isChryzaSingle(item)) {
        return getChryzaSinglePackagingPrice(getArrayValue(CHRYZA_SINGLE_PACKAGING_BY_ODD, idx, item.packagingPrice), getArrayValue(CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    return item.packagingPrice;
}
function getPistachioQty(item, qty) {
    if (isPistachioLocked(item)) {
        return 0;
    }
    const idx = isCarnationMix(item) ? (toOdd(qty) - 3) / 2 : (toOdd(qty) - 1) / 2;
    if (isRose150(item)) {
        return getRosePistachioQty(getArrayValue(ROSE_150_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose250(item)) {
        return getRosePistachioQty(getArrayValue(ROSE_250_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose300(item)) {
        return getRosePistachioQty(getArrayValue(ROSE_300_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose400(item)) {
        return getRosePistachioQty(getArrayValue(ROSE_300_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isRose200(item)) {
        return getRosePistachioQty(getArrayValue(ROSE_300_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isCarnationCommon(item)) {
        return getAdjustedPistachioQty(getArrayValue(CARNATION_COMMON_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isCarnationMoon(item)) {
        return getAdjustedPistachioQty(getArrayValue(CARNATION_MOON_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isCarnationMix(item)) {
        return getAdjustedPistachioQty(getArrayValue(CARNATION_MIX_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isAlstroemerii(item)) {
        return getAlstroemeriiPistachioQty(getArrayValue(ALSTROMERII_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    if (isPeonies(item)) {
        return getAdjustedPistachioQty(getArrayValue(PEONY_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isHydrangea(item)) {
        return getAdjustedPistachioQty(getArrayValue(HYDRANGEA_PISTACHIO_QTY_BY_ODD, idx));
    }
    if (isChryzaSingle(item)) {
        return getChryzaSinglePistachioQty(getArrayValue(CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD, idx), qty);
    }
    return getAdjustedPistachioQty(item.pistachioQty);
}
function calcWithoutPromoForRow(item, qty) {
    const pistachioLocked = isPistachioLocked(item);
    return calcWithoutPromo({
        ...item,
        packagingPrice: getPackagingPrice(item, qty),
        hasPistachio: !pistachioLocked,
        pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
        pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    }, qty);
}
function calcWithPromoForRow(item, qty) {
    if (isPromoDisabledForQty(item, qty)) {
        return calcWithoutPromoForRow(item, qty);
    }
    const pistachioLocked = isPistachioLocked(item);
    return calcWithPromo({
        ...item,
        packagingPrice: getPackagingPrice(item, qty),
        hasPistachio: !pistachioLocked,
        pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
        pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    }, qty);
}
function chooseQty(item, value) {
    const normalized = normalizeQty(item, value);
    qtyMap[item.id] = normalized;
    qtyInputMap[item.id] = String(normalized);
    suggestedSelectionMap[item.id] = '';
    sizeButtonSelectionMap[item.id] = false;
    activeRowId.value = item.id;
}
function resetQty(item) {
    qtyMap[item.id] = getMinQty(item);
    qtyInputMap[item.id] = '';
    suggestedSelectionMap[item.id] = '';
    sizeButtonSelectionMap[item.id] = false;
    activeRowId.value = item.id;
}
function resetTargetPrice(item) {
    targetPriceMap[item.id] = '';
    suggestedSelectionMap[item.id] = '';
    activeRowId.value = item.id;
}
function chooseSize(item, size) {
    const normalized = normalizeQty(item, size);
    qtyMap[item.id] = normalized;
    qtyInputMap[item.id] = String(normalized);
    suggestedSelectionMap[item.id] = '';
    sizeButtonSelectionMap[item.id] = true;
    activeRowId.value = item.id;
}
function getTargetPriceValue(item) {
    return targetPriceMap[item.id] ?? '';
}
function updateTargetPrice(item, value) {
    targetPriceMap[item.id] = value;
    suggestedSelectionMap[item.id] = '';
    activeRowId.value = item.id;
}
function getQtyInputValue(item) {
    return qtyInputMap[item.id] ?? '';
}
function updateQtyInput(item, value) {
    qtyInputMap[item.id] = value;
    if (!value.trim()) {
        qtyMap[item.id] = getMinQty(item);
        suggestedSelectionMap[item.id] = '';
        sizeButtonSelectionMap[item.id] = false;
        activeRowId.value = item.id;
        return;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        qtyMap[item.id] = normalizeQty(item, parsed);
        suggestedSelectionMap[item.id] = '';
        sizeButtonSelectionMap[item.id] = false;
    }
    activeRowId.value = item.id;
}
function commitQtyInput(item) {
    const rawValue = getQtyInputValue(item).trim();
    if (!rawValue) {
        qtyMap[item.id] = getMinQty(item);
        qtyInputMap[item.id] = '';
        suggestedSelectionMap[item.id] = '';
        sizeButtonSelectionMap[item.id] = false;
        activeRowId.value = item.id;
        return;
    }
    chooseQty(item, Number(rawValue));
}
function chooseSuggestedQty(item, option, side) {
    if (!option)
        return;
    const normalized = normalizeQty(item, option.qty);
    qtyMap[item.id] = normalized;
    qtyInputMap[item.id] = String(normalized);
    suggestedSelectionMap[item.id] = side;
    sizeButtonSelectionMap[item.id] = false;
    activeRowId.value = item.id;
}
function getPriceSelectionOptions(item) {
    const options = getQtyOptions(item)
        .map((qty) => ({ qty, price: Math.round(calcWithoutPromoForRow(item, qty)) }))
        .filter((option) => Number.isFinite(option.price));
    const unique = new Map();
    for (const option of options) {
        if (!unique.has(option.price)) {
            unique.set(option.price, option);
        }
    }
    return [...unique.values()].sort((a, b) => a.price - b.price);
}
function getAdjacentPrices(item) {
    const rawValue = getTargetPriceValue(item);
    const target = Number(rawValue);
    if (!rawValue || !Number.isFinite(target)) {
        return { lower: null, higher: null };
    }
    const options = getPriceSelectionOptions(item);
    let lower = null;
    let higher = null;
    for (const option of options) {
        if (option.price < target) {
            lower = option;
            continue;
        }
        if (option.price > target) {
            higher = option;
            break;
        }
    }
    return { lower, higher };
}
function formatPrice(value) {
    return String(Math.round(value));
}
function getMixQtySplit(qty) {
    return {
        primary: Math.ceil(qty / 2),
        secondary: Math.floor(qty / 2),
    };
}
function formatPriceWithRuble(value) {
    return formatPrice(value);
}
function getFlowerCostValue(item, qty) {
    const secondaryUnitPrice = Number(item.secondaryUnitPrice) || 0;
    if (secondaryUnitPrice > 0) {
        const split = getMixQtySplit(qty);
        return split.primary * item.unitPrice + split.secondary * secondaryUnitPrice;
    }
    return qty * item.unitPrice;
}
function getCompositionLabel(item, qty) {
    if (isGypsophilaComposition(item)) {
        return GYPSOPHILA_COMPOSITION_LABELS[qty] ?? '';
    }
    if (isCarnationMix(item)) {
        const split = getMixQtySplit(qty);
        return `${split.primary} + ${split.secondary} \u0448\u0442.`;
    }
    return `${qty} \u0448\u0442.`;
}
function getFlowerCostLabel(item, qty) {
    if (isGypsophilaComposition(item)) {
        const label = GYPSOPHILA_COMPOSITION_LABELS[qty] ?? qty;
        return `${label} = ${formatPriceWithRuble(calcWithoutPromoForRow(item, qty))}`;
    }
    const secondaryUnitPrice = Number(item.secondaryUnitPrice) || 0;
    if (secondaryUnitPrice > 0) {
        const split = getMixQtySplit(qty);
        return `${split.primary} x ${formatPrice(item.unitPrice)} + ${split.secondary} x ${formatPrice(secondaryUnitPrice)} = ${formatPriceWithRuble(getFlowerCostValue(item, qty))}`;
    }
    return `${qty} x ${formatPrice(item.unitPrice)} = ${formatPriceWithRuble(getFlowerCostValue(item, qty))}`;
}
function getPistachioCostValue(item, qty) {
    if (isPistachioLocked(item)) {
        return 0;
    }
    return getPistachioQty(item, qty) * PISTACHIO_UNIT_PRICE;
}
function getPistachioLabel(item, qty) {
    if (isPistachioLocked(item)) {
        return '\u2014';
    }
    const pistachioQty = getPistachioQty(item, qty);
    if (!pistachioQty) {
        return '0 (0)';
    }
    return `${formatPriceWithRuble(getPistachioCostValue(item, qty))} (${pistachioQty})`;
}
function getPromoPriceForPercent(item, qty, discountPercent) {
    if (isPromoDisabledForQty(item, qty)) {
        return calcWithoutPromoForRow(item, qty);
    }
    const pistachioLocked = isPistachioLocked(item);
    return calcWithPromo({
        ...item,
        discountPercent,
        isPromoEnabled: true,
        packagingPrice: getPackagingPrice(item, qty),
        hasPistachio: !pistachioLocked,
        pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
        pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    }, qty);
}
function getCurrentPromoLabel(item, qty) {
    if (isPromoDisabledForQty(item, qty)) {
        return '-';
    }
    if (!item.isPromoEnabled) {
        return '\u0432\u044b\u043a\u043b.';
    }
    return `${item.discountPercent}% = ${formatPriceWithRuble(getPromoPriceForPercent(item, qty, item.discountPercent))}`;
}
function getPriceTableRows(item) {
    return getQtyOptions(item).map((qty) => ({
        qty,
        withoutPromo: formatPriceWithRuble(calcWithoutPromoForRow(item, qty)),
        pistachio: getPistachioLabel(item, qty),
        packaging: isPackagingHidden(item) ? '-' : formatPriceWithRuble(getPackagingPrice(item, qty)),
        promo10: isPromoDisabledForQty(item, qty) ? '-' : formatPriceWithRuble(getPromoPriceForPercent(item, qty, 10)),
        promo15: isPromoDisabledForQty(item, qty) ? '-' : formatPriceWithRuble(getPromoPriceForPercent(item, qty, 15)),
    }));
}
function isPistachioLocked(item) {
    return isTulips(item) || isGypsophila(item) || isGypsophilaComposition(item) || isTanacetum(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item);
}
function hidesMobilePistachio(item) {
    return isTulips(item) || isGypsophila(item) || isGypsophilaComposition(item) || isTanacetum(item) || isChryzaBush220(item) || isChryzaBush250(item) || isChryzaBush300(item);
}
function usesAutoPistachioQty(item) {
    return isRose150(item) || isRose200(item) || isRose250(item) || isRose300(item) || isRose400(item) || isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item) || isAlstroemerii(item) || isHydrangea(item) || isPeonies(item) || isChryzaSingle(item);
}
function isQtyInputLocked(item) {
    return isGypsophilaComposition(item);
}
function getPopularSizeLabel(item, size) {
    if (isGypsophilaComposition(item)) {
        return GYPSOPHILA_COMPOSITION_LABELS[size] ?? String(size);
    }
    return String(size);
}
function isPopularSizeActive(item, size) {
    if (isGypsophilaComposition(item) || isHydrangea(item)) {
        return Boolean(sizeButtonSelectionMap[item.id]) && getQty(item) === size;
    }
    return getQty(item) === size;
}
function clearActiveRow() {
    activeRowId.value = '';
}
function handlePageClick(event) {
    const target = event.target;
    if (!target)
        return;
    if (target.closest('button, input, select, label, .price-table, .modal, .menu-btn, .sidebar-submenu-btn'))
        return;
    clearActiveRow();
}
function onSectionChange(section) {
    const previousSection = store.activeSection;
    const previousFlowerFilter = activeFlowerFilter.value;
    if (section === 'priceTables' && previousSection !== 'priceTables') {
        priceTableSection.value = previousSection;
    }
    store.activeSection = section;
    if (section !== 'priceTables') {
        activeFlowerFilter.value = previousSection === 'priceTables'
            ? getLinkedFlowerFilterForSection(section)
            : getInitialFlowerFilter(section);
        mobileOpenCategory.value = loadStoredMobileOpenCategories()[section] ?? null;
        return;
    }
    if (previousSection !== 'priceTables' && selectLinkedPriceTableGroup(previousFlowerFilter)) {
        return;
    }
    const storedState = loadStoredPriceMatrixState();
    selectedPriceTableId.value = storedState.selectedPriceTableId || activePriceTableGroup.value?.item.id || priceTableGroups.value[0]?.item.id || '';
}
function onPriceTablesSectionChange(section) {
    const previousSection = store.activeSection;
    const previousFlowerFilter = activeFlowerFilter.value;
    priceTableSection.value = section;
    store.activeSection = 'priceTables';
    if (previousSection === section && selectLinkedPriceTableGroup(previousFlowerFilter)) {
        return;
    }
    const firstGroup = priceTableGroups.value[0];
    if (firstGroup) {
        selectPriceTableGroup(firstGroup);
    }
}
function openCreate() {
    editorItem.value = undefined;
    editorOpen.value = true;
}
function openEdit(item) {
    editorItem.value = item;
    editorOpen.value = true;
}
async function saveEditor(item) {
    await store.upsertFlower(item);
    editorOpen.value = false;
}
async function onChooseFile() {
    await store.chooseFile();
}
watch(activeFlowerFilter, (value) => {
    if (store.activeSection === 'priceTables' || typeof window === 'undefined') {
        return;
    }
    const stored = loadStoredFlowerFilters();
    stored[store.activeSection] = value;
    window.localStorage.setItem(FLOWER_FILTER_STORAGE_KEY, JSON.stringify(stored));
});
watch([selectedPriceTableId, mobilePriceMatrixCategory, priceTableSection], ([selectedId, category, section]) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(PRICE_MATRIX_STORAGE_KEY, JSON.stringify({
        selectedPriceTableId: selectedId,
        mobilePriceMatrixCategory: category,
        priceTableSection: section,
    }));
}, { immediate: true });
watch([() => store.activeSection, mobileOpenCategory], ([section, openCategory]) => {
    if (section === 'priceTables' || typeof window === 'undefined') {
        return;
    }
    const stored = loadStoredMobileOpenCategories();
    stored[section] = openCategory;
    window.localStorage.setItem(MOBILE_OPEN_CATEGORY_STORAGE_KEY, JSON.stringify(stored));
}, { immediate: true });
watch(() => store.activeSection, (section) => {
    if (section === 'priceTables') {
        const activeGroup = activePriceTableGroup.value;
        const nextCategory = activeGroup ? getPriceMatrixCategoryKey(activeGroup.item) : mobilePriceMatrixCategories.value[0]?.key ?? null;
        if (nextCategory) {
            mobilePriceMatrixCategory.value = nextCategory;
        }
        return;
    }
    if (!getAllowedFlowerFilters(section).includes(activeFlowerFilter.value)) {
        activeFlowerFilter.value = getInitialFlowerFilter(section);
    }
    mobileOpenCategory.value = loadStoredMobileOpenCategories()[section] ?? null;
}, { immediate: true });
watch(activePriceTableGroup, (group) => {
    if (group && selectedPriceTableId.value !== group.item.id) {
        selectedPriceTableId.value = group.item.id;
    }
    const nextCategory = group ? getPriceMatrixCategoryKey(group.item) : mobilePriceMatrixCategories.value[0]?.key ?? null;
    if (nextCategory) {
        mobilePriceMatrixCategory.value = nextCategory;
    }
}, { immediate: true });
function updateViewportMode() {
    if (typeof window === 'undefined') {
        return;
    }
    isMobileViewport.value = window.innerWidth <= MOBILE_BREAKPOINT;
}
onMounted(async () => {
    await store.bootstrap();
    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
});
onBeforeUnmount(() => {
    if (typeof window === 'undefined') {
        return;
    }
    window.removeEventListener('resize', updateViewportMode);
    store.dispose();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handlePageClick) },
    ...{ class: "layout" },
});
/** @type {[typeof SidebarMenu, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(SidebarMenu, new SidebarMenu({
    ...{ 'onChange': {} },
    ...{ 'onChangePriceTablesSection': {} },
    active: (__VLS_ctx.store.activeSection),
    activePriceTablesSection: (__VLS_ctx.priceTableSection),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onChange': {} },
    ...{ 'onChangePriceTablesSection': {} },
    active: (__VLS_ctx.store.activeSection),
    activePriceTablesSection: (__VLS_ctx.priceTableSection),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onChange: (__VLS_ctx.onSectionChange)
};
const __VLS_7 = {
    onChangePriceTablesSection: (__VLS_ctx.onPriceTablesSectionChange)
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "toolbar-title" },
});
(__VLS_ctx.uiLabels.title);
(__VLS_ctx.SECTION_LABELS[__VLS_ctx.store.activeSection]);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-side" },
});
if (!__VLS_ctx.store.unlocked) {
    /** @type {[typeof AuthGate, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(AuthGate, new AuthGate({
        ...{ 'onUnlocked': {} },
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onUnlocked': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = {
        onUnlocked: (__VLS_ctx.store.setUnlocked)
    };
    var __VLS_10;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-actions" },
});
if (__VLS_ctx.store.unlocked) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onChooseFile) },
    });
    (__VLS_ctx.uiLabels.chooseJson);
}
if (__VLS_ctx.store.unlocked && __VLS_ctx.store.activeSection !== 'priceTables') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openCreate) },
    });
    (__VLS_ctx.uiLabels.addFlower);
}
if (__VLS_ctx.store.unlocked) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "status-row" },
    });
    if (__VLS_ctx.store.fileName) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.uiLabels.file);
        (__VLS_ctx.store.fileName);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.uiLabels.fileNotChosen);
    }
    if (__VLS_ctx.store.usingFallbackStorage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "warn" },
        });
        (__VLS_ctx.uiLabels.fallbackStorage);
    }
    if (__VLS_ctx.store.saveError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "error" },
        });
        (__VLS_ctx.store.saveError);
    }
}
if (__VLS_ctx.store.activeSection === 'priceTables') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "price-matrix-page" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price-matrix-tabs price-matrix-tabs-desktop" },
    });
    for (const [row, rowIndex] of __VLS_getVForSourceType((__VLS_ctx.priceMatrixTabRows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`price-matrix-row-${rowIndex}`),
            ...{ class: "price-matrix-tabs-row" },
        });
        for (const [entry, entryIndex] of __VLS_getVForSourceType((row))) {
            (entry.type === 'item' ? entry.group.item.id : `spacer-${rowIndex}-${entryIndex}`);
            if (entry.type === 'spacer') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "price-matrix-tab-spacer" },
                    'aria-hidden': "true",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.store.activeSection === 'priceTables'))
                                return;
                            if (!!(entry.type === 'spacer'))
                                return;
                            __VLS_ctx.selectedPriceTableId = entry.group.item.id;
                        } },
                    type: "button",
                    ...{ class: "price-matrix-tab" },
                    ...{ class: ({ active: __VLS_ctx.activePriceTableGroup?.item.id === entry.group.item.id }) },
                });
                (entry.group.item.flowerName);
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price-matrix-mobile-nav" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price-matrix-mobile-categories" },
        ...{ class: ({ 'with-subtabs': __VLS_ctx.mobilePriceMatrixHasSubtabs }) },
    });
    for (const [category] of __VLS_getVForSourceType((__VLS_ctx.mobilePriceMatrixCategories))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.selectMobilePriceMatrixCategory(category.key);
                } },
            key: (category.key),
            type: "button",
            ...{ class: "price-matrix-tab price-matrix-mobile-tab" },
            ...{ class: ({ active: __VLS_ctx.mobileActivePriceMatrixCategory === category.key }) },
        });
        (category.label);
    }
    if (__VLS_ctx.mobilePriceMatrixHasSubtabs) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-matrix-mobile-subtabs" },
        });
        for (const [group] of __VLS_getVForSourceType((__VLS_ctx.mobilePriceMatrixSubtabs))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(__VLS_ctx.mobilePriceMatrixHasSubtabs))
                            return;
                        __VLS_ctx.selectedPriceTableId = group.item.id;
                    } },
                key: (group.item.id),
                type: "button",
                ...{ class: "price-matrix-tab price-matrix-mobile-subtab" },
                ...{ class: ({ active: __VLS_ctx.activePriceTableGroup?.item.id === group.item.id }) },
            });
            (group.item.flowerName);
        }
    }
    if (__VLS_ctx.activePriceTableGroup) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-matrix-layout" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "price-matrix-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-matrix-card-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-matrix-card-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.activePriceTableGroup.item.flowerName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-matrix-card-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.uiLabels.flowerPrice);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "price-with-ruble" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatPriceWithRuble(__VLS_ctx.activePriceTableGroup.item.unitPrice));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "price-ruble" },
        });
        if (__VLS_ctx.isCarnationMix(__VLS_ctx.activePriceTableGroup.item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.uiLabels.flowerPrice);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-with-ruble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatPriceWithRuble(__VLS_ctx.activePriceTableGroup.item.secondaryUnitPrice || 0));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-ruble" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-wrap price-matrix-table-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
            ...{ class: "price-matrix-table" },
            ...{ class: ({ 'without-pistachio': __VLS_ctx.activePriceTableHidesPistachio }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.withoutPromo);
        if (!__VLS_ctx.activePriceTableHidesPistachio) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
            (__VLS_ctx.uiLabels.pistachio);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.packaging);
        if (__VLS_ctx.isMobileViewport) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
                value: (__VLS_ctx.mobilePriceMatrixPromo),
                ...{ class: "price-matrix-promo-select" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                value: "10",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                value: "15",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
            (__VLS_ctx.uiLabels.promo10);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
            (__VLS_ctx.uiLabels.promo15);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
        for (const [row] of __VLS_getVForSourceType((__VLS_ctx.activePriceTableGroup.rows))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (`${__VLS_ctx.activePriceTableGroup.item.id}-${row.qty}`),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.qty);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-with-ruble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (row.withoutPromo);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-ruble" },
            });
            if (!__VLS_ctx.activePriceTableHidesPistachio) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (row.pistachio);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            if (row.packaging === '-') {
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-with-ruble" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (row.packaging);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-ruble" },
                });
            }
            if (__VLS_ctx.isMobileViewport) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-with-ruble" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.mobilePriceMatrixPromo === '10' ? row.promo10 : row.promo15);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-ruble" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-with-ruble" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (row.promo10);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-ruble" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-with-ruble" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (row.promo15);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-ruble" },
                });
            }
        }
        if (__VLS_ctx.activePriceMatrixVarietyTable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "price-matrix-variety" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
                ...{ class: "rose-variety-table rose-variety-table-price-matrix" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                colspan: (__VLS_ctx.activePriceMatrixVarietyTable.columns.length),
            });
            (__VLS_ctx.activePriceMatrixVarietyTable.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
            for (const [rowIndex] of __VLS_getVForSourceType((__VLS_ctx.getVarietyRowCount(__VLS_ctx.activePriceMatrixVarietyTable)))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                    key: (`${__VLS_ctx.activePriceTableGroup.item.id}-variety-${rowIndex}`),
                });
                for (const [column, columnIndex] of __VLS_getVForSourceType((__VLS_ctx.activePriceMatrixVarietyTable.columns))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                        key: (`${__VLS_ctx.activePriceTableGroup.item.id}-variety-${rowIndex}-${columnIndex}`),
                    });
                    (column[rowIndex - 1] || '');
                }
            }
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "price-matrix-tabs flower-filter-tabs" },
    });
    for (const [filterTab] of __VLS_getVForSourceType((__VLS_ctx.flowerFilterTabs))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.activeFlowerFilter = filterTab.key;
                } },
            key: (filterTab.key),
            type: "button",
            ...{ class: "price-matrix-tab" },
            ...{ class: ({ active: __VLS_ctx.activeFlowerFilter === filterTab.key }) },
        });
        (filterTab.label);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrap desktop-table-wrap" },
        ...{ class: ({ 'desktop-table-wrap-fit': __VLS_ctx.store.activeSection === 'sezonnye' || (__VLS_ctx.store.activeSection === 'osnovnye' && __VLS_ctx.activeFlowerFilter !== 'rose') }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "price-table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.colgroup, __VLS_intrinsicElements.colgroup)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
        ...{ style: {} },
    });
    if (__VLS_ctx.store.unlocked) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.col)({
            ...{ style: {} },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    (__VLS_ctx.uiLabels.flowerKind);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    (__VLS_ctx.uiLabels.qty);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "popular-sizes-title" },
    });
    (__VLS_ctx.uiLabels.popularSizes);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "offer-divider" },
    });
    (__VLS_ctx.uiLabels.withoutPromo);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "promo-divider" },
    });
    (__VLS_ctx.uiLabels.promo);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "price-divider" },
    });
    (__VLS_ctx.uiLabels.flowerPrice);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    (__VLS_ctx.uiLabels.packaging);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    (__VLS_ctx.uiLabels.pistachio);
    if (__VLS_ctx.store.unlocked) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.actions);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.visibleRows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.activeRowId = item.id;
                } },
            key: (item.id),
            ...{ class: ({ 'is-active': __VLS_ctx.activeRowId === item.id, 'group-start': __VLS_ctx.isGroupStart(item, index) }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.activeRowId = item.id;
                } },
            ...{ class: "flower-name-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.flowerName);
        if (__VLS_ctx.isGypsophilaComposition(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "popular-sizes-note" },
            });
            (__VLS_ctx.POPULAR_SIZES_NOTE);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "qty-stack" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "qty-cell" },
        });
        if (__VLS_ctx.isQtyInputLocked(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "center-input qty-select promo-disabled-mark qty-dash" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(__VLS_ctx.isQtyInputLocked(item)))
                            return;
                        __VLS_ctx.resetQty(item);
                    } },
                ...{ class: "qty-reset" },
                type: "button",
                'aria-label': (__VLS_ctx.uiLabels.qtyResetOne),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ class: "qty-reset-icon" },
                src: (__VLS_ctx.resetIcon),
                alt: "",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(__VLS_ctx.isQtyInputLocked(item)))
                            return;
                        __VLS_ctx.updateQtyInput(item, $event.target.value);
                    } },
                ...{ onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(__VLS_ctx.isQtyInputLocked(item)))
                            return;
                        __VLS_ctx.commitQtyInput(item);
                    } },
                ...{ class: "center-input qty-select" },
                type: "number",
                min: (__VLS_ctx.getMinQty(item)),
                max: "101",
                step: "2",
                value: (__VLS_ctx.getQtyInputValue(item)),
                placeholder: (__VLS_ctx.uiLabels.qtyPlaceholder),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(__VLS_ctx.isQtyInputLocked(item)))
                            return;
                        __VLS_ctx.resetQty(item);
                    } },
                ...{ class: "qty-reset" },
                type: "button",
                'aria-label': (__VLS_ctx.uiLabels.qtyResetOne),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ class: "qty-reset-icon" },
                src: (__VLS_ctx.resetIcon),
                alt: "",
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "target-price-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "currency-input-wrap currency-input-wrap-target" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.updateTargetPrice(item, $event.target.value);
                } },
            ...{ class: "short-input center-input price-pick-input qty-price-input" },
            type: "number",
            min: "0",
            placeholder: (__VLS_ctx.uiLabels.targetPrice),
            value: (__VLS_ctx.getTargetPriceValue(item)),
        });
        if (__VLS_ctx.getTargetPriceValue(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "currency-input-sign" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.resetTargetPrice(item);
                } },
            ...{ class: "qty-reset" },
            type: "button",
            'aria-label': (__VLS_ctx.uiLabels.priceReset),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ class: "qty-reset-icon" },
            src: (__VLS_ctx.resetIcon),
            alt: "",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sizes-stack" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sizes" },
        });
        for (const [size] of __VLS_getVForSourceType((item.popularSizes))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        __VLS_ctx.chooseSize(item, size);
                    } },
                key: (size),
                ...{ class: ({ active: __VLS_ctx.isPopularSizeActive(item, size) }) },
            });
            (__VLS_ctx.getPopularSizeLabel(item, size));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-pick-layout inline-price-pick-layout" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.chooseSuggestedQty(item, __VLS_ctx.getAdjacentPrices(item).lower, 'lower');
                } },
            type: "button",
            ...{ class: "price-pick-option price-pick-option-left" },
            ...{ class: ({ 'is-empty': !__VLS_ctx.getAdjacentPrices(item).lower, active: __VLS_ctx.suggestedSelectionMap[item.id] === 'lower' }) },
            disabled: (!__VLS_ctx.getAdjacentPrices(item).lower),
        });
        if (__VLS_ctx.getAdjacentPrices(item).lower) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-with-ruble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatPrice(__VLS_ctx.getAdjacentPrices(item).lower.price));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-ruble" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.chooseSuggestedQty(item, __VLS_ctx.getAdjacentPrices(item).higher, 'higher');
                } },
            type: "button",
            ...{ class: "price-pick-option price-pick-option-right" },
            ...{ class: ({ 'is-empty': !__VLS_ctx.getAdjacentPrices(item).higher, active: __VLS_ctx.suggestedSelectionMap[item.id] === 'higher' }) },
            disabled: (!__VLS_ctx.getAdjacentPrices(item).higher),
        });
        if (__VLS_ctx.getAdjacentPrices(item).higher) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-with-ruble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatPrice(__VLS_ctx.getAdjacentPrices(item).higher.price));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-ruble" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "offer-divider" },
            ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
        });
        if (!__VLS_ctx.hasQtySelection(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "promo-disabled-mark" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-with-ruble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatPrice(__VLS_ctx.calcWithoutPromoForRow(item, __VLS_ctx.getQty(item))));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-ruble" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "promo-divider" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "promo-col" },
            ...{ class: ({ 'promo-col-disabled': __VLS_ctx.isPromoDisabledForQty(item, __VLS_ctx.getQty(item)) }) },
        });
        if (__VLS_ctx.isPromoDisabledForQty(item, __VLS_ctx.getQty(item))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "center-cell promo-disabled-mark" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
                ...{ onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(__VLS_ctx.isPromoDisabledForQty(item, __VLS_ctx.getQty(item))))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { discountPercent: Number($event.target.value), isPromoEnabled: true });
                    } },
                ...{ class: "center-input" },
                value: (item.discountPercent),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                value: (10),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                value: (15),
            });
            if (!__VLS_ctx.hasQtySelection(item)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "center-cell promo-disabled-mark promo-empty-price" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "center-cell price-with-ruble" },
                    ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.formatPrice(__VLS_ctx.calcWithPromoForRow({ ...item, isPromoEnabled: true }, __VLS_ctx.getQty(item))));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "price-ruble" },
                });
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "price-divider" },
        });
        if (!__VLS_ctx.isCarnationMix(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "currency-input-wrap" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(!__VLS_ctx.isCarnationMix(item)))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { unitPrice: Number($event.target.value) || 0 });
                    } },
                ...{ class: "short-input center-input" },
                disabled: (!__VLS_ctx.store.unlocked),
                type: "number",
                min: "0",
                value: (item.unitPrice),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "currency-input-sign" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "mix-price-fields" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "mix-price-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "currency-input-wrap" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(!__VLS_ctx.isCarnationMix(item)))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { unitPrice: Number($event.target.value) || 0 });
                    } },
                ...{ class: "short-input center-input" },
                disabled: (!__VLS_ctx.store.unlocked),
                type: "number",
                min: "0",
                value: (item.unitPrice),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "currency-input-sign" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "mix-price-qty" },
            });
            (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).primary);
            (__VLS_ctx.uiLabels.pieces);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "mix-price-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "currency-input-wrap" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(!__VLS_ctx.isCarnationMix(item)))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { secondaryUnitPrice: Number($event.target.value) || 0 });
                    } },
                ...{ class: "short-input center-input" },
                disabled: (!__VLS_ctx.store.unlocked),
                type: "number",
                min: "0",
                value: (item.secondaryUnitPrice || 0),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "currency-input-sign" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "mix-price-qty" },
            });
            (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).secondary);
            (__VLS_ctx.uiLabels.pieces);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        if (__VLS_ctx.isPackagingHidden(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "promo-disabled-mark" },
            });
        }
        else if (!__VLS_ctx.hasQtySelection(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "currency-input-wrap" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ class: "short-input center-input" },
                disabled: true,
                type: "text",
                value: "-",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "currency-input-wrap" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(__VLS_ctx.isPackagingHidden(item)))
                            return;
                        if (!!(!__VLS_ctx.hasQtySelection(item)))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { packagingPrice: Number($event.target.value) || 0 });
                    } },
                ...{ class: "short-input center-input" },
                disabled: (__VLS_ctx.hasAutoPackagingByQty(item) || !__VLS_ctx.store.unlocked),
                type: "number",
                min: "0",
                value: (__VLS_ctx.getPackagingPrice(item, __VLS_ctx.getQty(item))),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "currency-input-sign" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        if (__VLS_ctx.isPistachioLocked(item) || !__VLS_ctx.hasQtySelection(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pistachio-cell" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ class: "short-input center-input" },
                disabled: true,
                type: "text",
                value: "-",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pistachio-cell" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!!(__VLS_ctx.isPistachioLocked(item) || !__VLS_ctx.hasQtySelection(item)))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { pistachioQty: Number($event.target.value) || 0 });
                    } },
                ...{ class: "short-input center-input" },
                disabled: (!__VLS_ctx.store.unlocked || __VLS_ctx.usesAutoPistachioQty(item)),
                type: "number",
                min: "0",
                value: (__VLS_ctx.getPistachioQty(item, __VLS_ctx.getQty(item))),
            });
        }
        if (__VLS_ctx.store.unlocked) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "row-actions" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(__VLS_ctx.store.unlocked))
                            return;
                        __VLS_ctx.openEdit(item);
                    } },
                disabled: (!__VLS_ctx.store.unlocked),
            });
            (__VLS_ctx.uiLabels.edit);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(__VLS_ctx.store.unlocked))
                            return;
                        __VLS_ctx.store.deleteFlower(item.id);
                    } },
                disabled: (!__VLS_ctx.store.unlocked),
                ...{ class: "danger" },
            });
            (__VLS_ctx.uiLabels.delete);
        }
    }
    if (!__VLS_ctx.visibleRows.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            colspan: (__VLS_ctx.store.unlocked ? 9 : 8),
            ...{ class: "empty" },
        });
        (__VLS_ctx.uiLabels.empty);
    }
    if (__VLS_ctx.shouldShowRoseVarieties()) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "rose-variety-grid rose-variety-grid-desktop" },
        });
        for (const [table] of __VLS_getVForSourceType((__VLS_ctx.ROSE_VARIETY_TABLES))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
                key: (table.title),
                ...{ class: "rose-variety-table" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                colspan: (table.columns.length),
            });
            (table.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
            for (const [rowIndex] of __VLS_getVForSourceType((__VLS_ctx.getVarietyRowCount(table)))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                    key: (`${table.title}-${rowIndex}`),
                });
                for (const [column, columnIndex] of __VLS_getVForSourceType((table.columns))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                        key: (`${table.title}-${rowIndex}-${columnIndex}`),
                    });
                    (column[rowIndex - 1] || '');
                }
            }
        }
    }
    if (__VLS_ctx.shouldShowChryzaVarieties()) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "rose-variety-grid rose-variety-grid-desktop chryza-variety-grid" },
        });
        for (const [table] of __VLS_getVForSourceType((__VLS_ctx.CHRYZA_VARIETY_TABLES))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
                key: (table.title),
                ...{ class: "rose-variety-table" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                colspan: (table.columns.length),
            });
            (table.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
            for (const [rowIndex] of __VLS_getVForSourceType((__VLS_ctx.getVarietyRowCount(table)))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                    key: (`${table.title}-${rowIndex}`),
                });
                for (const [column, columnIndex] of __VLS_getVForSourceType((table.columns))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                        key: (`${table.title}-${rowIndex}-${columnIndex}`),
                    });
                    (column[rowIndex - 1] || '');
                }
            }
        }
    }
    if (__VLS_ctx.shouldShowPeonyVarieties()) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "rose-variety-grid rose-variety-grid-desktop" },
        });
        for (const [table] of __VLS_getVForSourceType((__VLS_ctx.PEONY_VARIETY_TABLES))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
                key: (table.title),
                ...{ class: "rose-variety-table" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                colspan: (table.columns.length),
            });
            (table.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
            for (const [rowIndex] of __VLS_getVForSourceType((__VLS_ctx.getVarietyRowCount(table)))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                    key: (`${table.title}-${rowIndex}`),
                });
                for (const [column, columnIndex] of __VLS_getVForSourceType((table.columns))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                        key: (`${table.title}-${rowIndex}-${columnIndex}`),
                    });
                    (column[rowIndex - 1] || '');
                }
            }
        }
    }
}
if (__VLS_ctx.store.activeSection !== 'priceTables') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mobile-cards" },
        ...{ class: ({ 'mobile-cards-grouped': __VLS_ctx.mobileCardSections.length > 0 }) },
    });
    if (__VLS_ctx.mobileCardSections.some((section) => section.items.length)) {
        for (const [section] of __VLS_getVForSourceType((__VLS_ctx.mobileCardSections))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
                key: (section.key),
                ...{ class: "mobile-section" },
                'data-mobile-section': (section.key),
            });
            if (section.collapsible) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                return;
                            if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                return;
                            if (!(section.collapsible))
                                return;
                            __VLS_ctx.selectMobileCategory(section.key);
                        } },
                    type: "button",
                    ...{ class: "mobile-category-toggle" },
                    ...{ class: ({ 'is-open': __VLS_ctx.isMobileCategoryOpen(section.key) }) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (section.label);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-category-toggle-icon" },
                });
                (__VLS_ctx.isMobileCategoryOpen(section.key) ? '-' : '+');
            }
            if (!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-section-list" },
                });
                for (const [item] of __VLS_getVForSourceType((section.items))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                        key: (item.id),
                        ...{ class: "mobile-card" },
                        ...{ class: ({ 'is-active': __VLS_ctx.activeRowId === item.id }) },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-card-header" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                    return;
                                __VLS_ctx.activeRowId = item.id;
                            } },
                        ...{ class: "mobile-flower-name" },
                        type: "button",
                    });
                    (item.flowerName);
                    if (__VLS_ctx.isGypsophilaComposition(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "mobile-helper-note" },
                        });
                        (__VLS_ctx.POPULAR_SIZES_NOTE);
                    }
                    if (__VLS_ctx.store.unlocked) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mobile-card-actions" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!(__VLS_ctx.store.unlocked))
                                        return;
                                    __VLS_ctx.openEdit(item);
                                } },
                            type: "button",
                        });
                        (__VLS_ctx.uiLabels.edit);
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!(__VLS_ctx.store.unlocked))
                                        return;
                                    __VLS_ctx.store.deleteFlower(item.id);
                                } },
                            type: "button",
                            ...{ class: "danger" },
                        });
                        (__VLS_ctx.uiLabels.delete);
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-card-grid" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-card-row mobile-card-row-top mobile-card-row-top-integrated" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-field mobile-field-qty" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.qty);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "qty-stack" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "qty-cell" },
                    });
                    if (__VLS_ctx.isQtyInputLocked(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "center-input qty-select promo-disabled-mark qty-dash" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!(__VLS_ctx.isQtyInputLocked(item)))
                                        return;
                                    __VLS_ctx.resetQty(item);
                                } },
                            ...{ class: "qty-reset" },
                            type: "button",
                            'aria-label': (__VLS_ctx.uiLabels.qtyResetOne),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                            ...{ class: "qty-reset-icon" },
                            src: (__VLS_ctx.resetIcon),
                            alt: "",
                        });
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ onInput: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(__VLS_ctx.isQtyInputLocked(item)))
                                        return;
                                    __VLS_ctx.updateQtyInput(item, $event.target.value);
                                } },
                            ...{ onChange: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(__VLS_ctx.isQtyInputLocked(item)))
                                        return;
                                    __VLS_ctx.commitQtyInput(item);
                                } },
                            ...{ class: "center-input qty-select" },
                            type: "number",
                            min: (__VLS_ctx.getMinQty(item)),
                            max: "101",
                            step: "2",
                            value: (__VLS_ctx.getQtyInputValue(item)),
                            placeholder: (__VLS_ctx.uiLabels.qtyPlaceholder),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(__VLS_ctx.isQtyInputLocked(item)))
                                        return;
                                    __VLS_ctx.resetQty(item);
                                } },
                            ...{ class: "qty-reset" },
                            type: "button",
                            'aria-label': (__VLS_ctx.uiLabels.mobileQtyReset),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                            ...{ class: "qty-reset-icon" },
                            src: (__VLS_ctx.resetIcon),
                            alt: "",
                        });
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "target-price-cell" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "currency-input-wrap currency-input-wrap-target currency-input-wrap-mobile" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                        ...{ onInput: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                    return;
                                __VLS_ctx.updateTargetPrice(item, $event.target.value);
                            } },
                        ...{ class: "short-input center-input mobile-input price-pick-input qty-price-input" },
                        type: "number",
                        min: "0",
                        placeholder: (__VLS_ctx.uiLabels.targetPrice),
                        value: (__VLS_ctx.getTargetPriceValue(item)),
                    });
                    if (__VLS_ctx.getTargetPriceValue(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "currency-input-sign" },
                        });
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                    return;
                                __VLS_ctx.resetTargetPrice(item);
                            } },
                        ...{ class: "qty-reset" },
                        type: "button",
                        'aria-label': (__VLS_ctx.uiLabels.priceReset),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        ...{ class: "qty-reset-icon" },
                        src: (__VLS_ctx.resetIcon),
                        alt: "",
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-field mobile-field-sizes" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.popularSizes);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "sizes-stack" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "sizes" },
                    });
                    for (const [size] of __VLS_getVForSourceType((item.popularSizes))) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    __VLS_ctx.chooseSize(item, size);
                                } },
                            key: (size),
                            ...{ class: ({ active: __VLS_ctx.isPopularSizeActive(item, size) }) },
                        });
                        (__VLS_ctx.getPopularSizeLabel(item, size));
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "price-pick-layout inline-price-pick-layout" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                    return;
                                __VLS_ctx.chooseSuggestedQty(item, __VLS_ctx.getAdjacentPrices(item).lower, 'lower');
                            } },
                        type: "button",
                        ...{ class: "price-pick-option price-pick-option-left" },
                        ...{ class: ({ 'is-empty': !__VLS_ctx.getAdjacentPrices(item).lower, active: __VLS_ctx.suggestedSelectionMap[item.id] === 'lower' }) },
                        disabled: (!__VLS_ctx.getAdjacentPrices(item).lower),
                    });
                    if (__VLS_ctx.getAdjacentPrices(item).lower) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "price-with-ruble" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                        (__VLS_ctx.formatPrice(__VLS_ctx.getAdjacentPrices(item).lower.price));
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "price-ruble" },
                        });
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                    return;
                                __VLS_ctx.chooseSuggestedQty(item, __VLS_ctx.getAdjacentPrices(item).higher, 'higher');
                            } },
                        type: "button",
                        ...{ class: "price-pick-option price-pick-option-right" },
                        ...{ class: ({ 'is-empty': !__VLS_ctx.getAdjacentPrices(item).higher, active: __VLS_ctx.suggestedSelectionMap[item.id] === 'higher' }) },
                        disabled: (!__VLS_ctx.getAdjacentPrices(item).higher),
                    });
                    if (__VLS_ctx.getAdjacentPrices(item).higher) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "price-with-ruble" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                        (__VLS_ctx.formatPrice(__VLS_ctx.getAdjacentPrices(item).higher.price));
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "price-ruble" },
                        });
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-card-row mobile-card-row-metrics mobile-metrics" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-metric" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.withoutPromo);
                    if (!__VLS_ctx.hasQtySelection(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                            ...{ class: "promo-disabled-mark" },
                        });
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                            ...{ class: "price-with-ruble" },
                            ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                        (__VLS_ctx.formatPrice(__VLS_ctx.calcWithoutPromoForRow(item, __VLS_ctx.getQty(item))));
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "price-ruble" },
                        });
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-metric" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.promo);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-promo-value" },
                        ...{ class: ({ 'mobile-promo-value-disabled': __VLS_ctx.isPromoDisabledForQty(item, __VLS_ctx.getQty(item)) }) },
                    });
                    if (__VLS_ctx.isPromoDisabledForQty(item, __VLS_ctx.getQty(item))) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                            ...{ class: "price-with-ruble promo-disabled-mark" },
                        });
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
                            ...{ onChange: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(__VLS_ctx.isPromoDisabledForQty(item, __VLS_ctx.getQty(item))))
                                        return;
                                    __VLS_ctx.store.patchFlower(item.id, { discountPercent: Number($event.target.value), isPromoEnabled: true });
                                } },
                            ...{ class: "center-input" },
                            value: (item.discountPercent),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                            value: (10),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                            value: (15),
                        });
                        if (!__VLS_ctx.hasQtySelection(item)) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                                ...{ class: "promo-disabled-mark promo-empty-price" },
                            });
                        }
                        else {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                                ...{ class: "price-with-ruble" },
                                ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                            (__VLS_ctx.formatPrice(__VLS_ctx.calcWithPromoForRow({ ...item, isPromoEnabled: true }, __VLS_ctx.getQty(item))));
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "price-ruble" },
                            });
                        }
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-card-row mobile-card-row-bottom" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "mobile-field mobile-field-compact" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.flowerPrice);
                    if (!__VLS_ctx.isCarnationMix(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "currency-input-wrap currency-input-wrap-mobile" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ onInput: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!(!__VLS_ctx.isCarnationMix(item)))
                                        return;
                                    __VLS_ctx.store.patchFlower(item.id, { unitPrice: Number($event.target.value) || 0 });
                                } },
                            ...{ class: "short-input center-input mobile-input" },
                            disabled: (!__VLS_ctx.store.unlocked),
                            type: "number",
                            min: "0",
                            value: (item.unitPrice),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "currency-input-sign" },
                        });
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mix-price-fields mobile-mix-price-fields" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mix-price-item" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "currency-input-wrap currency-input-wrap-mobile" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ onInput: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(!__VLS_ctx.isCarnationMix(item)))
                                        return;
                                    __VLS_ctx.store.patchFlower(item.id, { unitPrice: Number($event.target.value) || 0 });
                                } },
                            ...{ class: "short-input center-input mobile-input" },
                            disabled: (!__VLS_ctx.store.unlocked),
                            type: "number",
                            min: "0",
                            value: (item.unitPrice),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "currency-input-sign" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "mix-price-qty" },
                        });
                        (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).primary);
                        (__VLS_ctx.uiLabels.pieces);
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mix-price-item" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "currency-input-wrap currency-input-wrap-mobile" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ onInput: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(!__VLS_ctx.isCarnationMix(item)))
                                        return;
                                    __VLS_ctx.store.patchFlower(item.id, { secondaryUnitPrice: Number($event.target.value) || 0 });
                                } },
                            ...{ class: "short-input center-input mobile-input" },
                            disabled: (!__VLS_ctx.store.unlocked),
                            type: "number",
                            min: "0",
                            value: (item.secondaryUnitPrice || 0),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "currency-input-sign" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "mix-price-qty" },
                        });
                        (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).secondary);
                        (__VLS_ctx.uiLabels.pieces);
                    }
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                        ...{ class: "mobile-field mobile-field-compact" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.packaging);
                    if (__VLS_ctx.isPackagingHidden(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "promo-disabled-mark" },
                        });
                    }
                    else if (!__VLS_ctx.hasQtySelection(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "currency-input-wrap currency-input-wrap-mobile" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ class: "short-input center-input mobile-input" },
                            disabled: true,
                            type: "text",
                            value: "-",
                        });
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "currency-input-wrap currency-input-wrap-mobile" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ onInput: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(__VLS_ctx.isPackagingHidden(item)))
                                        return;
                                    if (!!(!__VLS_ctx.hasQtySelection(item)))
                                        return;
                                    __VLS_ctx.store.patchFlower(item.id, { packagingPrice: Number($event.target.value) || 0 });
                                } },
                            ...{ class: "short-input center-input mobile-input" },
                            disabled: (__VLS_ctx.hasAutoPackagingByQty(item) || !__VLS_ctx.store.unlocked),
                            type: "number",
                            min: "0",
                            value: (__VLS_ctx.getPackagingPrice(item, __VLS_ctx.getQty(item))),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "currency-input-sign" },
                        });
                    }
                    if (__VLS_ctx.hidesMobilePistachio(item)) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mobile-field mobile-field-compact mobile-field-pistachio mobile-field-pistachio-empty" },
                        });
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mobile-field mobile-field-compact mobile-field-pistachio" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mobile-field-head mobile-field-head-inline" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "mobile-label" },
                        });
                        (__VLS_ctx.uiLabels.pistachio);
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "pistachio-cell mobile-pistachio-cell" },
                        });
                        if (!__VLS_ctx.hasQtySelection(item)) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                                ...{ class: "short-input center-input mobile-input" },
                                disabled: true,
                                type: "text",
                                value: "-",
                            });
                        }
                        else {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                                ...{ onInput: (...[$event]) => {
                                        if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                            return;
                                        if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                            return;
                                        if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                            return;
                                        if (!!(__VLS_ctx.hidesMobilePistachio(item)))
                                            return;
                                        if (!!(!__VLS_ctx.hasQtySelection(item)))
                                            return;
                                        __VLS_ctx.store.patchFlower(item.id, { pistachioQty: Number($event.target.value) || 0 });
                                    } },
                                ...{ class: "short-input center-input mobile-input" },
                                disabled: (!__VLS_ctx.store.unlocked || __VLS_ctx.isPistachioLocked(item) || __VLS_ctx.usesAutoPistachioQty(item)),
                                type: "number",
                                min: "0",
                                value: (__VLS_ctx.isPistachioLocked(item) ? '' : __VLS_ctx.getPistachioQty(item, __VLS_ctx.getQty(item))),
                            });
                        }
                    }
                }
            }
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty mobile-empty" },
        });
        (__VLS_ctx.uiLabels.empty);
    }
}
/** @type {[typeof FlowerEditorModal, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(FlowerEditorModal, new FlowerEditorModal({
    ...{ 'onClose': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.editorOpen),
    initial: (__VLS_ctx.editorItem),
    section: (__VLS_ctx.store.activeSection === 'priceTables' ? 'osnovnye' : __VLS_ctx.store.activeSection),
}));
const __VLS_16 = __VLS_15({
    ...{ 'onClose': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.editorOpen),
    initial: (__VLS_ctx.editorItem),
    section: (__VLS_ctx.store.activeSection === 'priceTables' ? 'osnovnye' : __VLS_ctx.store.activeSection),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
let __VLS_18;
let __VLS_19;
let __VLS_20;
const __VLS_21 = {
    onClose: (...[$event]) => {
        __VLS_ctx.editorOpen = false;
    }
};
const __VLS_22 = {
    onSave: (__VLS_ctx.saveEditor)
};
var __VLS_17;
/** @type {__VLS_StyleScopedClasses['layout']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-side']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['status-row']} */ ;
/** @type {__VLS_StyleScopedClasses['warn']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-page']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tabs-desktop']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tabs-row']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tab-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-mobile-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-mobile-categories']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-mobile-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-mobile-subtabs']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-mobile-subtab']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-table']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-promo-select']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-variety']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table-price-matrix']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['flower-filter-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['desktop-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-table']} */ ;
/** @type {__VLS_StyleScopedClasses['popular-sizes-title']} */ ;
/** @type {__VLS_StyleScopedClasses['offer-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['price-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['flower-name-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['popular-sizes-note']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-select']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-dash']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-select']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['target-price-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-target']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-price-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sizes-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['sizes']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-price-pick-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option-left']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option-right']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['offer-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-col']} */ ;
/** @type {__VLS_StyleScopedClasses['center-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-empty-price']} */ ;
/** @type {__VLS_StyleScopedClasses['center-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['row-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid-desktop']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid-desktop']} */ ;
/** @type {__VLS_StyleScopedClasses['chryza-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid-desktop']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-section']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-category-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-category-toggle-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-section-list']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-flower-name']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-helper-note']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row-top']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row-top-integrated']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-select']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-dash']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-select']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['target-price-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-target']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-price-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-sizes']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sizes-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['sizes']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-price-pick-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option-left']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option']} */ ;
/** @type {__VLS_StyleScopedClasses['price-pick-option-right']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-promo-value']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-empty-price']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-row-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-mix-price-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-disabled-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-wrap-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-pistachio']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-pistachio-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-pistachio']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-head-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['chryza-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-grid-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['rose-variety-table']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AuthGate: AuthGate,
            FlowerEditorModal: FlowerEditorModal,
            SidebarMenu: SidebarMenu,
            SECTION_LABELS: SECTION_LABELS,
            resetIcon: resetIcon,
            store: store,
            editorOpen: editorOpen,
            editorItem: editorItem,
            activeRowId: activeRowId,
            suggestedSelectionMap: suggestedSelectionMap,
            isMobileViewport: isMobileViewport,
            mobilePriceMatrixPromo: mobilePriceMatrixPromo,
            POPULAR_SIZES_NOTE: POPULAR_SIZES_NOTE,
            uiLabels: uiLabels,
            ROSE_VARIETY_TABLES: ROSE_VARIETY_TABLES,
            CHRYZA_VARIETY_TABLES: CHRYZA_VARIETY_TABLES,
            PEONY_VARIETY_TABLES: PEONY_VARIETY_TABLES,
            activeFlowerFilter: activeFlowerFilter,
            shouldShowRoseVarieties: shouldShowRoseVarieties,
            shouldShowChryzaVarieties: shouldShowChryzaVarieties,
            shouldShowPeonyVarieties: shouldShowPeonyVarieties,
            getVarietyRowCount: getVarietyRowCount,
            visibleRows: visibleRows,
            flowerFilterTabs: flowerFilterTabs,
            selectedPriceTableId: selectedPriceTableId,
            priceTableSection: priceTableSection,
            activePriceTableGroup: activePriceTableGroup,
            activePriceMatrixVarietyTable: activePriceMatrixVarietyTable,
            priceMatrixTabRows: priceMatrixTabRows,
            mobilePriceMatrixCategories: mobilePriceMatrixCategories,
            mobileActivePriceMatrixCategory: mobileActivePriceMatrixCategory,
            mobilePriceMatrixSubtabs: mobilePriceMatrixSubtabs,
            mobilePriceMatrixHasSubtabs: mobilePriceMatrixHasSubtabs,
            activePriceTableHidesPistachio: activePriceTableHidesPistachio,
            selectMobilePriceMatrixCategory: selectMobilePriceMatrixCategory,
            mobileCardSections: mobileCardSections,
            isMobileCategoryOpen: isMobileCategoryOpen,
            selectMobileCategory: selectMobileCategory,
            isGroupStart: isGroupStart,
            getMinQty: getMinQty,
            getQty: getQty,
            hasQtySelection: hasQtySelection,
            isCarnationMix: isCarnationMix,
            isGypsophilaComposition: isGypsophilaComposition,
            isPromoDisabledForQty: isPromoDisabledForQty,
            isPackagingHidden: isPackagingHidden,
            hasAutoPackagingByQty: hasAutoPackagingByQty,
            getPackagingPrice: getPackagingPrice,
            getPistachioQty: getPistachioQty,
            calcWithoutPromoForRow: calcWithoutPromoForRow,
            calcWithPromoForRow: calcWithPromoForRow,
            resetQty: resetQty,
            resetTargetPrice: resetTargetPrice,
            chooseSize: chooseSize,
            getTargetPriceValue: getTargetPriceValue,
            updateTargetPrice: updateTargetPrice,
            getQtyInputValue: getQtyInputValue,
            updateQtyInput: updateQtyInput,
            commitQtyInput: commitQtyInput,
            chooseSuggestedQty: chooseSuggestedQty,
            getAdjacentPrices: getAdjacentPrices,
            formatPrice: formatPrice,
            getMixQtySplit: getMixQtySplit,
            formatPriceWithRuble: formatPriceWithRuble,
            isPistachioLocked: isPistachioLocked,
            hidesMobilePistachio: hidesMobilePistachio,
            usesAutoPistachioQty: usesAutoPistachioQty,
            isQtyInputLocked: isQtyInputLocked,
            getPopularSizeLabel: getPopularSizeLabel,
            isPopularSizeActive: isPopularSizeActive,
            handlePageClick: handlePageClick,
            onSectionChange: onSectionChange,
            onPriceTablesSectionChange: onPriceTablesSectionChange,
            openCreate: openCreate,
            openEdit: openEdit,
            saveEditor: saveEditor,
            onChooseFile: onChooseFile,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
