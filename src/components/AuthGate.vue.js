import { ref } from 'vue';
const emit = defineEmits();
const password = ref('');
const error = ref('');
const expected = import.meta.env.VITE_EDITOR_PASSWORD || 'flowers123';
function unlock() {
    if (password.value === expected) {
        error.value = '';
        emit('unlocked', true);
        return;
    }
    error.value = 'Неверный пароль';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "password",
    placeholder: "Пароль редактора",
});
(__VLS_ctx.password);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.unlock) },
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "error" },
    });
    (__VLS_ctx.error);
}
/** @type {__VLS_StyleScopedClasses['auth-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            password: password,
            error: error,
            unlock: unlock,
        };
    },
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */
