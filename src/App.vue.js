import { computed, onMounted, reactive, ref } from 'vue';
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
const oddOptions = Array.from({ length: 51 }, (_, i) => i * 2 + 1);
const hydrangeaOddOptions = Array.from({ length: 18 }, (_, i) => i * 2 + 1);
const mobileOpenCategory = ref('rose');
const CHRYZA_BUSH_250_ID = '72e51316-081c-46c8-8be2-86871bd63ec1';
const CHRYZA_SINGLE_ID = 'd30dc4f7-bba6-4ca5-88bf-11bb46dca6de';
const CHRYZA_BUSH_300_ID = '6aab0f2f-8d6e-42b7-a23e-c140b3563db3';
const CARNATION_MIX_ID = '9f340ce7-5f4a-4f3d-8e8f-1e165566aa01';
const MOBILE_PRIMARY_CATEGORY_ORDER = ['rose', 'alstroemerii', 'carnation', 'chryza', 'hydrangea'];
const MOBILE_PRIMARY_CATEGORY_LABELS = {
    rose: '\u0420\u043e\u0437\u044b',
    alstroemerii: '\u0410\u043b\u044c\u0441\u0442\u0440\u043e\u043c\u0435\u0440\u0438\u0438',
    carnation: '\u0413\u0432\u043e\u0437\u0434\u0438\u043a\u0438',
    chryza: '\u0425\u0440\u0438\u0437\u0430\u043d\u0442\u0435\u043c\u044b',
    hydrangea: '\u0413\u043e\u0440\u0442\u0435\u043d\u0437\u0438\u0438',
};
const mobileLabels = {
    edit: '\u0420\u0435\u0434.',
    delete: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
    qty: '\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e',
    qtyReset: '\u0441\u0431\u0440\u043e\u0441 \u043d\u0430 \u043c\u0438\u043d\u0438\u043c\u0443\u043c',
    popularSizes: '\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u044b',
    withoutPromo: '\u0411\u0435\u0437 \u0430\u043a\u0446\u0438\u0438',
    promo: '\u0410\u043a\u0446\u0438\u044f',
    flowerPrice: '\u0426\u0435\u043d\u0430 \u0446\u0432\u0435\u0442\u043a\u0430',
    pieces: '\u0448\u0442.',
    packaging: '\u0423\u043f\u0430\u043a\u043e\u0432\u043a\u0430',
    pistachio: '\u0424\u0438\u0441\u0442\u0430\u0448\u043a\u0430',
    enable: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c',
    empty: '\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u043d\u0435\u0442 \u0432 \u044d\u0442\u043e\u0439 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438',
};
const MAIN_ORDER = [
    'Р В Р С›Р вЂ”Р В« Р С—Р С• 150',
    'Р В Р С›Р вЂ”Р В« Р С—Р С• 250',
    'Р В Р С›Р вЂ”Р В« Р С—Р С• 300',
    'Р С’Р вЂєР В¬Р РЋР СћР В Р С›Р СљР вЂўР В Р ВР В',
    'Р вЂњР вЂ™Р С›Р вЂ”Р вЂќР ВР С™Р В - Р С•Р В±РЎвЂ№РЎвЂЎР Р…РЎвЂ№Р Вµ',
    'Р вЂњР вЂ™Р С›Р вЂ”Р вЂќР ВР С™Р В - Р В»РЎС“Р Р…Р Р…РЎвЂ№Р Вµ',
    'Р вЂњР вЂ™Р С›Р вЂ”Р вЂќР ВР С™Р В - Р СР С‘Р С”РЎРѓ',
    'Р ТђР В Р ВР вЂ”Р С’ - Р С”РЎС“РЎРѓРЎвЂљР С•Р Р†Р В°РЎРЏ Р С—Р С• 250',
    'Р ТђР В Р ВР вЂ”Р С’ - Р С”РЎС“РЎРѓРЎвЂљР С•Р Р†Р В°РЎРЏ Р С—Р С• 300',
    'Р ТђР В Р ВР вЂ”Р С’ - Р С•Р Т‘Р Р…Р С•Р С–Р С•Р В»Р С•Р Р†Р В°РЎРЏ',
    'Р вЂњР С›Р В Р СћР вЂўР СњР вЂ”Р ВР В',
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
const visibleRows = computed(() => {
    const bySection = store.filteredBySection;
    return [...bySection].sort((a, b) => {
        if (store.activeSection === 'osnovnye') {
            const ai = getMainOrderIndex(a);
            const bi = getMainOrderIndex(b);
            if (ai !== bi)
                return ai - bi;
            return a.flowerName.localeCompare(b.flowerName, 'ru');
        }
        return a.flowerName.localeCompare(b.flowerName, 'ru');
    });
});
const mobileCardSections = computed(() => {
    if (store.activeSection !== 'osnovnye') {
        return [{ key: 'all', label: '', items: visibleRows.value, collapsible: false }];
    }
    return MOBILE_PRIMARY_CATEGORY_ORDER
        .map((key) => ({
        key,
        label: MOBILE_PRIMARY_CATEGORY_LABELS[key],
        items: visibleRows.value.filter((item) => getFlowerGroup(item) === key),
        collapsible: true,
    }))
        .filter((section) => section.items.length > 0);
});
function getMobileOpenCategoryKey() {
    const firstSection = mobileCardSections.value.find((section) => section.collapsible);
    if (!firstSection) {
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
    mobileOpenCategory.value = key;
}
function getFlowerGroup(item) {
    if (isRose150(item) || isRose250(item) || isRose300(item))
        return 'rose';
    if (isAlstroemerii(item))
        return 'alstroemerii';
    if (isCarnationCommon(item) || isCarnationMoon(item) || isCarnationMix(item))
        return 'carnation';
    if (isChryzaSingle(item) || isChryzaBush250(item) || isChryzaBush300(item))
        return 'chryza';
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
    return name.includes('Р В°Р В»РЎРЉРЎРѓРЎвЂљРЎР‚Р С•Р СР ВµРЎР‚Р С‘Р С‘');
}
function isCarnationCommon(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('Р С–Р Р†Р С•Р В·Р Т‘Р С‘Р С”Р С‘ - Р С•Р В±РЎвЂ№РЎвЂЎР Р…РЎвЂ№Р Вµ');
}
function isCarnationMoon(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('Р С–Р Р†Р С•Р В·Р Т‘Р С‘Р С”Р С‘ - Р В»РЎС“Р Р…Р Р…РЎвЂ№Р Вµ');
}
function isCarnationMix(item) {
    return item.id === CARNATION_MIX_ID;
}
function isPeonies(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('Р С—Р С‘Р С•Р Р…РЎвЂ№');
}
function isTulips(item) {
    return item.id === '327eb882-6a93-45c5-bb20-8a53b19bc27e';
}
function isHydrangea(item) {
    const name = item.flowerName.trim().toLowerCase();
    return name.includes('Р С–Р С•РЎР‚РЎвЂљР ВµР Р…Р В·Р С‘Р С‘');
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
    qtyMap[item.id] = normalizeQty(item, value);
    activeRowId.value = item.id;
}
function resetQty(item) {
    qtyMap[item.id] = getMinQty(item);
    activeRowId.value = item.id;
}
function chooseSize(item, size) {
    qtyMap[item.id] = normalizeQty(item, size);
    activeRowId.value = item.id;
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
function isPistachioLocked(item) {
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
    if (section === 'osnovnye') {
        mobileOpenCategory.value = MOBILE_PRIMARY_CATEGORY_ORDER[0];
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.SECTION_LABELS[__VLS_ctx.store.activeSection]);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-actions" },
});
if (__VLS_ctx.store.unlocked) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onChooseFile) },
    });
}
if (__VLS_ctx.store.unlocked) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openCreate) },
    });
}
if (__VLS_ctx.store.unlocked) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "status-row" },
    });
    if (__VLS_ctx.store.fileName) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.store.fileName);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    if (__VLS_ctx.store.usingFallbackStorage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "warn" },
        });
    }
    if (__VLS_ctx.store.saveError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "error" },
        });
        (__VLS_ctx.store.saveError);
    }
}
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "popular-sizes-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
    ...{ class: "offer-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
    ...{ class: "promo-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
    ...{ class: "price-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
if (__VLS_ctx.store.unlocked) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.visibleRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
        key: (item.id),
        ...{ class: ({ 'is-active': __VLS_ctx.activeRowId === item.id, 'group-start': __VLS_ctx.isGroupStart(item, index) }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeRowId = item.id;
            } },
        ...{ class: "flower-name-cell" },
    });
    (item.flowerName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "qty-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (...[$event]) => {
                __VLS_ctx.chooseQty(item, Number($event.target.value));
            } },
        ...{ class: "center-input qty-select" },
        type: "number",
        min: (__VLS_ctx.getMinQty(item)),
        max: "101",
        step: "2",
        value: (__VLS_ctx.getQty(item)),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.resetQty(item);
            } },
        ...{ class: "qty-reset" },
        type: "button",
        'aria-label': "РЎРѓР В±РЎР‚Р С•РЎРѓ Р Р…Р В° 1",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ class: "qty-reset-icon" },
        src: (__VLS_ctx.resetIcon),
        alt: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sizes" },
    });
    for (const [size] of __VLS_getVForSourceType((item.popularSizes))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.chooseSize(item, size);
                } },
            key: (size),
            ...{ class: ({ active: __VLS_ctx.getQty(item) === size }) },
        });
        (size);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        ...{ class: "offer-divider" },
        ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
    });
    (__VLS_ctx.formatPrice(__VLS_ctx.calcWithoutPromoForRow(item, __VLS_ctx.getQty(item))));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        ...{ class: "promo-divider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "promo-col" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (...[$event]) => {
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
        ...{ class: "center-cell" },
        ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
    });
    (__VLS_ctx.formatPrice(__VLS_ctx.calcWithPromoForRow({ ...item, isPromoEnabled: true }, __VLS_ctx.getQty(item))));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        ...{ class: "price-divider" },
    });
    if (!__VLS_ctx.isCarnationMix(item)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
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
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mix-price-fields" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mix-price-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
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
            ...{ class: "mix-price-qty" },
        });
        (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).primary);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mix-price-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
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
            ...{ class: "mix-price-qty" },
        });
        (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).secondary);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (...[$event]) => {
                __VLS_ctx.store.patchFlower(item.id, { packagingPrice: Number($event.target.value) || 0 });
            } },
        ...{ class: "short-input center-input" },
        disabled: (__VLS_ctx.hasAutoPackagingByQty(item) || !__VLS_ctx.store.unlocked),
        type: "number",
        min: "0",
        value: (__VLS_ctx.getPackagingPrice(item, __VLS_ctx.getQty(item))),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pistachio-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (...[$event]) => {
                __VLS_ctx.store.patchFlower(item.id, { hasPistachio: $event.target.checked });
            } },
        type: "checkbox",
        checked: (__VLS_ctx.isPistachioLocked(item) ? false : item.hasPistachio),
        disabled: (__VLS_ctx.isPistachioLocked(item)),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (...[$event]) => {
                __VLS_ctx.store.patchFlower(item.id, { pistachioQty: Number($event.target.value) || 0 });
            } },
        ...{ class: "short-input center-input" },
        disabled: (!__VLS_ctx.store.unlocked || __VLS_ctx.isPistachioLocked(item) || __VLS_ctx.usesAutoPistachioQty(item)),
        type: "number",
        min: "0",
        value: (__VLS_ctx.isPistachioLocked(item) ? '' : __VLS_ctx.getPistachioQty(item, __VLS_ctx.getQty(item))),
    });
    if (__VLS_ctx.store.unlocked) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "row-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.store.unlocked))
                        return;
                    __VLS_ctx.openEdit(item);
                } },
            disabled: (!__VLS_ctx.store.unlocked),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.store.unlocked))
                        return;
                    __VLS_ctx.store.deleteFlower(item.id);
                } },
            disabled: (!__VLS_ctx.store.unlocked),
            ...{ class: "danger" },
        });
    }
}
if (!__VLS_ctx.visibleRows.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        colspan: (__VLS_ctx.store.unlocked ? 9 : 8),
        ...{ class: "empty" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mobile-cards" },
    ...{ class: ({ 'mobile-cards-grouped': __VLS_ctx.store.activeSection === 'osnovnye' }) },
});
if (__VLS_ctx.mobileCardSections.some((section) => section.items.length)) {
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.mobileCardSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.key),
            ...{ class: "mobile-section" },
        });
        if (section.collapsible) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
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
                    (__VLS_ctx.mobileLabels.edit);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
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
                    (__VLS_ctx.mobileLabels.delete);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-card-grid" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-field mobile-field-qty" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-label" },
                });
                (__VLS_ctx.mobileLabels.qty);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "qty-cell" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    ...{ onChange: (...[$event]) => {
                            if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                return;
                            if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                return;
                            __VLS_ctx.chooseQty(item, Number($event.target.value));
                        } },
                    ...{ class: "center-input qty-select" },
                    type: "number",
                    min: (__VLS_ctx.getMinQty(item)),
                    max: "101",
                    step: "2",
                    value: (__VLS_ctx.getQty(item)),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                return;
                            if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                return;
                            __VLS_ctx.resetQty(item);
                        } },
                    ...{ class: "qty-reset" },
                    type: "button",
                    'aria-label': (__VLS_ctx.mobileLabels.qtyReset),
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
                (__VLS_ctx.mobileLabels.popularSizes);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "sizes" },
                });
                for (const [size] of __VLS_getVForSourceType((item.popularSizes))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                        ...{ onClick: (...[$event]) => {
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
                    ...{ class: "mobile-metrics" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-metric" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-label" },
                });
                (__VLS_ctx.mobileLabels.withoutPromo);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                    ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                });
                (__VLS_ctx.formatPrice(__VLS_ctx.calcWithoutPromoForRow(item, __VLS_ctx.getQty(item))));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-metric" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-label" },
                });
                (__VLS_ctx.mobileLabels.promo);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-promo-value" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
                    ...{ onChange: (...[$event]) => {
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
                    ...{ class: ({ 'price-strong': __VLS_ctx.activeRowId === item.id }) },
                });
                (__VLS_ctx.formatPrice(__VLS_ctx.calcWithPromoForRow({ ...item, isPromoEnabled: true }, __VLS_ctx.getQty(item))));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "mobile-field" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-label" },
                });
                (__VLS_ctx.mobileLabels.flowerPrice);
                if (!__VLS_ctx.isCarnationMix(item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                        ...{ onInput: (...[$event]) => {
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
                }
                else {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mix-price-fields mobile-mix-price-fields" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mix-price-item" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                        ...{ onInput: (...[$event]) => {
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
                        ...{ class: "mix-price-qty" },
                    });
                    (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).primary);
                    (__VLS_ctx.mobileLabels.pieces);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mix-price-item" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                        ...{ onInput: (...[$event]) => {
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
                        ...{ class: "mix-price-qty" },
                    });
                    (__VLS_ctx.getMixQtySplit(__VLS_ctx.getQty(item)).secondary);
                    (__VLS_ctx.mobileLabels.pieces);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "mobile-field" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-label" },
                });
                (__VLS_ctx.mobileLabels.packaging);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    ...{ onInput: (...[$event]) => {
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
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mobile-field" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mobile-label" },
                });
                (__VLS_ctx.mobileLabels.pistachio);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "pistachio-cell mobile-pistachio-cell" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "mobile-checkbox" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    ...{ onChange: (...[$event]) => {
                            if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                return;
                            if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
                                return;
                            __VLS_ctx.store.patchFlower(item.id, { hasPistachio: $event.target.checked });
                        } },
                    type: "checkbox",
                    checked: (__VLS_ctx.isPistachioLocked(item) ? false : item.hasPistachio),
                    disabled: (__VLS_ctx.isPistachioLocked(item)),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.mobileLabels.enable);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    ...{ onInput: (...[$event]) => {
                            if (!(__VLS_ctx.mobileCardSections.some((section) => section.items.length)))
                                return;
                            if (!(!section.collapsible || __VLS_ctx.isMobileCategoryOpen(section.key)))
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
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty mobile-empty" },
    });
    (__VLS_ctx.mobileLabels.empty);
}
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
/** @type {[typeof FlowerEditorModal, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(FlowerEditorModal, new FlowerEditorModal({
    ...{ 'onClose': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.editorOpen),
    initial: (__VLS_ctx.editorItem),
    section: (__VLS_ctx.store.activeSection),
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClose': {} },
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.editorOpen),
    initial: (__VLS_ctx.editorItem),
    section: (__VLS_ctx.store.activeSection),
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
/** @type {__VLS_StyleScopedClasses['toolbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['status-row']} */ ;
/** @type {__VLS_StyleScopedClasses['warn']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['desktop-table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['price-table']} */ ;
/** @type {__VLS_StyleScopedClasses['popular-sizes-title']} */ ;
/** @type {__VLS_StyleScopedClasses['offer-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['price-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['flower-name-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-select']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sizes']} */ ;
/** @type {__VLS_StyleScopedClasses['offer-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['promo-col']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['price-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
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
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-select']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['qty-reset-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field-sizes']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sizes']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-promo-value']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-mix-price-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-item']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-price-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['short-input']} */ ;
/** @type {__VLS_StyleScopedClasses['center-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-input']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-field']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-pistachio-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-checkbox']} */ ;
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
            mobileLabels: mobileLabels,
            visibleRows: visibleRows,
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
            chooseQty: chooseQty,
            resetQty: resetQty,
            chooseSize: chooseSize,
            formatPrice: formatPrice,
            getMixQtySplit: getMixQtySplit,
            isPistachioLocked: isPistachioLocked,
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
