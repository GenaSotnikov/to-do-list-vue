import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ToDoItem } from './types'

export const useToDoItemsStore = defineStore('toDoItem', () => {
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

  function getById(id: string): ToDoItem | undefined {
    return todos.value.find((todo) => todo.id === id)
  }

  return { todos, completedList, pendingList, addItem, removeItem, toggleComplete, getById }
})
