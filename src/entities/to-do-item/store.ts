import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ToDoItem, ToDoItemPayload } from './types'
import { supabase } from '../../shared/supabase'

export const useToDoItemsStore = defineStore('toDoItem', () => {
  const table = supabase.from('todo_items');
  const todos = ref<ToDoItem[]>([]);
  const loading = ref(true);

  const completedList = computed(() => todos.value?.filter((todo) => todo.completed))
  const pendingList = computed(() => {
    return todos.value?.filter((todo) => !todo.completed);
  })

  function refreshData() {
    table.select('*').then(res => {
    todos.value = res.data || []; loading.value = false;
  });
  }

  async function addItem(item: ToDoItemPayload) {
    await table.insert(item);
    refreshData();
  }
  async function removeItem(id: string) {
    await table.delete().eq('id', id);
    refreshData()
  }
  async function toggleComplete(id: string) {
    const currentValue = await table.select('completed').eq('id', id);
    if (!currentValue.data?.[0]) {
      throw new Error('Item not found');
    }
    await table.update({ completed: !currentValue.data?.[0].completed }).eq('id', id);
    refreshData()
  }

  function getById(id: string): PromiseLike<ToDoItem | null | undefined> {
    return table.select('*').eq('id', id).then(res => res.data?.[0]);
  }

  refreshData();

  return { todos, completedList, pendingList, addItem, removeItem, toggleComplete, getById, loading }
})
