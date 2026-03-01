import { defineStore } from 'pinia'
import { supabase } from '../../shared/supabase'
import { createDbCrudStoreOptions } from '../../shared/utils/db-crud-store'

const table = supabase.from('subtasks')
const crud = createDbCrudStoreOptions('subtasks')

export const useSubtaskStore = defineStore('subtasks',
  {
    ...crud,
    state: () => ({
      ...crud.state(),
      selectedTaskId: null as string | null,
    }),
    actions: {
      ...crud.actions,
      async refreshData(this: ReturnType<typeof useSubtaskStore>) {
        if (!this.selectedTaskId) {
          this.data = []
          this.loading = false
          return
        }

        this.loading = true
        const res = await table.select('*').match({ task_id: this.selectedTaskId })
        this.data = res.data ?? []
        this.loading = false
      },
      setSelectedTaskId(id: string | null) {
        this.selectedTaskId = id
      },
      async toggleComplete(id: string) {
        const currentValue = await table.select('completed').eq('id', id)
        if (!currentValue.data?.[0]) {
          throw new Error('Item not found')
        }
        await table.update({ completed: !currentValue.data[0].completed }).eq('id', id)
        await this.refreshData()
      },
      async getSubtasksByTaskId(taskId: string) {
        const res = await table.select('*').eq('task_id', taskId)
        return res.data ?? []
      }
    },
  }
)
