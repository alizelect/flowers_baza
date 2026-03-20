import { computed, nextTick, onMounted, reactive, ref } from 'vue';
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
const oddOptions = Array.from({ length: 51 }, (_, i) => i * 2 + 1);
const hydrangeaOddOptions = Array.from({ length: 18 }, (_, i) => i * 2 + 1);
const mobileOpenCategory = ref(null);
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1';
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de';
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3';
const CARNATION_MIX_ID = '9f340ce7-5f4a-4f3d-8e8f-1e165566aa01';
const MOBILE_PRIMARY_CATEGORY_ORDER = ['rose', 'alstroemerii', 'carnation', 'chryza', 'hydrangea'];
const MOBILE_SEASONAL_CATEGORY_ORDER = ['peony', 'tulip'];
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
};
const MOBILE_PRIMARY_CATEGORY_LABELS = {
    rose: '\u0420\u043e\u0437\u044b',
    alstroemerii: '\u0410\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438',
    carnation: '\u0413\u0432\u043e\u0437\u0434\u0438\u043a\u0438',
    chryza: '\u0425\u0440\u0438\u0437\u0430\u043d\u0442\u0435\u043c\u044b',
    hydrangea: '\u0413\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438',
};
const MAIN_ORDER = [
    '\u0420\u041e\u0417\u042b \u043f\u043e 150',
    '\u0420\u041e\u0417\u042b \u043f\u043e 250',
    '\u0420\u041e\u0417\u042b \u043f\u043e 300',
    '\u0410\u041b\u042c\u0421\u0422\u0420\u041e\u041c\u0415\u0420\u0418\u0418',
    '\u0413\u0412\u041e\u0417\u0414\u0418\u041a\u0418 - \u043e\u0431\u044b\u0447\u043d\u044b\u0435',
    '\u0413\u0412\u041e\u0417\u0414\u0418\u041a\u0418 - \u043b\u0443\u043d\u043d\u044b\u0435',
    '\u0413\u0412\u041e\u0417\u0414\u0418\u041a\u0418 - \u043c\u0438\u043a\u0441',
    '\u0425\u0420\u0418\u0417\u0410 - \u043a\u0443\u0441\u0442\u043e\u0432\u0430\u044f \u043f\u043e 250',
    '\u0425\u0420\u0418\u0417\u0410 - \u043a\u0443\u0441\u0442\u043e\u0432\u0430\u044f \u043f\u043e 300',
    '\u0425\u0420\u0418\u0417\u0410 - \u043e\u0434\u043d\u043e\u0433\u043e\u043b\u043e\u0432\u0430\u044f',
    '\u0413\u041e\u0420\u0422\u0415\u041d\u0417\u0418\u0418',
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
const PISTACHIO_UNIT_PRICE = 40;
const ROSE_150_PACKAGING_BY_ODD = [
    140, 140, 240, 260, 260, 360, 420, 520, 520, 620,
    680, 680, 680, 680, 740, 740, 740, 840, 800, 800,
    800, 800, 860, 860, 860, 860, 920, 920, 920, 920,
    980, 980, 980, 980, 1040, 1040, 1040, 1040, 1000, 1000,
    1000, 1000, 1160, 1160, 1160, 1160, 1120, 1120, 1120, 1120,
    1180,
];
const ROSE_300_PACKAGING_BY_ODD = [
    190, 190, 290, 310, 310, 410, 370, 570, 570, 670,
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
    200, 340, 420, 500, 620, 700, 820, 900, 1020, 1200,
    1220, 1300, 1420, 1500, 1620, 1700, 1820, 1940, 1960, 1980,
    2060, 1980, 2000, 2020, 2040, 2020, 2040, 2060, 2080, 3000,
    2080, 3000, 3020, 3040, 3060, 3040, 3060, 3080, 4000, 4020,
    4000, 4020, 4040, 4060, 4080, 4060, 4080, 5000, 5020, 5040,
    5020,
];
const PEONY_PACKAGING_BY_ODD = [
    100, 220, 240, 380, 400, 420, 500, 620, 740, 760,
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
        const ai = getMainOrderIndex(a);
        const bi = getMainOrderIndex(b);
        if (ai !== bi)
            return ai - bi;
    }
    return a.flowerName.localeCompare(b.flowerName, 'ru');
}
const visibleRows = computed(() => [...store.filteredBySection].sort(compareFlowers));
const selectedPriceTableId = ref('');
const priceTableGroups = computed(() => [...store.flowers]
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
    if (isChryzaSingle(item) || isChryzaBush250(item) || isChryzaBush300(item))
        return 'chryza';
    if (isRose150(item) || isRose250(item) || isRose300(item))
        return 'rose';
    if (isAlstroemerii(item))
        return 'alstroemerii';
    if (isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item))
        return 'carnation';
    if (isHydrangea(item))
        return 'hydrangea';
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
        return false;
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
function isRose150(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('150');
}
function isRose250(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('250');
}
function isRose300(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('300');
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
function isChryzaSingle(item) {
    return item.id === CHRYZA_SINGLE_ID;
}
function isChryzaBush250(item) {
    return item.id === CHRYZA_BUSH_250_ID;
}
function isChryzaBush300(item) {
    return item.id === CHRYZA_BUSH_300_ID;
}
function hasAutoPackagingByQty(item) {
    return isRose150(item) || isRose250(item) || isRose300(item) || isAlstroemerii(item) || isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item) || isHydrangea(item) || isPeonies(item) || isTulips(item) || isChryzaSingle(item) || isChryzaBush250(item) || isChryzaBush300(item);
}
function getPackagingPrice(item, qty) {
    if (!hasAutoPackagingByQty(item)) {
        return item.packagingPrice;
    }
    const idx = isCarnationMix(item) ? (toOdd(qty) - 3) / 2 : (toOdd(qty) - 1) / 2;
    if (isTulips(item)) {
        return TULIP_PACKAGING_BY_ODD[idx] ?? TULIP_PACKAGING_BY_ODD[TULIP_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isChryzaBush250(item)) {
        return CHRYZA_BUSH_250_PACKAGING_BY_ODD[idx] ?? CHRYZA_BUSH_250_PACKAGING_BY_ODD[CHRYZA_BUSH_250_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isChryzaBush300(item)) {
        return CHRYZA_BUSH_300_PACKAGING_BY_ODD[idx] ?? CHRYZA_BUSH_300_PACKAGING_BY_ODD[CHRYZA_BUSH_300_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isRose300(item)) {
        return ROSE_300_PACKAGING_BY_ODD[idx] ?? item.packagingPrice;
    }
    if (isAlstroemerii(item)) {
        return ALSTROMERII_PACKAGING_BY_ODD[idx] ?? item.packagingPrice;
    }
    if (isCarnationCommon(item)) {
        return CARNATION_COMMON_PACKAGING_BY_ODD[idx] ?? CARNATION_COMMON_PACKAGING_BY_ODD[CARNATION_COMMON_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isCarnationMoon(item)) {
        return CARNATION_MOON_PACKAGING_BY_ODD[idx] ?? CARNATION_MOON_PACKAGING_BY_ODD[CARNATION_MOON_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isCarnationMix(item)) {
        return CARNATION_MIX_PACKAGING_BY_ODD[idx] ?? CARNATION_MIX_PACKAGING_BY_ODD[CARNATION_MIX_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isPeonies(item)) {
        return PEONY_PACKAGING_BY_ODD[idx] ?? PEONY_PACKAGING_BY_ODD[PEONY_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isHydrangea(item)) {
        return HYDRANGEA_PACKAGING_BY_ODD[idx] ?? HYDRANGEA_PACKAGING_BY_ODD[HYDRANGEA_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    if (isChryzaSingle(item)) {
        return CHRYZA_SINGLE_PACKAGING_BY_ODD[idx] ?? CHRYZA_SINGLE_PACKAGING_BY_ODD[CHRYZA_SINGLE_PACKAGING_BY_ODD.length - 1] ?? item.packagingPrice;
    }
    return ROSE_150_PACKAGING_BY_ODD[idx] ?? item.packagingPrice;
}
function getPistachioQty(item, qty) {
    if (isPistachioLocked(item)) {
        return 0;
    }
    const idx = isCarnationMix(item) ? (toOdd(qty) - 3) / 2 : (toOdd(qty) - 1) / 2;
    if (isRose150(item)) {
        return ROSE_150_PISTACHIO_QTY_BY_ODD[idx] ?? 0;
    }
    if (isRose250(item)) {
        return ROSE_250_PISTACHIO_QTY_BY_ODD[idx] ?? 0;
    }
    if (isRose300(item)) {
        return ROSE_300_PISTACHIO_QTY_BY_ODD[idx] ?? 0;
    }
    if (isCarnationCommon(item)) {
        return CARNATION_COMMON_PISTACHIO_QTY_BY_ODD[idx] ?? CARNATION_COMMON_PISTACHIO_QTY_BY_ODD[CARNATION_COMMON_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0;
    }
    if (isCarnationMoon(item)) {
        return CARNATION_MOON_PISTACHIO_QTY_BY_ODD[idx] ?? CARNATION_MOON_PISTACHIO_QTY_BY_ODD[CARNATION_MOON_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0;
    }
    if (isCarnationMix(item)) {
        return CARNATION_MIX_PISTACHIO_QTY_BY_ODD[idx] ?? CARNATION_MIX_PISTACHIO_QTY_BY_ODD[CARNATION_MIX_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0;
    }
    if (isAlstroemerii(item)) {
        return ALSTROMERII_PISTACHIO_QTY_BY_ODD[idx] ?? 0;
    }
    if (isPeonies(item)) {
        return PEONY_PISTACHIO_QTY_BY_ODD[idx] ?? PEONY_PISTACHIO_QTY_BY_ODD[PEONY_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0;
    }
    if (isHydrangea(item)) {
        return HYDRANGEA_PISTACHIO_QTY_BY_ODD[idx] ?? HYDRANGEA_PISTACHIO_QTY_BY_ODD[HYDRANGEA_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0;
    }
    if (isChryzaSingle(item)) {
        return CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD[idx] ?? CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD[CHRYZA_SINGLE_PISTACHIO_QTY_BY_ODD.length - 1] ?? 0;
    }
    return item.pistachioQty;
}
function calcWithoutPromoForRow(item, qty) {
    const pistachioLocked = isPistachioLocked(item);
    return calcWithoutPromo({
        ...item,
        packagingPrice: getPackagingPrice(item, qty),
        hasPistachio: pistachioLocked ? false : item.hasPistachio,
        pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
        pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    }, qty);
}
function calcWithPromoForRow(item, qty) {
    const pistachioLocked = isPistachioLocked(item);
    return calcWithPromo({
        ...item,
        packagingPrice: getPackagingPrice(item, qty),
        hasPistachio: pistachioLocked ? false : item.hasPistachio,
        pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
        pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    }, qty);
}
function chooseQty(item, value) {
    const normalized = normalizeQty(item, value);
    qtyMap[item.id] = normalized;
    qtyInputMap[item.id] = String(normalized);
    suggestedSelectionMap[item.id] = '';
    activeRowId.value = item.id;
}
function resetQty(item) {
    qtyMap[item.id] = getMinQty(item);
    qtyInputMap[item.id] = '';
    suggestedSelectionMap[item.id] = '';
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
        activeRowId.value = item.id;
        return;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        qtyMap[item.id] = normalizeQty(item, parsed);
        suggestedSelectionMap[item.id] = '';
    }
    activeRowId.value = item.id;
}
function commitQtyInput(item) {
    const rawValue = getQtyInputValue(item).trim();
    if (!rawValue) {
        qtyMap[item.id] = getMinQty(item);
        qtyInputMap[item.id] = '';
        suggestedSelectionMap[item.id] = '';
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
    if (isCarnationMix(item)) {
        const split = getMixQtySplit(qty);
        return `${split.primary} + ${split.secondary} \u0448\u0442.`;
    }
    return `${qty} \u0448\u0442.`;
}
function getFlowerCostLabel(item, qty) {
    const secondaryUnitPrice = Number(item.secondaryUnitPrice) || 0;
    if (secondaryUnitPrice > 0) {
        const split = getMixQtySplit(qty);
        return `${split.primary} x ${formatPrice(item.unitPrice)} + ${split.secondary} x ${formatPrice(secondaryUnitPrice)} = ${formatPriceWithRuble(getFlowerCostValue(item, qty))}`;
    }
    return `${qty} x ${formatPrice(item.unitPrice)} = ${formatPriceWithRuble(getFlowerCostValue(item, qty))}`;
}
function getPistachioCostValue(item, qty) {
    if (isPistachioLocked(item) || !item.hasPistachio) {
        return 0;
    }
    return getPistachioQty(item, qty) * PISTACHIO_UNIT_PRICE;
}
function getPistachioLabel(item, qty) {
    if (isPistachioLocked(item)) {
        return '\u2014';
    }
    if (!item.hasPistachio) {
        return '\u0432\u044b\u043a\u043b.';
    }
    const pistachioQty = getPistachioQty(item, qty);
    if (!pistachioQty) {
        return '0';
    }
    return `${pistachioQty} x ${PISTACHIO_UNIT_PRICE} = ${formatPriceWithRuble(getPistachioCostValue(item, qty))}`;
}
function getPromoPriceForPercent(item, qty, discountPercent) {
    const pistachioLocked = isPistachioLocked(item);
    return calcWithPromo({
        ...item,
        discountPercent,
        isPromoEnabled: true,
        packagingPrice: getPackagingPrice(item, qty),
        hasPistachio: pistachioLocked ? false : item.hasPistachio,
        pistachioQty: pistachioLocked ? 0 : getPistachioQty(item, qty),
        pistachioUnitPrice: PISTACHIO_UNIT_PRICE,
    }, qty);
}
function getCurrentPromoLabel(item, qty) {
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
        packaging: formatPriceWithRuble(getPackagingPrice(item, qty)),
        promo10: formatPriceWithRuble(getPromoPriceForPercent(item, qty, 10)),
        promo15: formatPriceWithRuble(getPromoPriceForPercent(item, qty, 15)),
    }));
}
function isPistachioLocked(item) {
    return isTulips(item) || isChryzaBush250(item) || isChryzaBush300(item);
}
function hidesMobilePistachio(item) {
    return isTulips(item) || isChryzaBush250(item) || isChryzaBush300(item);
}
function usesAutoPistachioQty(item) {
    return isRose150(item) || isRose250(item) || isRose300(item) || isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item) || isAlstroemerii(item) || isHydrangea(item) || isPeonies(item) || isChryzaSingle(item);
}
function clearActiveRow() {
    activeRowId.value = '';
}
function handlePageClick(event) {
    const target = event.target;
    if (!target)
        return;
    if (target.closest('button, input, select, label, .price-table, .modal, .menu-btn'))
        return;
    clearActiveRow();
}
function onSectionChange(section) {
    store.activeSection = section;
    mobileOpenCategory.value = null;
    if (section !== 'priceTables') {
        return;
    }
    selectedPriceTableId.value = activePriceTableGroup.value?.item.id ?? priceTableGroups.value[0]?.item.id ?? '';
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
onMounted(async () => {
    await store.bootstrap();
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
    active: (__VLS_ctx.store.activeSection),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onChange': {} },
    active: (__VLS_ctx.store.activeSection),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onChange: (__VLS_ctx.onSectionChange)
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
    const __VLS_7 = __VLS_asFunctionalComponent(AuthGate, new AuthGate({
        ...{ 'onUnlocked': {} },
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onUnlocked': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_10;
    let __VLS_11;
    let __VLS_12;
    const __VLS_13 = {
        onUnlocked: (__VLS_ctx.store.setUnlocked)
    };
    var __VLS_9;
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
        ...{ class: "price-matrix-tabs" },
    });
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.priceTableGroups))) {
        (group.item.id);
        if (group.item.id === __VLS_ctx.CHRYZA_BUSH_250_ID) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "price-matrix-tabs-break" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.selectedPriceTableId = group.item.id;
                } },
            type: "button",
            ...{ class: "price-matrix-tab" },
            ...{ class: ({ active: __VLS_ctx.activePriceTableGroup?.item.id === group.item.id }) },
        });
        (group.item.flowerName);
    }
    if (__VLS_ctx.activePriceTableGroup) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "price-matrix-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "price-matrix-card-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
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
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.withoutPromo);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.pistachio);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.packaging);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.promo10);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        (__VLS_ctx.uiLabels.promo15);
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
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.pistachio);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-with-ruble" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (row.packaging);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "price-ruble" },
            });
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
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrap desktop-table-wrap" },
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
        (item.flowerName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "qty-stack" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "qty-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                        return;
                    __VLS_ctx.updateQtyInput(item, $event.target.value);
                } },
            ...{ onChange: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
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
                ...{ class: ({ active: __VLS_ctx.getQty(item) === size }) },
            });
            (size);
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "price-with-ruble" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatPrice(__VLS_ctx.calcWithoutPromoForRow(item, __VLS_ctx.getQty(item))));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "price-ruble" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "promo-divider" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "promo-col" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            ...{ onChange: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "center-cell price-with-ruble" },
            ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatPrice(__VLS_ctx.calcWithPromoForRow({ ...item, isPromoEnabled: true }, __VLS_ctx.getQty(item))));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "price-ruble" },
        });
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "currency-input-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
                    if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        if (!__VLS_ctx.isPistachioLocked(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pistachio-cell" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onChange: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(!__VLS_ctx.isPistachioLocked(item)))
                            return;
                        __VLS_ctx.store.patchFlower(item.id, { hasPistachio: $event.target.checked });
                    } },
                type: "checkbox",
                checked: (item.hasPistachio),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onInput: (...[$event]) => {
                        if (!!(__VLS_ctx.store.activeSection === 'priceTables'))
                            return;
                        if (!(!__VLS_ctx.isPistachioLocked(item)))
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
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                        ...{ onInput: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
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
                            ...{ class: ({ active: __VLS_ctx.getQty(item) === size }) },
                        });
                        (size);
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
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                        ...{ class: "price-with-ruble" },
                        ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (__VLS_ctx.formatPrice(__VLS_ctx.calcWithoutPromoForRow(item, __VLS_ctx.getQty(item))));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "price-ruble" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-metric" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mobile-label" },
                    });
                    (__VLS_ctx.uiLabels.promo);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mobile-promo-value" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
                        ...{ onChange: (...[$event]) => {
                                if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                    return;
                                if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                    return;
                                if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
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
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                        ...{ class: "price-with-ruble" },
                        ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (__VLS_ctx.formatPrice(__VLS_ctx.calcWithPromoForRow({ ...item, isPromoEnabled: true }, __VLS_ctx.getQty(item))));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "price-ruble" },
                    });
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
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                            ...{ class: "mobile-checkbox mobile-checkbox-inline" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                            ...{ onChange: (...[$event]) => {
                                    if (!(__VLS_ctx.store.activeSection !== 'priceTables'))
                                        return;
                                    if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                        return;
                                    if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                        return;
                                    if (!!(__VLS_ctx.hidesMobilePistachio(item)))
                                        return;
                                    __VLS_ctx.store.patchFlower(item.id, { hasPistachio: $event.target.checked });
                                } },
                            type: "checkbox",
                            checked: (__VLS_ctx.isPistachioLocked(item) ? false : item.hasPistachio),
                            disabled: (__VLS_ctx.isPistachioLocked(item)),
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "pistachio-cell mobile-pistachio-cell" },
                        });
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
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty mobile-empty" },
        });
        (__VLS_ctx.uiLabels.empty);
    }
}
/** @type {[typeof FlowerEditorModal, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(FlowerEditorModal, new FlowerEditorModal({
    ...{ 'onClose': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.editorOpen),
    initial: (__VLS_ctx.editorItem),
    section: (__VLS_ctx.store.activeSection === 'priceTables' ? 'osnovnye' : __VLS_ctx.store.activeSection),
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClose': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.editorOpen),
    initial: (__VLS_ctx.editorItem),
    section: (__VLS_ctx.store.activeSection === 'priceTables' ? 'osnovnye' : __VLS_ctx.store.activeSection),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_17;
let __VLS_18;
let __VLS_19;
const __VLS_20 = {
    onClose: (...[$event]) => {
        __VLS_ctx.editorOpen = false;
    }
};
const __VLS_21 = {
    onSave: (__VLS_ctx.saveEditor)
};
var __VLS_16;
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
/** @type {__VLS_StyleScopedClasses['price-matrix-tabs-break']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-card-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-matrix-table']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['desktop-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-table']} */ ;
/** @type {__VLS_StyleScopedClasses['popular-sizes-title']} */ ;
/** @type {__VLS_StyleScopedClasses['offer-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['price-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['flower-name-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-cell']} */ ;
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
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-col']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
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
/** @type {__VLS_StyleScopedClasses['currency-input-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['currency-input-sign']} */ ;
/** @type {__VLS_StyleScopedClasses['pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['row-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-section']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-category-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-category-toggle-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-section-list']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-flower-name']} */ ;
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
/** @type {__VLS_StyleScopedClasses['price-with-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['price-ruble']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-promo-value']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
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
/** @type {__VLS_StyleScopedClasses['mobile-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-checkbox-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
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
            CHRYZA_BUSH_250_ID: CHRYZA_BUSH_250_ID,
            uiLabels: uiLabels,
            visibleRows: visibleRows,
            selectedPriceTableId: selectedPriceTableId,
            priceTableGroups: priceTableGroups,
            activePriceTableGroup: activePriceTableGroup,
            mobileCardSections: mobileCardSections,
            isMobileCategoryOpen: isMobileCategoryOpen,
            selectMobileCategory: selectMobileCategory,
            isGroupStart: isGroupStart,
            getMinQty: getMinQty,
            getQty: getQty,
            isCarnationMix: isCarnationMix,
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
            handlePageClick: handlePageClick,
            onSectionChange: onSectionChange,
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
