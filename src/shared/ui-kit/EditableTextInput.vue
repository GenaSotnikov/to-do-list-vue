<script setup lang="ts">
import { defineProps, ref } from 'vue'
const isEditing = ref(false)

const model = defineModel<string>()
</script>

<template>
  <input
    @dblclick="isEditing = true"
    :readonly="!isEditing"
    class="input"
    v-model="model"
    @blur="isEditing = false"
  />
</template>

<style scoped></style>
