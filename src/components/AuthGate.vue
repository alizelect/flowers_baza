<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ unlocked: [boolean] }>()

const password = ref('')
const error = ref('')
const expected = import.meta.env.VITE_EDITOR_PASSWORD || 'flowers123'

function unlock(): void {
  if (password.value === expected) {
    error.value = ''
    emit('unlocked', true)
    return
  }
  error.value = 'Неверный пароль'
}
</script>

<template>
  <div class="auth-wrap">
    <input v-model="password" type="password" placeholder="Пароль редактора" />
    <button @click="unlock">Разблокировать редактирование</button>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
