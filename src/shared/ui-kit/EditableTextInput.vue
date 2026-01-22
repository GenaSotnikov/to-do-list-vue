<script setup lang="ts">
import { ref } from 'vue'
const isEditing = ref(false)

const model = defineModel<string>()
</script>

<template>
  <p v-if="!isEditing" @dblclick="isEditing = true">{{ model }}</p>
  <input v-else class="input" v-model="model" @blur="isEditing = false" />
</template>
