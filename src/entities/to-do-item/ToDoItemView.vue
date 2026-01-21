<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { type ToDoItem } from './types'
const { item } = defineProps<{
  item: ToDoItem
}>()
const emit = defineEmits(['onRemove', 'onCompleteToggle'])
</script>

<template>
  <li class="to-do__li">
    <RouterLink :to="'to-do/' + item?.id" :class="{ 'to-do__label_completed': item?.completed }">
      {{ item?.text }}
    </RouterLink>
    <button class="to-do__complete" @click="emit('onCompleteToggle')">
      {{ item?.completed ? 'Undo' : 'Complete' }}
    </button>
    <button class="to-do__remove" @click="emit('onRemove')">Remove</button>
  </li>
</template>

<style>
.to-do__label_completed {
  text-decoration: line-through;
  color: #888;
}

.to-do__li {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  width: 300px;
  border-bottom: 1px solid #ccc;
}

.to-do__remove {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}
.to-do__complete {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  margin-right: 0.5rem;
}
.to-do__remove:hover {
  background-color: #ff1a1a;
}
.to-do__complete:hover {
  background-color: #45a049;
}
</style>
