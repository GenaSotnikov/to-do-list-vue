<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ToDoItemInput, type ToDoItem } from '../entities/ToDoItem'
import { ToDoList } from '../feature/ToDoList'
const todos = ref<ToDoItem[]>([])
const completedList = computed(() => todos.value.filter((todo) => todo.completed))
const pendingList = computed(() => todos.value.filter((todo) => !todo.completed))
function addItem(item: ToDoItem) {
  todos.value.push(item)
}
function removeItem(id: string) {
  todos.value = todos.value.filter((todo) => todo.id !== id)
}
function toggleComplete(id: string) {
  const todo = todos.value.find((todo) => todo.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}
</script>
<template>
  <section>
    <h2>Pending Tasks</h2>
    <ToDoItemInput @add-item="addItem" />
    <ToDoList
      :items="pendingList"
      @add-item="addItem"
      @remove-item="removeItem"
      @toggle-complete="toggleComplete"
    />
  </section>
  <section>
    <h2>Completed Tasks</h2>
    <ToDoList
      :items="completedList"
      @add-item="addItem"
      @remove-item="removeItem"
      @toggle-complete="toggleComplete"
    />
  </section>
</template>
