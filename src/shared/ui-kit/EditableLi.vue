<script setup lang="ts">
import EditableTextInput from './EditableTextInput.vue'
const textModel = defineModel<string>('text', { default: '' })
const checked = defineModel<boolean>('checked', { default: false })
</script>

<template>
  <li>
    <button :class="{ checked }" @click="checked = !checked">
      {{ checked ? '✔' : '' }}
    </button>
    <EditableTextInput v-model="textModel" />
  </li>
</template>

<style scoped>
li {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
}
button {
  border-radius: 100%;
  height: 18px;
  width: 18px;
  font-size: 12px;
  line-height: 12px;
  text-align: center;
  border-width: 1px;
  padding: 0;
}
.checked {
  background-color: #4caf50;
  color: white;
  border-color: transparent;
  border-width: 0px;
}
</style>
