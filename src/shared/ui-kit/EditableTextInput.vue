<script setup lang="ts">
import { ref } from 'vue'
const isEditing = ref(false)

const emit = defineEmits<{
  (e: 'blur'): void,
}>();

const model = defineModel<string>()
</script>

<template>
  <input
    @dblclick="isEditing = true"
    :readonly="!isEditing"
    class="input"
    v-model="model"
    @blur="isEditing = false; emit('blur')"
  />
</template>

<style scoped></style>
