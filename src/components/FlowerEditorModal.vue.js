import { computed, reactive, watch } from 'vue';
import { DEFAULT_SIZES } from '../types';
const props = defineProps();
const emit = defineEmits();
const form = reactive({
    id: '',
    section: props.section,
    flowerName: '',
    photoUrl: '',
    unitPrice: 0,
    secondaryUnitPrice: 0,
    packagingPrice: 0,
    hasPistachio: true,
    pistachioQty: 0,
    pistachioUnitPrice: 80,
    discountPercent: 10,
    isPromoEnabled: false,
    popularSizes: [...DEFAULT_SIZES],
});
watch(() => props.modelValue, () => {
    if (!props.modelValue) {
        return;
    }
    Object.assign(form, {
        id: props.initial?.id || crypto.randomUUID(),
        section: props.initial?.section || props.section,
        flowerName: props.initial?.flowerName || '',
        photoUrl: '',
        unitPrice: props.initial?.unitPrice ?? 0,
        secondaryUnitPrice: props.initial?.secondaryUnitPrice ?? 0,
        packagingPrice: props.initial?.packagingPrice ?? 0,
        hasPistachio: props.initial?.hasPistachio ?? true,
        pistachioQty: props.initial?.pistachioQty ?? 0,
        pistachioUnitPrice: props.initial?.pistachioUnitPrice ?? 80,
        discountPercent: props.initial?.discountPercent ?? 10,
        isPromoEnabled: props.initial?.isPromoEnabled ?? false,
        popularSizes: props.initial?.popularSizes?.length ? [...props.initial.popularSizes] : [...DEFAULT_SIZES],
    });
}, { immediate: true });
const title = computed(() => (props.initial ? 'Редактирование' : 'Новый цветок'));
function submit() {
    emit('save', { ...form, popularSizes: [...form.popularSizes] });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.modelValue) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({});
    (__VLS_ctx.form.flowerName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.unitPrice);
    if (__VLS_ctx.form.flowerName === 'ГВОЗДИКИ - микс') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            type: "number",
            min: "0",
        });
        (__VLS_ctx.form.secondaryUnitPrice);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.packagingPrice);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.pistachioUnitPrice);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
        max: "99",
    });
    (__VLS_ctx.form.discountPercent);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.pistachioQty);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
    });
    (__VLS_ctx.form.isPromoEnabled);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
    });
    (__VLS_ctx.form.hasPistachio);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submit) },
        ...{ class: "primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modelValue))
                    return;
                __VLS_ctx.emit('close');
            } },
    });
}
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            form: form,
            title: title,
            submit: submit,
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
