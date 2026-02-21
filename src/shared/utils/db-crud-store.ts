import { supabase, type Database } from '../../shared/supabase'

export type CrudState<T> = { data: T[]; loading: boolean }

type SupabaseTable = keyof Database['public']['Tables']

type CrudActions<T> = {
  refreshData: () => Promise<void>
  addItem: (item: Partial<T>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  getById: (id: string) => Promise<T | null>
}

type CrudStoreThis<T> = CrudState<T> & CrudActions<T>

type CrudStoreOptions<T> = {
  state: () => CrudState<T>
  actions: CrudActions<T>
}

export function createDbCrudStoreOptions<EntityType>(
  tableName: SupabaseTable,
): CrudStoreOptions<EntityType> {
  const table = supabase.from(tableName)

  return {
    state: (): CrudState<EntityType> => ({ loading: true, data: [] }),
    actions: {
      async refreshData(this: CrudStoreThis<EntityType>) {
        const res = await table.select('*')
        this.data = (res.data as EntityType[]) || []
        this.loading = false
      },

      async addItem(this: CrudStoreThis<EntityType>, item: Partial<EntityType>) {
        // TODO: unsafe typing
        await table.insert(item as typeof table.insert.arguments[0])
        await this.refreshData()
      },

      async removeItem(this: CrudStoreThis<EntityType>, id: string) {
        await table.delete().eq('id', id)
        await this.refreshData()
      },

      async getById(id: string) {
        // TODO: unsafe typing
        const res = await table.select('*').eq('id', id)
        return (res.data?.[0] as EntityType | undefined) ?? null
      },
    },
  }
}
