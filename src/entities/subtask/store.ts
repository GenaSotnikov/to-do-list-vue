import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Subtask } from './types'

export const useSubtaskStore = defineStore('subtasks', () => {
  const subtasks = ref<Subtask[]>([])

  function addSubtask(subtask: Subtask) {
    subtasks.value.push(subtask)
  }

  function removeSubtask(id: string) {
    subtasks.value = subtasks.value.filter((subtask) => subtask.id !== id)
  }

  function toggleSubtaskCompletion(id: string) {
    const subtask = subtasks.value.find((subtask) => subtask.id === id)
    if (subtask) {
      subtask.completed = !subtask.completed
    }
  }

  function getSubtasksByTaskId(taskId: string): Subtask[] {
    return subtasks.value.filter((subtask) => subtask.taskId === taskId)
  }

  return { subtasks, addSubtask, removeSubtask, toggleSubtaskCompletion, getSubtasksByTaskId }
})
