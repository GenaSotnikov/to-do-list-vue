<script lang="ts" setup>
import { ToDoItemInput, useToDoItemsStore } from '../entities/to-do-item'
import { ToDoList } from '../feature/ToDoList'

const store = useToDoItemsStore()
</script>

<template>
  <section>
    <h2>Pending Tasks</h2>
    <ToDoItemInput @add-item="store.addItem" />
    <ToDoList
      :items="store.pendingList"
      @remove-item="store.removeItem"
      @toggle-complete="store.toggleComplete"
    />
  </section>
  <section>
    <h2>Completed Tasks</h2>
    <ToDoList
      :items="store.completedList"
      @remove-item="store.removeItem"
      @toggle-complete="store.toggleComplete"
    />
  </section>
</template>
