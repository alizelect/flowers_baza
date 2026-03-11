import { SECTION_LABELS } from '../types';
const __VLS_props = defineProps();
const emit = defineEmits();
const sections = Object.keys(SECTION_LABELS);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
for (const [key] of __VLS_getVForSourceType((__VLS_ctx.sections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.emit('change', key);
            } },
        key: (key),
        ...{ class: "menu-btn" },
        ...{ class: ({ active: __VLS_ctx.active === key }) },
    });
    (__VLS_ctx.SECTION_LABELS[key]);
}
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SECTION_LABELS: SECTION_LABELS,
            emit: emit,
            sections: sections,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
