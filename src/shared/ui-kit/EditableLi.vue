<script setup lang="ts">
import EditableTextInput from './EditableTextInput.vue'
const props = defineProps<{ checked: boolean, text: string }>()
const modelValue = defineModel<string>('text')
const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void,
  (e: 'blur', value: string): void
}>();

modelValue.value = props.text
</script>

<template>
  <li>
    <button :class="{ checked: props.checked }" @click="emit('update:checked', !props.checked)">
      {{ props.checked ? '✔' : '' }}
    </button>
    <EditableTextInput v-model="modelValue" @blur="emit('blur', modelValue ?? '')" />
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
