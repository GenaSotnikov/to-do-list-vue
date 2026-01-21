<script setup lang="ts">
import { type ToDoItem } from './types'
const emit = defineEmits<{
  (e: 'addItem', value: ToDoItem): void
}>()

function addItem(text: string) {
  const newItem: ToDoItem = {
    id: crypto.randomUUID(),
    text,
    completed: false,
  }
  emit('addItem', newItem)
}
</script>

<template>
  <input
    type="text"
    placeholder="Add a new to-do item"
    @keyup.enter="addItem((<any>$event.target)?.value)"
  />
</template>

<style>
input {
  padding: 0.5rem;
  margin-bottom: 1rem;
  width: 300px;
  font-size: 1rem;
}
</style>
