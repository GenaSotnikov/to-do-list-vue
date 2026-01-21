<script setup lang="ts">
import type { Subtask } from './types'

const props = defineProps<{
  taskId: string
}>()
const emit = defineEmits<{
  (e: 'addSubtask', value: Subtask): void
}>()
function submitForm(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement
  const text = input.value.trim()
  if (text) {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      taskId: props.taskId,
    }
    // Here you would normally emit an event or call a method to add the subtask
    console.log('Adding subtask:', newSubtask)
    input.value = ''
    emit('addSubtask', newSubtask)
  }
}
</script>

<template>
  <input @keyup.enter="submitForm" class="input" type="text" placeholder="Add a new subtask" />
</template>
