import { SECTION_LABELS } from '../types';
const __VLS_props = defineProps();
const emit = defineEmits();
const sections = Object.keys(SECTION_LABELS);
const priceTablesSections = ['osnovnye', 'sezonnye'];
const sidebarTitle = '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438';
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.sidebarTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-menu-list" },
});
for (const [key] of __VLS_getVForSourceType((__VLS_ctx.sections))) {
    (key);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.emit('change', key);
            } },
        ...{ class: "menu-btn" },
        ...{ class: ({ active: __VLS_ctx.active === key }) },
    });
    (__VLS_ctx.SECTION_LABELS[key]);
    if (key === 'priceTables') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sidebar-submenu" },
        });
        for (const [subKey] of __VLS_getVForSourceType((__VLS_ctx.priceTablesSections))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(key === 'priceTables'))
                            return;
                        __VLS_ctx.emit('changePriceTablesSection', subKey);
                    } },
                key: (subKey),
                type: "button",
                ...{ class: "sidebar-submenu-btn" },
                ...{ class: ({ active: __VLS_ctx.active === 'priceTables' && __VLS_ctx.activePriceTablesSection === subKey }) },
            });
            (__VLS_ctx.SECTION_LABELS[subKey]);
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-footer" },
});
var __VLS_0 = {};
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-submenu']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-submenu-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SECTION_LABELS: SECTION_LABELS,
            emit: emit,
            sections: sections,
            priceTablesSections: priceTablesSections,
            sidebarTitle: sidebarTitle,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
