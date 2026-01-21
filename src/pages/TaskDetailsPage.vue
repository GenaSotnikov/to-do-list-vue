<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToDoItemsStore } from '../entities/to-do-item'
import { useSubtaskStore } from '../entities/subtask'
import AddSubtaskInput from '../entities/subtask/AddSubtaskInput.vue'
const route = useRoute()
const toDoItemsStore = useToDoItemsStore()
const subtasksStore = useSubtaskStore()
const taskId = route.params.id as string
const task = toDoItemsStore.getById(taskId)
const subtasks = computed(() => subtasksStore.getSubtasksByTaskId(taskId))
</script>

<template>
  <section>
    <h1>{{ task?.text }}</h1>
    <p>{{ task?.description }}</p>
    <h2>Subtasks</h2>
    <ul>
      <li v-for="subtask in subtasks" :key="subtask.id">
        <span :class="{ 'to-do__label_completed': subtask.completed }">
          {{ subtask.text }}
        </span>
      </li>
    </ul>
    <AddSubtaskInput
      :taskId="taskId"
      @addSubtask="(subtask) => subtasksStore.addSubtask(subtask)"
    />
  </section>
</template>
