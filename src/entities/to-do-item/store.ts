import { defineStore } from 'pinia'
import { supabase } from '../../shared/supabase'
import { createDbCrudStoreOptions } from '../../shared/utils/db-crud-store'

const table = supabase.from('todo_items')
const crud = createDbCrudStoreOptions('todo_items')

export const useToDoItemsStore = defineStore('toDoItem', {
  ...crud,

  getters: {
    completedList: (state) => state.data.filter((todo) => todo.completed),
    pendingList: (state) => state.data.filter((todo) => !todo.completed),
  },

  actions: {
    ...crud.actions,

    async toggleComplete(id: string) {
      const currentValue = await table.select('completed').eq('id', id)
      if (!currentValue.data?.[0]) {
        throw new Error('Item not found')
      }
      await table.update({ completed: !currentValue.data[0].completed }).eq('id', id)
      await this.refreshData()
    },
  },
})
