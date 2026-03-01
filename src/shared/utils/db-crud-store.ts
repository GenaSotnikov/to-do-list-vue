import { supabase, type Database } from '../../shared/supabase'

export type CrudState<T> = { data: T[]; loading: boolean }

type SupabaseTable = keyof Database['public']['Tables']
type SupabaseRow<TableName extends SupabaseTable> =
  Database['public']['Tables'][TableName] extends { Row: infer TRow } ? TRow : never
type SupabaseInsert<TableName extends SupabaseTable> =
  Database['public']['Tables'][TableName] extends { Insert: unknown }
    ? Database['public']['Tables'][TableName]['Insert']
    : never
type SupabaseId<TableName extends SupabaseTable> =
  SupabaseRow<TableName> extends { id: infer TId } ? TId : string

type CrudActions<T, TInsert = Partial<T>, TId = string> = {
  refreshData: () => Promise<void>
  addItem: (item: TInsert) => Promise<T>
  removeItem: (id: TId) => Promise<void>
  getById: (id: TId) => Promise<T | null>
}

type CrudStoreThis<T, TInsert = Partial<T>, TId = string> = CrudState<T> & CrudActions<T, TInsert, TId>

type CrudStoreOptions<T, TInsert = Partial<T>, TId = string> = {
  state: () => CrudState<T>
  actions: CrudActions<T, TInsert, TId>
}

export function createDbCrudStoreOptions<TableName extends SupabaseTable>(
  tableName: TableName,
): CrudStoreOptions<SupabaseRow<TableName>, SupabaseInsert<TableName>, SupabaseId<TableName>> {
  const table = supabase.from(tableName)

  return {
    state: (): CrudState<SupabaseRow<TableName>> => ({ loading: true, data: [] }),
    actions: {
      async refreshData(
        this: CrudStoreThis<SupabaseRow<TableName>, SupabaseInsert<TableName>, SupabaseId<TableName>>,
      ) {
        const res = await table.select('*')
        this.data = (res.data as SupabaseRow<TableName>[] | null) ?? []
        this.loading = false
      },

      async addItem(
        this: CrudStoreThis<SupabaseRow<TableName>, SupabaseInsert<TableName>, SupabaseId<TableName>>,
        item: SupabaseInsert<TableName>,
      ) {
        const res = await table.insert(item).select('*')
        const createdItem = (res.data as SupabaseRow<TableName>[] | null)?.[0]
        if (!createdItem) {
          throw new Error('Failed to create item')
        }
        await this.refreshData()
        return createdItem
      },

      async removeItem(
        this: CrudStoreThis<SupabaseRow<TableName>, SupabaseInsert<TableName>, SupabaseId<TableName>>,
        id: SupabaseId<TableName>,
      ) {
        await table.delete().match({ id })
        await this.refreshData()
      },

      async getById(id: SupabaseId<TableName>) {
        const res = await table.select('*').match({ id })
        return ((res.data as SupabaseRow<TableName>[] | null)?.[0] ?? null) as SupabaseRow<TableName> | null
      },
    },
  }
}
