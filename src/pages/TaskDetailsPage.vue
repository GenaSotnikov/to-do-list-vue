<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import EditableTextInput from '../shared/ui-kit/EditableTextInput.vue'
import { useToDoItemsStore, type ToDoItem } from '../entities/to-do-item'
import { useSubtaskStore } from '../entities/subtask'
import AddSubtaskInput from '../entities/subtask/AddSubtaskInput.vue'
import EditableLi from '../shared/ui-kit/EditableLi.vue'

const route = useRoute()
const toDoItemsStore = useToDoItemsStore()
const subtasksStore = useSubtaskStore()
const taskId = route.params.id as string

const task = ref<ToDoItem | null>(null)

toDoItemsStore.getById(taskId).then((res) => {
  task.value = res
})

subtasksStore.setSelectedTaskId(taskId);
subtasksStore.refreshData();
</script>

<template>
  <p v-if="toDoItemsStore.itemLoading || subtasksStore.loading">Loading...</p>
  <p v-else-if="!task">Task not found.</p>
  <section v-else>
    <EditableTextInput class="task-name" v-model="task!.text" @blur="toDoItemsStore.patch(taskId, { text: task!.text })" />
    <EditableTextInput class="task-description" v-model="task!.description" />
    <h2>Subtasks</h2>
    <ul>
      <EditableLi
        v-for="subtask in subtasksStore.data"
        :key="subtask.id"
        :checked="subtask.completed"
        :text="subtask.text"
        @blur="subtasksStore.patch(subtask.id, { text: $event })"
        @update:checked="subtasksStore.toggleComplete(subtask.id)"
      />
    </ul>
    <AddSubtaskInput
      :taskId="taskId ?? ''"
      @addSubtask="(subtask) => subtasksStore.addItem(subtask)"
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
