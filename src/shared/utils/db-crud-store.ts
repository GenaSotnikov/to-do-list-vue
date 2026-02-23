import { supabase, type Database } from '../../shared/supabase'

export type CrudState<T> = { data: T[]; loading: boolean }

type SupabaseTable = keyof Database['public']['Tables']
type SupabaseInsert<TableName extends SupabaseTable> =
  Database['public']['Tables'][TableName]['Insert']

type CrudActions<T, TInsert = Partial<T>> = {
  refreshData: () => Promise<void>
  addItem: (item: TInsert) => Promise<T>
  removeItem: (id: string) => Promise<void>
  getById: (id: string) => Promise<T | null>
}

type CrudStoreThis<T, TInsert = Partial<T>> = CrudState<T> & CrudActions<T, TInsert>

type CrudStoreOptions<T, TInsert = Partial<T>> = {
  state: () => CrudState<T>
  actions: CrudActions<T, TInsert>
}

export function createDbCrudStoreOptions<
  EntityType,
  TableName extends SupabaseTable = SupabaseTable,
>(tableName: TableName): CrudStoreOptions<EntityType, SupabaseInsert<TableName>> {
  const table = supabase.from(tableName)

  return {
    state: (): CrudState<EntityType> => ({ loading: true, data: [] }),
    actions: {
      async refreshData(this: CrudStoreThis<EntityType, SupabaseInsert<TableName>>) {
        const res = await table.select('*')
        this.data = (res.data as EntityType[]) || []
        this.loading = false
      },

      async addItem(
        this: CrudStoreThis<EntityType, SupabaseInsert<TableName>>,
        item: SupabaseInsert<TableName>,
      ) {
        const res = await table.insert(item).select('*')
        await this.refreshData()
        return res.data?.[0] as EntityType
      },

      async removeItem(this: CrudStoreThis<EntityType, SupabaseInsert<TableName>>, id: string) {
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
