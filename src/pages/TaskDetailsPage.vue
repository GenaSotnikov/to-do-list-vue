<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EditableTextInput from '../shared/ui-kit/EditableTextInput.vue'
import { useToDoItemsStore } from '../entities/to-do-item'
import { useSubtaskStore } from '../entities/subtask'
import AddSubtaskInput from '../entities/subtask/AddSubtaskInput.vue'
import EditableLi from '../shared/ui-kit/EditableLi.vue'
const route = useRoute()
const toDoItemsStore = useToDoItemsStore()
const subtasksStore = useSubtaskStore()
const taskId = route.params.id as string
const task = toDoItemsStore.getById(taskId)
const subtasks = computed(() => subtasksStore.getSubtasksByTaskId(taskId))
</script>

<template>
  <section>
    <EditableTextInput class="task-name" v-model="task!.text" />
    <EditableTextInput class="task-description" v-model="task!.description" />
    <h2>Subtasks</h2>
    <ul>
      <EditableLi
        v-for="subtask in subtasks"
        :key="subtask.id"
        v-model:text="subtask.text"
        v-model:checked="subtask.completed"
      />
    </ul>
    <AddSubtaskInput
      :taskId="taskId"
      @addSubtask="(subtask) => subtasksStore.addSubtask(subtask)"
    />
  </section>
</template>

<style scoped>
.task-name {
  font-size: 24px;
  font-weight: bold;
}
.task-description {
  font-size: 18px;
}
</style>
