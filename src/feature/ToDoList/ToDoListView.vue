<script lang="ts" setup>
import { type ToDoItem, ToDoItemView } from '../../entities/to-do-item'
const props = defineProps<{ items: ToDoItem[] }>()

const emit = defineEmits<{
  (e: 'removeItem', id: string): void
  (e: 'toggleComplete', id: string): void
}>()
</script>
<template>
  <div class="to-do">
    <ul>
      <ToDoItemView
        v-for="(todoItem, index) in props.items"
        :key="index"
        :item="todoItem"
        @onCompleteToggle="emit('toggleComplete', todoItem.id)"
        @onRemove="emit('removeItem', todoItem.id)"
      />
    </ul>
  </div>
</template>
<style>
@media (min-width: 1024px) {
  .to-do {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
.to-do ul {
  list-style-type: none;
  padding: 0;
}
</style>
